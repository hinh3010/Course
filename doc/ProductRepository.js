const Repository = require('./Repository');
const { Product: ProductModel } = require('../database/models/website/Product');
const ObjectId = require('mongoose').Types.ObjectId;
const { ProductMedia } = require('../database/models/website/ProductMedia');
const { Category } = require('../database/models/website/Category');
const { FulfillmentLocation } = require('../database/models/website/FulfillmentLocation');
const { ProductMediaRepository } = require('./ProductMediaRepository');
const { ProductVariantRepository } = require('./ProductVariantRepository');
const { ProductStandardVariantRepository } = require('./ProductStandardVariantRepository');
const { ProductPriceRepository } = require('./ProductPriceRepository');
const { ShipPriceRepository } = require('./ShipPriceRepository');
const conn = require('../database/connections/website');
const slugify = require('slugify');
const { toSlug } = require('../../utils/toSlug');
const _ = require('lodash');

class ProductRepository extends Repository {
    constructor(productModel, productMediaRepository, productVariantRepository, productPriceRepository, shipPriceRepository, productStandardVariantRepository, fulfillmentLocation) {
        super(productModel);
        this.productMediaRepository = productMediaRepository;
        this.productVariantRepository = productVariantRepository;
        this.productPriceRepository = productPriceRepository;
        this.shipPriceRepository = shipPriceRepository;
        this.productStandardVariantRepository = productStandardVariantRepository
        this.fulfillmentLocation = fulfillmentLocation
    }

