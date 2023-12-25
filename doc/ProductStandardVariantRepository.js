const Repository = require('./Repository');
const { ProductStandardVariant } = require('../database/models/website/ProductStandardVariant');
const { ProductPrice } = require('../database/models/website/ProductPrice');
const { Product } = require('../database/models/website/Product');
const _ = require('lodash');

class ProductStandardVariantRepository extends Repository {
    constructor(productStandardVariant, productPriceModel, productModel) {
        super(productStandardVariant);
        this.productPriceModel = productPriceModel
        this.productModel = productModel
    }

    _findChanges(oldVariants, newVariants) {
        const addedVariants = newVariants.filter(variant => {
            return !oldVariants.some(currVariant => _.isEqual(_.sortBy(currVariant.options), _.sortBy(variant.options)));
        });

        const deletedVariants = oldVariants.filter(currVariant => {
            return !newVariants.some(variant => _.isEqual(_.sortBy(currVariant.options), _.sortBy(variant.options)));
        });

        const updatedVariants = newVariants.reduce((acc, variant) => {
            const existingVariant = oldVariants.find(currVariant => _.isEqual(_.sortBy(currVariant.options), _.sortBy(variant.options)));
            if (existingVariant) {
                if (!_.isEqual(_.sortBy(existingVariant.meta_values), _.sortBy(variant.meta_values))) {
                    acc.push({ ...existingVariant, ...variant });
                }
            }
            return acc;
        }, []);

        return { addedVariants, deletedVariants, updatedVariants };
    }

    _generateSKU(productSku, variant) {
        const { meta_values } = variant;

        const getTypeText = (type) => (meta_values.find(meta => meta.type === type))?.sku_code

        const skuSize = getTypeText('SIZES');
        const skuColor = getTypeText('COLORS');
        const skuType = getTypeText('TYPES');

        const randomNum = Math.floor(Math.random() * 99999) + 1;
        return `${productSku}${skuType}${skuColor}${skuSize}${randomNum}`;
    }

    _getBulkWriteOperations({ addedVariants, deletedVariants, updatedVariants }){
        const bulkWriteOperations = [];

        addedVariants.forEach(variant => {
            bulkWriteOperations.push({
                insertOne: {
                    document: variant
                }
            });
        });

        deletedVariants.forEach(variant => {
            bulkWriteOperations.push({
                deleteOne: {
                    filter: { _id: variant._id }
                }
            });
        });

        updatedVariants.forEach(variant => {
            const { _id, ...rest} = variant
            bulkWriteOperations.push({
                updateOne: {
                    filter: { _id: _id },
                    update: {
                        $set: { ...rest }
                    }
                }
            });
        });

        return bulkWriteOperations
    }

    _checkUniqueSku(variants) {
        const skuSet = new Set();
        for (const variant of variants) {
            const sku = variant.sku;
            if (skuSet.has(sku)) {
                return `SKU '${sku}' is not unique.`;
            } else {
                skuSet.add(sku);
            }
        }

        return null
    }

    _genVariants(options, productId){
        let variants = [];
        for (let option of options) {
            const newVariants = [];
            if (variants.length === 0) {
                for (let value of option.values) {
                    const meta_values = option.meta_values?.filter(v => v.text === value) || [];
                    newVariants.push({
                        product: productId,
                        title: value,
                        options: [value],
                        meta_values: [...meta_values],
                    });
                }
            } else {
                variants.forEach(variant => {
                    option.values.forEach(value => {
                        const meta_values = option.meta_values?.filter(v => v.text === value) || [];
                        newVariants.push({
                            product: productId,
                            title: variant.title + ' - ' + value,
                            options: [...variant.options, value],
                            meta_values: [...variant.meta_values, ...meta_values],
                        });
                    });
                });
            }

            variants = newVariants;
        }
        return variants
    }

    async overwriteFromStandardOptions({ options, productId, productSku }, session) {
        const oldVariants = await this.model.find({ product: productId }).lean()

        const newVariants = this._genVariants(options, productId)

        for (const variant of newVariants) {
            const sku = this._generateSKU(productSku, variant);
            variant.sku = sku
        }

        const error = this._checkUniqueSku(newVariants)
        if (error) throw new Error(error)

        const { addedVariants, deletedVariants, updatedVariants } = this._findChanges(oldVariants, newVariants);

        const bulkVariants = this._getBulkWriteOperations({ addedVariants, deletedVariants, updatedVariants })
        await this.model.bulkWrite(bulkVariants, { session });
    }

    async createStandardVariant({ options, productId, productSku, isGetVariants = false }, session) {
        const variants = this._genVariants(options, productId)

        for (const variant of [variants[0]]) {
            const sku = this._generateSKU(productSku, variant);
            variant.sku = sku
        }

        const error = this._checkUniqueSku(variants)
        if (error) throw new Error(error)

        if (isGetVariants) return variants

        let bulkVariants = [];
        for (const variant of variants) {
            bulkVariants.push({
                insertOne: {
                    document: variant
                }
            })
        }

        await this.model.bulkWrite(bulkVariants, { session })
    }

    async insertMany(variants, session) {
        return await this.model.insertMany(variants, { session });
    }