    /**
     * @private
     */
    _transformOptions(options) {
        // sorted options
        const sortOrder = { TIERS: 1, TYPES: 2, COLORS: 3, SIZES: 4 };

        options.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            const orderA = sortOrder[nameA] || Infinity;
            const orderB = sortOrder[nameB] || Infinity;

            return orderA - orderB;
        });
        
        return options.map(option => {
            const { name, meta_values, selected_value, values, customized = false, label } = option;
            if (name === 'COLORS' && meta_values?.length > 0) {
                option.meta_values = meta_values.map(value => ({ ...value, type: name }));
                option.values = meta_values.map(value => value.text);
            } else {
                option.meta_values = values.map(value => ({ text: value, code: toSlug(value), type: name }));
            }

            if (values && !values.includes(selected_value)) {
                option.selected_value = values[0];
            }

            option.label = label || name;
            option.customized = (name !== 'TIERS') ? customized : undefined;

            return option;
        })
    }

    async getProductDetail(slug) {
        const vSlug = slug
            .replace(/\(/gi, '\\\(')
            .replace(/\)/gi, '\\\)')
        // .replace(/\&/gi, '\\\&')


        const regex = new RegExp(`^${vSlug}$`, 'i')

        return this.model.find(
            {
                slug: regex,
                deleted_at: null
            }
      
        )
            .populate({
                path: 'media',
                options: {
                    sort: { order: 1 }
                }
            })
            .populate('categories')
            .populate('primary_category')
            .populate('techniques')
            .populate('default_variant')
            .populate('fulfillment_location')
            .populate('print_areas')
            .lean()
    }

    async getProductDetailById(id) {
        let product = await this.model.findOne({
                _id: id,
                deleted_at: null
            }).populate({
                path: 'media',
                options: {
                    sort: { order: 1 }
                }
            })
            // .populate('categories')
            // .populate('techniques')
            .populate('default_variant')
            // .populate('fulfillment_location')
            // .populate('print_areas')
            .lean()

        let variants = []
        let standard_variants = []
        if(product) {
            const result = await this.getVariantsAndStandardVariantsByProduct(product._id)
            variants = result?.variants || []
            standard_variants = result?.standardVariants || []
            
            product.variants = variants
            product.standard_variants = standard_variants
            product.min_production_time = product.production_time?.min
            product.max_production_time = product.production_time?.max
        }

        return product
    }

    async getRelatedProduct(categoryId, productId) {
        const query = {
            primary_category: categoryId,
            _id: { $ne: productId },
            deleted_at: null,
            status: { $ne: 'inactive' }
        }
        return this.model.aggregate([
            {
                $match: query
            },
            {
                $sample: { size: 6 }
            },
        ])
    }

    async getDetailRelateProduct(relatedProductId) {
        return this.model.find(
            {
                _id: { $in: relatedProductId },
            },
            {
                tags: 1,
                slug: 1,
                _id: 1,
                title: 1,
                sku: 1,
                options: 1,
                price: 1
            },
        )
            .populate({
                path: 'media',
                select: 'source order',
                options: {
                    sort: { order: 1 }
                }
            })
            .populate('default_variant')
            .lean()
    }


    /**
     * 
     * @param {String[][]} orderby
     * @param {ObjectId[]} tech
     * @param {String} s
     * @param {ObjectId[]} categories
     * @param {Number} page
     * @param {Number} limit
     * @returns 
     */
    async searchProduct({ category, orderby, techs, s, categories, page, limit, fulfillment_location, print_area, order }) {
        const query = {
            status: 'active',
            is_published: true,
            deleted_at: null,
        };

        if (s) {
            query["$or"] = [
                { title: { $regex: s, $options: 'i' } },
                { "$text": { $search: s } }
            ]
        }

        if (fulfillment_location && fulfillment_location.length > 0) {
            fulfillment_location = fulfillment_location.map((item) => {
                return new ObjectId(item);
            });
            query.fulfillment_location = { $in: fulfillment_location };
        }

        if (print_area && print_area.length > 0) {
            print_area = print_area.map((item) => {
                return new ObjectId(item);
            });
            query.print_areas = { $in: print_area };
        }

        if (techs && techs.length > 0) {
            techs = techs.map((tech) => {
                return new ObjectId(tech);
            });
            query.techniques = { $in: techs };
        }

        if (categories && categories.length > 0) {
            categories = categories.map((category) => {
                return new ObjectId(category);
            });

            query.categories = { $all: categories };
        }

        if (category && category.length > 0) {
            category = await Category.findOne({ slug: category[category.length - 1] }).select('_id');
            if (category) {
                query.categories = category._id;
            } else {
                throw new Error("404") // cannot find category
            }
        }

        let cursor = ProductModel.find(query, {score: {$meta: "textScore"}})
            .where('deleted_at').equals(null)
            .where('status').equals('active')

        const total = await cursor.clone().countDocuments();

        let sort = {};

        if (s) {
            sort.score = { $meta: "textScore" };
        }

        if (orderby && orderby.length > 0) {
            sort[orderby] = order === 'asc' ? 1 : -1;
        } else {
            sort.popularity = -1;
        }

        if (Object.keys(sort).length > 0) {
            cursor = cursor.sort(sort);
        }

        if (!limit || limit < 0) {
            limit = 20;
        }
        cursor = cursor.limit(limit);

        if (page && page > 0) {
            cursor = cursor.skip((page - 1) * limit);
        } else {
            cursor = cursor.skip(0);
        }

        const products = await cursor.lean();

        const fullProduct = await this.model.populate(products, [
            { strictPopulate: false, path: 'media', model: ProductMedia, options: { sort: { order: 1, _id: 1 } } },
            { strictPopulate: false, path: 'techniques', model: 'Technique' },
            { strictPopulate: false, path: 'categories', model: 'Category' },
            { strictPopulate: false, path: 'print_area', model: 'PrintArea' },
            { strictPopulate: false, path: 'fulfillment_location', model: 'FulfillmentLocation' },
            { strictPopulate: false, path: 'default_variant', model: 'ProductVariant' },
        ]);

        let prices = await this.model.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    min: { $min: "$price" },
                    max: { $max: "$price" }
                }
            }
        ])

        prices = prices[0] || { min: 0, max: 0 };

        return {
            total,
            products: fullProduct,
            page,
            limit,
            highPrice: prices.max,
            lowPrice: prices.min
        };
    }

    async getListProduct({ limit, page }) {
        const vLimit = limit > 0 ? parseInt(limit, 10) : 20
        const vPage = page > 1 ? parseInt(page, 10) : 1
        const skip = (vPage - 1) * vLimit
        const data = await this.model.find().where('deleted_at').equals(null)
            .limit(vLimit)
            .skip(skip)
            .lean()
            .populate({
                path: 'media',
                options: { sort: { order: 1 } }
            })
        const total = await this.model.countDocuments().where('deleted_at').equals(null);

        if (!data) {
            throw new Error(`Not found record`);
        }

        return { data, total, limit: vLimit, page: vPage };
    }

    /**
     * @private
     */
    async _genSku({ fulfillment_location, sku_prefix }) {
        const location = await this.fulfillmentLocation.findById(fulfillment_location).select('code').lean()
        if (!location?.code) throw new Error('This fulfillment location not found, try again')
        const sku = sku_prefix?.toUpperCase() + location.code

        const existsSku = await this.exists({ sku })
        if (existsSku) throw new Error('This product SKU is already existed, please change your SKU product prefix or Fulfillment Location')

        return sku
    }

    /**
     * @private
     */
    async _checkExistsTitleProduct(productData, currId) {
        const { title} = productData

        const existsTitle = await this.exists({ title, deleted_at: { $exists: false }, ...(currId && { _id: { $ne: currId } }) })
        if (existsTitle) throw new Error('This product name is already existed, try again')
    }

    /**
     * @private
     */
    _genProductionTime(productData) {
        const { min_production_time, max_production_time, ...rest } = productData

        if (min_production_time === undefined && max_production_time === undefined) return { ...rest }

        let production_time = {
            min: min_production_time || null,
            max: max_production_time || null,
            unit: 'days'
        };

        if (min_production_time !== undefined && max_production_time !== undefined) {
            if (min_production_time > max_production_time) {
                throw new Error('Invalid production times. The maximum production time must be greater than the minimum production time.');
            }
        }

        return {
            ...rest,
            production_time
        }
    }

    async create(data) {
        const session = await conn.startSession();
        session.startTransaction();
        try {
            data = this._genProductionTime(data)
            await this._checkExistsTitleProduct(data)
            data.sku = await this._genSku(data)

            const { slug, title, options } = data
            if (!slug) data.slug = slugify(title, { lower: true });

            data.status = 'inactive'

            let standardOptions = []
            if(options.length > 0) {
                const options_text = options.map((item) => item.name).join(', ');
                data.options_text = options_text

                data.options = this._transformOptions(options)
                standardOptions = [...data.options].filter(option => option.name !== "TIERS")
            }

            const product = new this.model(data);

            await product.save({ session });
            if (product.options.length) await this.productVariantRepository.overwriteFromOptions({ options: product.options, productId: product._id }, session)
            if (standardOptions.length) await this.productStandardVariantRepository.createStandardVariant({ options: standardOptions, productId: product._id, productSku: product.sku }, session)

            await session.commitTransaction();
            session.endSession();

            const { variants, standardVariants } = await this.getVariantsAndStandardVariantsByProduct(product._id)
            product.variants = variants
            product.standard_variants = standardVariants

            return product;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getVariantsAndStandardVariantsByProduct(productId) {
        const variantsPromise = productId ? this.productVariantRepository.getAllByField("product", productId) : Promise.resolve([]);
        const standardVariantsPromise = productId ? this.productStandardVariantRepository.getAllByField("product", productId) : Promise.resolve([]);

        const [variants, standardVariants] = await Promise.all([variantsPromise, standardVariantsPromise]);

        return { variants, standardVariants };
    }

    async update(id, data) {
        const session = await conn.startSession();
        session.startTransaction();
        try {
            data = this._genProductionTime(data)

            const { title, fulfillment_location, sku_prefix, options = [], key } = data

            const isInformationTab = key === "information"

            const currProduct = await this.model.findById(id).select('title fulfillment_location sku_prefix options').lean()
            const { 
                title: currTitle, fulfillment_location: currLocation, 
                _id: currId, sku_prefix: currSkuPrefix, options: currOptions
            } = currProduct

            if (isInformationTab && title !== currTitle){
                await this._checkExistsTitleProduct(data, currId)
            }

            if (!data.slug && data.title) {
                data.slug = slugify(data.title, { lower: true });
            }

            const newFulfillmentLocation = fulfillment_location || currLocation.toString();
            const newSkuPrefix = sku_prefix || currSkuPrefix;
            const isChangeSku = (newFulfillmentLocation !== currLocation.toString() || newSkuPrefix !== currSkuPrefix);

            if (isInformationTab && isChangeSku) {
                data.sku = await this._genSku({
                    fulfillment_location: newFulfillmentLocation,
                    sku_prefix: newSkuPrefix
                })
            }
            
            let mediaIds = [];
            if(Array.isArray(data.media)) {
                await this.productMediaRepository.destroyMany({ product: id }, { session });

                const bulkOp = data.media.map((media) => ({ ...media, product: id }))
                let medias = await this.productMediaRepository.bulkCreate(bulkOp, { session });
                mediaIds = medias.map((item) => {
                    return item._id;
                })
                data.media = mediaIds;
            }

            let standardOptions = []
            if (options.length > 0) {
                const newOptions = currOptions.map(option => {
                    const optionId = option._id.toString();
                    const newOption = options.find(newOpt => newOpt._id === optionId);

                    if (newOption && newOption.selected_value && option.values.includes(newOption.selected_value)) {
                        return { ...option, selected_value: newOption.selected_value };
                    }

                    return option;
                });

                if (isInformationTab){
                    const options_text = options.map((item) => item.name).join(', ');
                    data.options_text = options_text
    
                    data.options = this._transformOptions(options)
                    standardOptions = [...data.options].filter(option => option.name !== "TIERS")
                } else {
                    data.options = newOptions
                }
            } else {
                delete data.options
            }
            
            const product = await this.model.findOneAndUpdate({_id: id}, data, { returnDocument: 'after', session, new: true });

            if (isInformationTab) {
                if (standardOptions.length || isChangeSku) await this.productStandardVariantRepository.overwriteFromStandardOptions({ options: standardOptions, productId: id, productSku: product.sku }, session)
                if (data.options?.length) await this.productVariantRepository.overwriteFromOptions({ options: data.options, productId: id }, session)
            }

            await session.commitTransaction();
            session.endSession();

            const { variants, standardVariants } = await this.getVariantsAndStandardVariantsByProduct(product._id)
            product.variants = variants
            product.standard_variants = standardVariants

            return product;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async deleteOrFail(id) {
        const entity = await this.model.findOneAndUpdate({ _id: id, deleted_at: { $exists: false } }, { deleted_at: new Date() }, { new: true });
        if (!entity) throw new Error(`Product ID: ${id} not found`);

        return entity;
    }

    async updateSeo(id, data) {
        let {title_seo, description_seo} = data;

        return this.model.findOneAndUpdate({_id: id}, {title_seo, description_seo}, { returnDocument: 'after' });
    }

    async updatePricing(id, data) {
        const session = await conn.startSession();
        session.startTransaction();
        try {
            let product = await this.model.findOne({_id: id});
            //delete old price
            await Promise.all([
                this.productPriceRepository.destroyMany({ product: id }, { session }),
                this.shipPriceRepository.destroyMany({ product: id }, { session })
            ])
            let productPrices = [];
            let shipPrices = [];
            if(data && data.length > 0) {
                data.forEach(element => {
                    // add bulk write
                    if(element.tier1) {
                        productPrices.push({
                            updateOne: {
                                filter: { 
                                    product: id,
                                    [element.option_name]: element[element.option_name],
                                    tier: 'TIER1',
                                },
                                update: { 
                                    $set: { 
                                        product: id,
                                        [element.option_name]: element[element.option_name],
                                        tier: 'TIER1',
                                        price: element.tier1,
                                        sku: product.sku,
                                        created_at: new Date(),
                                    }
                                },
                                upsert: true
                            }
                        })
                    }

                    if(element.tier2) {
                        productPrices.push({
                            updateOne: {
                                filter: { 
                                    product: id,
                                    [element.option_name]: element[element.option_name],
                                    tier: 'TIER2',
                                },
                                update: { 
                                    $set: { 
                                        product: id,
                                        [element.option_name]: element[element.option_name],
                                        tier: 'TIER2',
                                        price: element.tier2,
                                        sku: product.sku,
                                        created_at: new Date(),
                                    }
                                },
                                upsert: true
                            }
                        })
                    }

                    if(element.tier3) {
                        productPrices.push({
                            updateOne: {
                                filter: { 
                                    product: id,
                                    [element.option_name]: element[element.option_name],
                                    tier: 'TIER3'
                                },
                                update: { 
                                    $set: { 
                                        product: id,
                                        [element.option_name]: element[element.option_name],
                                        tier: 'TIER3',
                                        price: element.tier3,
                                        sku: product.sku,
                                        created_at: new Date(),
                                    }
                                },
                                upsert: true
                            }
                        })
                    }

                    if(element.base_cost) {
                        productPrices.push({
                            updateOne: {
                                filter: { 
                                    product: id,
                                    [element.option_name]: element[element.option_name],
                                },
                                update: { 
                                    $set: { 
                                        product: id,
                                        [element.option_name]: element[element.option_name],
                                        price: element.base_cost,
                                        sku: product.sku,
                                        created_at: new Date(),
                                    }
                                },
                                upsert: true
                            }
                        })
                    }

                    if(element.first_item_price_us) {
                        let first_item_price = isNaN(Number(element.first_item_price_us)) ? null : Number(element.first_item_price_us).toFixed(2);
                        let additional_item_price = element.additional_item_price_us ? isNaN(Number(element.additional_item_price_us)) ? null : Number(element.additional_item_price_us).toFixed(2) : null
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'US',
                                    [element.option_name]: element[element.option_name],
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "US",
                                        first_item_price,
                                        additional_item_price,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }

                    if(element.first_item_price_eu) {
                        let first_item_price = isNaN(Number(element.first_item_price_eu)) ? null : Number(element.first_item_price_eu).toFixed(2);
                        let additional_item_price = element.additional_item_price_eu ? isNaN(Number(element.additional_item_price_eu)) ? null : Number(element.additional_item_price_eu).toFixed(2) : null
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'EU',
                                    [element.option_name]: element[element.option_name],
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "EU",
                                        first_item_price,
                                        additional_item_price,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }

                    if(element.first_item_price_au) {
                        let first_item_price = isNaN(Number(element.first_item_price_au)) ? null : Number(element.first_item_price_au).toFixed(2);
                        let additional_item_price = element.additional_item_price_au ? isNaN(Number(element.additional_item_price_au)) ? null : Number(element.additional_item_price_au).toFixed(2) : null
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'AU',
                                    [element.option_name]: element[element.option_name],
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "AU",
                                        first_item_price,
                                        additional_item_price,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }

                    if(element.first_item_price_ww) {
                        let first_item_price = isNaN(Number(element.first_item_price_ww)) ? null : Number(element.first_item_price_ww).toFixed(2);
                        let additional_item_price = element.additional_item_price_ww ? isNaN(Number(element.additional_item_price_ww)) ? null : Number(element.additional_item_price_ww).toFixed(2) : null
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'WW',
                                    [element.option_name]: element[element.option_name],
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "WW",
                                        first_item_price,
                                        additional_item_price,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }

                    if(element.first_item_price_row) {
                        let first_item_price = element.first_item_price_row ? isNaN(Number(element.first_item_price_row)) ? null : Number(element.first_item_price_row).toFixed(2) : null
                        let additional_item_price = element.additional_item_price_row ? isNaN(Number(element.additional_item_price_row)) ? null : Number(element.additional_item_price_row).toFixed(2) : null
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'ROW',
                                    [element.option_name]: element[element.option_name],
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "ROW",
                                        first_item_price,
                                        additional_item_price,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }

                    if(element.fast_shipping_us || element.express_shipping_us) {
                        let fast_shipping = element.fast_shipping_us ? isNaN(Number(element.fast_shipping_us)) ? null : Number(element.fast_shipping_us).toFixed(2) : null;
                        let express_shipping = element.express_shipping_us ? isNaN(Number(element.express_shipping_us)) ? null : Number(element.express_shipping_us).toFixed(2) : null;
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'US',
                                    [element.option_name]: element[element.option_name],
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "US",
                                        fast_shipping,
                                        express_shipping,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }

                    if(element.post_service) {
                        let post_service = element.post_service ? isNaN(Number(element.post_service)) ? null : Number(element.post_service).toFixed(2) : null;
                        shipPrices.push({
                            updateOne: {
                                filter: {
                                    product: id,
                                    ship_location: 'US',
                                    [element.option_name]: element[element.option_name],
                                    $or: [
                                        { post_service: { $exists: true } },
                                        { post_service: { $type: 10 } }
                                    ]
                                },
                                update: {
                                    $set: {
                                        product: id,
                                        ship_location: "US",
                                        post_service,
                                        [element.option_name]: element[element.option_name],
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                },
                                upsert: true
                            }
                        })    
                    }
                });
            }

            await Promise.all([
                this.productPriceRepository.bulkWrite(productPrices, { session }),
                this.shipPriceRepository.bulkWrite(shipPrices, { session }),
            ])

            this.productVariantRepository.correctPriceVariant(id, session)
            
            // await this.productPriceRepository.bulkWrite(productPrices, { session });
            // await this.shipPriceRepository.bulkWrite(shipPrices, { session });
            // await this.productVariantRepository.correctPriceVariant(id, session );

            await session.commitTransaction();
            session.endSession();

            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getProductsForCatalog({ status } = {}) {
        const $match = {}

        if(status) {
            $match.status = status
        }

        return ProductModel.aggregate([
            {
                $match,
            }, {
                '$project': {
                    '_id': 1,
                    'media': 1,
                    'title': 1,
                    'notes': 1,
                    'categories': 1,
                    'primary_category': 1,
                    'sku': 1,
                    'link_mockup_and_templates': 1,
                    'slug': 1,
                    'status': 1,
                }
            }, {
                $lookup: {
                  from: "product_media",
                  let: {
                    mediaIds: "$media",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ["$_id", "$$mediaIds"],
                        },
                      },
                    },
                    {
                      $sort: {
                        order: 1,
                      },
                    },
                  ],
                  as: "product_media",
                },
            }, {
                '$lookup': {
                    'from': 'ship_prices',
                    'localField': '_id',
                    'foreignField': 'product',
                    'as': 'ship_prices'
                }
            }, {
                '$lookup': {
                    'from': 'product_prices',
                    'localField': '_id',
                    'foreignField': 'product',
                    'as': 'product_prices'
                }
            }
        ]).exec()
    }

    async updatePricingByProductId(productId, data) {
        const product = await this.model
            .findOne({ _id: productId, deleted_at: { $exists: false } })
            .populate({ 
                path:'fulfillment_location',
                select: 'code name'
            })
            .select('_id fulfillment_location')
            .lean();
            
        if (!product) throw new Error(`Product ${productId} not found`);

        const result = await this.productStandardVariantRepository.updatePricingByProductId(product, data)
        const minTier = await this.productStandardVariantRepository.getMinTier1ForProduct(productId)
        await this.model.updateOne({ _id: productId }, { price: minTier })

        return result
    }

    async updateStandardVariantsByProductId(productId, data) {
        return this.productStandardVariantRepository.updateStandardVariants(productId, data)
    }

    async getStandardVariants(productId, options = {}) {
        const { status } = options
        const product = await this.model
            .findOne({ _id: productId, deleted_at: { $exists: false } })
            .populate({
                path: 'fulfillment_location',
                select: 'code name'
            })
            .select('_id fulfillment_location')
            .lean();
        if (!product) throw new Error(`Product ${productId} not found`);

        /**
        * @type {import("../database/models/website/ProductStandardVariant").ProductStandardVariant[]}
        */
        const variants = await this.productStandardVariantRepository.getVariants({ product: productId, ...(status && { status }) }, { populates: 'applied_products'})
        const { code: ffmCode } = product.fulfillment_location

        const SHIPPINGS = ['US', 'EU',  'WW'];
        if (ffmCode === 'CN') SHIPPINGS.push('ROW')
        function _generateShippingPrices(ffmCode, existingShippingPrices = []) {
            const existingLocations = existingShippingPrices.map(item => item.ship_location);

            if (ffmCode === 'AU') {
                return existingLocations.includes('AU')
                    ? existingShippingPrices.filter(item => item.ship_location === 'AU')
                    : [
                        {
                            ship_location: 'AU',
                            first_item_price: '',
                            additional_item_price: ''
                        }
                    ];
            } else {
                const newShippingPrices = SHIPPINGS.reduce((acc, location) => {
                    // if ((ffmCode === 'CN' && location === 'US') && !existingLocations.includes('US')) {
                    //     acc.push({
                    //         ship_location: location,
                    //         express_shipping_price: '',
                    //         post_service_price: '',
                    //         fast_shipping_price: ''
                    //     });
                    // } else if (!existingLocations.includes(location)) {
                    //     acc.push({
                    //         ship_location: location,
                    //         additional_item_price: '',
                    //         first_item_price: ''
                    //     });
                    // }
                    if ((ffmCode === 'CN' && location === 'US')) {
                        if (!existingLocations.includes('US')){
                            acc.push({
                                ship_location: location,
                                post_service_price: '',
                                fast_shipping_price: '',
                                express_shipping_price: ''
                            });
                        }else {
                            const { express_shipping_price, post_service_price, fast_shipping_price } = existingShippingPrices.find(item => item.ship_location === 'US')

                            acc.push({
                                ship_location: location,
                                post_service_price: post_service_price || '',
                                fast_shipping_price: fast_shipping_price || '',
                                express_shipping_price: express_shipping_price || ''
                            });
                        }
                    } else if (!existingLocations.includes(location)) {
                        acc.push({
                            ship_location: location,
                            first_item_price: '',
                            additional_item_price: ''
                        });
                    } else if (existingLocations.includes(location)) {
                        const [data] = existingShippingPrices.filter(item => item.ship_location === location)
                        acc.push({
                            ship_location: location,
                            first_item_price: '',
                            additional_item_price: '',
                            ...data
                        });
                    }
                    return acc;
                }, []);

                return newShippingPrices // existingShippingPrices.concat(newShippingPrices);
            }
        }

        function _generateBaseCost(ffmCode, existingBaseCost = {}) {
            existingBaseCost.tier1 = existingBaseCost.tier1 || '';

            if (ffmCode === 'CN') {
                delete existingBaseCost.tier2
                delete existingBaseCost.tier3
            } else {
                existingBaseCost.tier2 = existingBaseCost.tier2 || '';
                existingBaseCost.tier3 = existingBaseCost.tier3 || '';
            }

            return existingBaseCost;
        }

        for (const variant of variants) {
            variant.fulfillment_location_code = ffmCode;
            variant.shipping_prices = _generateShippingPrices(ffmCode, variant.shipping_prices);
            variant.base_cost = _generateBaseCost(ffmCode, variant.base_cost);
        }
        return variants
    }

    async updateStatus(productId, { status, is_published }){
        if (!status && typeof is_published !== 'boolean') throw new Error(`Either 'status' or 'is_published' should be provided for Product ${productId}`);

        const product = await this.model.findOne({ _id: productId, deleted_at: { $exists: false } });
        if (!product) throw new Error(`Product ${productId} not found`);

        let isPublished = typeof is_published === 'boolean' ? is_published : product.isPublished || false;
        if (!status) status = product.status
        
        if (status === 'inactive') {
            if(isPublished === true){
                throw new Error('Cannot set "published" when the product status is inactive');
            }
            
            isPublished = false
        }

        if(status === 'active') {
            if (isPublished){
                const requiredFields = ['techniques','slug', 'categories', 'title_seo', 'description_seo', 'primary_category']
    
                const missingFields = requiredFields.filter(field => {
                    if (!product[field]) return true;
    
                    if (Array.isArray(product[field]) && product[field].length === 0) return true;
                    return false;
                });
    
                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }
            }

            /**
             * @type {import("../database/models/website/ProductStandardVariant").ProductStandardVariant[]}
             */
            const variants = await this.productStandardVariantRepository.getVariants({ product: productId }, { select: 'base_cost sku'})

            const variantsMissingBaseCost = []
            for (const variant of variants) {
                const { base_cost, sku } = variant
                if (base_cost && base_cost.tier1) continue

                variantsMissingBaseCost.push(sku)
            }

            if (variantsMissingBaseCost.length) throw new Error(`Variants ${variantsMissingBaseCost.join(', ')} missing base cost`)
        }

        product.is_published = isPublished
        product.status = status

        await product.save()
        return product
    }

    async duplicateProduct(productId) {
        const product = await this.model.findOne({ _id: productId, deleted_at: { $exists: false } }).populate({
            path: 'media'
        }).lean();

        if (!product) throw new Error(`Product ${productId} not found`);

        // eslint-disable-next-line no-unused-vars
        const { _id, options, media, store_scope, label, title, sku_prefix, sku, categories, ...rest } = product

        const productSKU = `COPY_OF_${sku}`
        const productTitle = `(Copy of) ${title}`

        await this._checkExistsTitleProduct({ title: productTitle }).catch(() => {
            throw new Error('Another product copied from this one exists but has not been renamed yet.');
        })

        const productData = {
            ...rest,
            title: productTitle,
            store_scope: store_scope || "all",
            label: label || "product",
            options,
            categories,
            sku_prefix: `COPY_OF_${sku_prefix}`,
            sku: productSKU,
            status: 'inactive',
            is_published: false,
            slug: slugify(productTitle, { lower: true }),
        }

        const { variants, standardVariants } = await this.getVariantsAndStandardVariantsByProduct(product._id)

        const session = await conn.startSession();
        session.startTransaction();
        try {
            let [newProduct] = await this.model.create([productData], { session: session });
            newProduct = newProduct.toJSON()

            let mediaIds = [];
            if (Array.isArray(media) && media.length > 0) {
                const medias = media.map(item => ({
                    ..._.omit(item, ['_id', 'product']),
                    product: newProduct._id
                }));

                const insertedMedias = await this.productMediaRepository.bulkCreate(medias, { session });
                mediaIds = insertedMedias.map(item => item._id);
            }
            
            newProduct = await this.model.findOneAndUpdate({
                _id: newProduct._id
            }, {
                media: mediaIds
            }, {
                returnDocument: 'after', session, new: true
            }).lean();

            // create new variant
            const variantData = variants.map(variant => ({
                ..._.omit(variant, ['_id', 'created_at', 'updated_at']),
                product: newProduct._id
            }));

            const newVariants = await this.productVariantRepository.insertMany(variantData, session)

            // create new standard variant
            const standardVariantData = standardVariants.map(variant => {
                const {
                    // eslint-disable-next-line no-unused-vars
                    _id, created_at, updated_at,
                    meta_values,
                    shipping_prices,
                    ...restVariant
                } = variant;

                const modifiedMetaValues = _.map(meta_values, value => _.omit(value, '_id'));
                const modifiedShippingPrices = _.map(shipping_prices, price => _.omit(price, '_id'));
                delete variant.base_cost?._id
                return {
                    ...restVariant,
                    status: 'active',
                    stock: -1,
                    product: newProduct._id,
                    sku: this.productStandardVariantRepository._generateSKU(productSKU, variant),
                    meta_values: modifiedMetaValues,
                    shipping_prices: modifiedShippingPrices
                };
            });
            const newStandardVariantData = await this.productStandardVariantRepository.insertMany(standardVariantData, session)

            await session.commitTransaction();
            session.endSession();

            newProduct.variants = newVariants
            newProduct.standard_variants = newStandardVariantData

            return newProduct
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async updateAppliedProducts(productId, data) {
        const product = await this.model.findOne({ _id: productId, deleted_at: { $exists: false } });
        if (!product) throw new Error(`Product ${productId} not found`);
        if (product.label !== 'branding') throw new Error(`The product is not of type 'branding'`);

        const { applies, variant } = data;
        const productApplies = await this.model.find({
            _id: { $in: applies },
            label: "product",
            deleted_at: { $exists: false }
        }).select('_id').lean();

        const validProductIds = productApplies.map(p => p._id.toString());
        const invalidProductIds = applies.filter(id => !validProductIds.includes(id));

        if (invalidProductIds.length > 0) {
            throw new Error(`Invalid or not found product IDs: ${invalidProductIds.join(', ')}`);
        }

        return  this.productStandardVariantRepository.updateAppliedProducts(productId, { applies, variant })
    }
}

exports.ProductRepository = new ProductRepository(
    ProductModel, 
    ProductMediaRepository, 
    ProductVariantRepository, 
    ProductPriceRepository, 
    ShipPriceRepository,
    ProductStandardVariantRepository,
    FulfillmentLocation
);