    /**
     * @param {ProductStandardVariant} query
     * @param {{select: string,populates: object | object[]}} options
     * @returns {Promise<ProductStandardVariant[]>}
     */
    async getVariants(query, options = {}) {
        const { select, populates } = options
        return this.model.find(query).populate(populates).select(select || '').lean()
    }

    /**
     * @param {ObjectId} productId 
     */
    async getMinTier1ForProduct(productId) {
        try {
            const productVariant = await this.model.findOne(
                { product: productId },
                { 'base_cost.tier1': 1 } // Only retrieve the tier1 field
            ).sort({ 'base_cost.tier1': 1 }); // Sort by tier1 in ascending order

            // Return the lowest tier1 value
            return productVariant?.base_cost?.tier1 || 0;
        } catch (error) {
            throw new Error(`Error fetching minimum tier1 for product: ${error.message}`);
        }
    }

    /**
    * @returns {Promise<ProductStandardVariant[]>}
    */
    async updatePricingByProductId(product, data) {
        /**
        * @type {import("../database/models/website/ProductStandardVariant").ProductStandardVariant[]}
        */
        const variants = await this.getVariants({ product: product._id })
        const groupedVariants = _.groupBy(variants, '_id');

        const { code: ffmCode } = product.fulfillment_location

        const bulkVariants = data.map(item => {
            const { variant: variantId, base_cost = {}, shipping_prices = [] } = item
            const variant = groupedVariants[variantId]
            if(!variant) return null

            let shippingPrices = []

            const filterShippingForAU = shipping => {
                delete shipping?.fast_shipping_price;
                delete shipping?.express_shipping_price;
                delete shipping?.post_service_price;
                return shipping.ship_location === 'AU';
            };

            const mapShippingForCN = shipping => {
                const { post_service_price, fast_shipping_price, express_shipping_price, additional_item_price, first_item_price, ship_location } = shipping;
                return ship_location === 'US' ? {
                    ship_location,
                    express_shipping_price,
                    post_service_price,
                    fast_shipping_price
                } : {
                    ship_location,
                    additional_item_price,
                    first_item_price
                };
            };

            if(ffmCode === 'AU') {
                shippingPrices = shipping_prices.filter(filterShippingForAU);
            } else if (ffmCode === 'CN') {
                shippingPrices = shipping_prices.map(mapShippingForCN);
            } else {
                shippingPrices = shipping_prices.map(shipping => {
                    const { additional_item_price, first_item_price, ship_location } = shipping;
                    return {
                        ship_location,
                        additional_item_price,
                        first_item_price
                    };
                });
            }

            shippingPrices = _.uniqBy(shippingPrices, 'ship_location');
            shippingPrices = shippingPrices.filter(ship => {
                // eslint-disable-next-line no-unused-vars
                const { ship_location, ...rest } = ship
                const isValue = Object.values(rest).some(element => typeof element === 'number')
                return isValue
            })
            
            return {
                updateOne: {
                    filter: { _id: variantId },
                    update: {
                        $set: { base_cost, shipping_prices: shippingPrices }
                    }
                }
            }
           
        }).filter(Boolean)

        if (!bulkVariants.length) throw new Error('No variants provided for update')

        await this.model.bulkWrite(bulkVariants)
        return `updated successfully`;
    }

    /**
    * @returns {Promise<ProductStandardVariant[]>}
    */
    async updateStandardVariants(productId, data) {
        /**
        * @type {import("../database/models/website/ProductStandardVariant").ProductStandardVariant[]}
        */
        const variants = await this.getVariants({ product: productId })
        const groupedVariants = _.groupBy(variants, '_id');

        const bulkVariants = data.map(item => {
            const { variant: variantId} = item
            const variant = groupedVariants[variantId]

            if (variant) {
                const { status, template_mockup, dimensions } = item
                
                const update = {
                    ...(status && { status }),
                    ...(template_mockup && { template_mockup }),
                    ...(dimensions && { dimensions }),
                }

                if (Object.keys(update).length){
                    return {
                        updateOne: {
                            filter: { _id: variantId },
                            update: {
                                $set: update
                            }
                        }
                    }
                }
            }

            return null
        }).filter(Boolean)

        await this.model.bulkWrite(bulkVariants)
        return `updated successfully`;
    }

    /**
   * @returns {Promise<ProductStandardVariant[]>}
   */
    async updateAppliedProducts(productId, data) {
        const { applies, variant: variantId } = data;
        /**
        * @type {import("../database/models/website/ProductStandardVariant").ProductStandardVariant[]}
        */
        const variant = await this.model.findOne({ product: productId, _id: variantId })
        if (!variant) throw new Error(`Variant ${variantId} not found`);

        const anotherVariants = await this.getVariants({ 
            product: productId, 
            _id: { $ne: variantId } 
        }, { select: 'applied_products' })

        const beforeAppliedProducts = []
        anotherVariants.forEach(variant => beforeAppliedProducts.push(...variant.applied_products))

        const duplicateAppliedProducts = beforeAppliedProducts.filter(id => applies.includes(id.toString()));

        if (duplicateAppliedProducts.length > 0) {
            throw new Error(`This product has already been applied to another variant: ${duplicateAppliedProducts.join(', ')}`);
        }

        variant.applied_products = applies
        await variant.save()
        return variant
    }
}

exports.ProductStandardVariantRepository = new ProductStandardVariantRepository(ProductStandardVariant, ProductPrice, Product);
