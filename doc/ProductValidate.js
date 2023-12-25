const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { ProductRepository } = require('../../repositories/ProductRepository');
const { ObjectId } = require('mongoose').Types
const isURL = require('validator/lib/isURL')

const isInUseSlug = async (slug, id) => {
    if (!slug) return false

    const product = await ProductRepository.getOneByField('slug', slug)
    return !!product && product._id.toString() !== id.toString()
}

const productValidate = (req, res, next) => {

    const { id } = req.params

    const schema = Joi.object({
        techniques: Joi.array().items(Joi.objectId()),
        title: Joi.string().required(),
        primary_category: Joi.objectId().required(),
        categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
        media: Joi.array().items(Joi.object({
            type: Joi.string().valid('image', 'video').optional(),
            source: Joi.string().required(),
            product: Joi.objectId().optional(),
            thumbnail: Joi.string().optional(),
            order: Joi.number().allow(null).optional(),
            alt: Joi.string().allow(null, '').optional(),
        })),
        options: Joi.array().items(Joi.object()).required(),
        tags: Joi.array(),
        status: Joi.valid('active', 'inactive').required(),
        variants: Joi.array().items(Joi.objectId()),
        default_variant: Joi.objectId(),
        price: Joi.number().required(),
        vendor: Joi.string(),
        descriptions: Joi.object().required(),
        print_areas: Joi.array().items(Joi.objectId()).optional(),
        fulfillment_location: Joi.objectId().required(),
        sku: Joi.string().required(),
        popularity: Joi.number(),
        old_link: Joi.string(),
        notes: Joi.array(),
        options_text: Joi.string(),
        categories_text: Joi.string(),
        print_areas_text: Joi.string(),
        techniques_text: Joi.string(),
        fulfillment_location_text: Joi.string(),
        title_seo: Joi.string(),
        description_seo: Joi.string(),
        link_mockup_and_templates: Joi.string(),
        slug: Joi.string().external(async (value) => {
            if (await isInUseSlug(value, id)) {
                throw new Error('Slug is in use')
            }

            return undefined
        }),
        price_prefix: Joi.string().allow(null, '').optional(),
    })

    schema.validateAsync(req.body).then(value => {
        next()
    }).catch(error => {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    });
}

const searchProductLine = function (req, res, next) {
    const { idSchema } = getCommonSchemas()

    const payload = req.query || {}
    const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(10).default(10),
        search: Joi.string().trim().allow(''),
        status: Joi.string().valid("active", "inactive").allow(''),
        label: Joi.string().valid("product", "branding").allow(''),
        category: idSchema.allow(''),
        published: Joi.string().valid("unpublished", "published").allow(''),
    }).optional();


    const { error, value } = schema.validate(payload, { stripUnknown: true });

    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.message || error
        });
    }
    req.payload = value
    next()
};

const getCommonSchemas = () => {
    const idSchema = Joi.string().custom((value, helpers) => {
        return ObjectId.isValid(value) ? value : helpers.message('"{{#label}}" must be a valid mongo id')
    })

    const uriSchema = Joi.string().trim().custom((value, helpers) => {
        return (value && !isURL(value)) ? helpers.message('"{{#label}}" is not a valid link.') : value
    })

    const attributeSchema = Joi.object({
        name: Joi.string().trim().uppercase().valid("COLORS", "SIZES", "TIERS", "TYPES").required(),
        label: Joi.string().trim().required(),
        values: Joi.when('name', {
            is: Joi.valid("SIZES", "TIERS", "TYPES").not(),
            then: Joi.array().items(Joi.string()).required(),
        }),
        meta_values: Joi.when('name', {
            is: Joi.valid('COLORS'),
            then: Joi.array().items(
                Joi.object({
                    text: Joi.string().trim().required(),
                    code: Joi.string().trim().required()
                })
            ).required(),
        }),
        selected_value: Joi.string().optional(),
        customized: Joi.boolean().optional(),
        _id: Joi.string().optional(),
    })

    const sideSchema = Joi.object({
        width: Joi.number().integer().min(0).required(),
        height: Joi.number().integer().min(0).required(),
    })

    const dimensionSchema = Joi.object({
        front: sideSchema,
        back: sideSchema,
        sleeve: sideSchema,
        hood: sideSchema,
    }).or('front', 'back', 'sleeve', 'hood').messages({
        'object.missing': 'At least one of front, back, sleeve, or hood is required in the dimension[]',
    })

    const descriptionSchema = Joi.object({
        average_est_processing_time: Joi.string().trim().allow('').optional(),
        average_est_shipping_time: Joi.string().trim().allow('').optional(),
        care_instruction: Joi.string().trim().allow('').optional(),
        mockup_and_template: Joi.string().trim().allow('').optional(),
        product_details: Joi.string().trim().allow('').optional(),
        short_description: Joi.string().trim().allow('').optional(),
        size_guide: Joi.string().trim().allow('').optional(),
        template: Joi.string().trim().allow('').optional(),
    })

    return {
        dimensionSchema,
        attributeSchema,
        descriptionSchema,
        idSchema,
        uriSchema
    }
}

const createProductLine = function (req, res, next) {
    const payload = req.body

    const { attributeSchema, idSchema } = getCommonSchemas()

    const schema = Joi.object({
        sku_prefix: Joi.string()
            .trim()
            .max(20)
            .required()
            .messages({
                'string.max': 'sku_prefix length must be less than or equal to 20 characters long'
            }),

        min_production_time: Joi.number().integer().min(1).optional().allow('', null),
        max_production_time: Joi.number().integer().min(1).optional().allow('', null),
        label: Joi.string().lowercase().valid("product", "branding").default("product"),

        title: Joi.string()
            .max(200)
            .required()
            .messages({
                'string.max': 'Max allowed limit for product title is 200 characters'
            }),

        fulfillment_location: idSchema.required(),
        options: Joi.array().max(4).items(attributeSchema).required(),
        store_scope: Joi.string().valid("all", "custom").default("all")
    })

    return schema.validateAsync(payload, { stripUnknown: true })
        .then((value) => {
            req.payload = value
            next()
        })
        .catch((error) => {
            return res.status(400).json({
                status: 400,
                message: error.message || error
            });
        });
};

const editProductLine = function (req, res, next) {
    const { key } = req.body
    try {
        if (!key) throw new Error("\"key\" is required")
        if (!["information", "publication"].includes(key)) throw new Error(`"key" must be one of [information, publication]"`)
    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: error.message || error
        });
    }

    const { id } = req.params
    const payload = { id }
    payload[key] = req.body

    const { attributeSchema, idSchema, descriptionSchema } = getCommonSchemas()

    const schema = Joi.object({
        id: idSchema,

        // info
        information: Joi.object({
            min_production_time: Joi.number().integer().min(1).optional().allow('', null),
            max_production_time: Joi.number().integer().min(1).optional().allow('', null),

            options: Joi.array().max(4).min(1).items(attributeSchema),
            label: Joi.string().lowercase().valid("product", "branding"),
            title: Joi.string()
                .max(200)
                .optional()
                .messages({
                    'string.max': 'Max allowed limit for product title is 200 characters'
                }),
            sku_prefix: Joi.string()
                .trim()
                .max(20)
                .optional()
                .messages({
                    'string.max': 'sku_prefix length must be less than or equal to 20 characters long'
                }),
            fulfillment_location: idSchema,
            store_scope: Joi.string().valid("all", "custom").optional(),
        }),

        // public
        publication: Joi.object({
            link_mockup_and_templates: Joi.string().trim().uri().required(),
            options: Joi.array().max(4).items(attributeSchema),

            slug: Joi.string().external(async (value) => {
                if (await isInUseSlug(value, payload.id)) {
                    throw new Error('Slug is in use')
                }
                return undefined
            }),

            categories: Joi.array().items(idSchema.required()).required(),
            print_areas: Joi.array().items(idSchema).optional(),
            techniques: Joi.array().items(idSchema).required(),
            primary_category: idSchema.required(),
            tags: Joi.array().items(Joi.string()),
            title_seo: Joi.string().required(),
            description_seo: Joi.string().required(),
            media: Joi.array().items(Joi.object({
                product: idSchema.optional(),
                type: Joi.string().valid('image', 'video').optional(),
                source: Joi.string().trim().uri().optional(),
                thumbnail: Joi.string().trim().uri().optional(),
                order: Joi.number().allow(null).optional(),
                alt: Joi.string().allow(null, '').optional(),
                _id: Joi.string().optional(),
            })).optional(),
            notes: Joi.array().items(Joi.string()).optional(),
            price_prefix: Joi.string().allow(null, '').optional(),
            descriptions: descriptionSchema,
            // price: Joi.number().required(),
        })
    }).or('information', 'publication');

    return schema.validateAsync(payload, { stripUnknown: true })
        .then((value) => {
            req.payload = {
                id,
                key: key,
                ...value[key]
            }
            next()
        })
        .catch((error) => {
            return res.status(400).json({
                status: 400,
                message: error.message || error
            });
        });
};

const editProductStatus = function (req, res, next) {
    const payload = { ...req.body, ...req.params }
    const { idSchema } = getCommonSchemas()

    const schema = Joi.object({
        id: idSchema,
        is_published: Joi.boolean().optional(),
        status: Joi.string().lowercase().valid("active", "inactive").optional(),
    });

    return schema.validateAsync(payload, { stripUnknown: true })
        .then((value) => {
            req.payload = value
            next()
        })
        .catch((error) => {
            return res.status(400).json({
                status: 400,
                message: error.message || error
            });
        });
};

const updatePricing = function (req, res, next) {
    const payload = { data: [...req.body], ...req.params }
    const { idSchema } = getCommonSchemas()

    const shippingPriceSchema = Joi.object({
        ship_location: Joi.string().valid('EU', 'US', 'WW', 'ROW', 'AU').required(),
        additional_item_price: Joi.number().allow('', null).optional(),
        first_item_price: Joi.number().allow('', null).optional(),

        fast_shipping_price: Joi.number().allow('', null).optional(),
        express_shipping_price: Joi.number().allow('', null).optional(),
        post_service_price: Joi.number().allow('', null).optional(),
    })

    const schema = Joi.object({
        // info
        id: idSchema,
        data: Joi.array().items(Joi.object({
            base_cost: Joi.object({
                tier1: Joi.number().min(0).required(),
                tier2: Joi.number().min(0).allow('', null),
                tier3: Joi.number().min(0).allow('', null)
            }).required(),
            shipping_prices: Joi.array().items(shippingPriceSchema).optional(),
            variant: idSchema.required(),
        })).required()
    });

    return schema.validateAsync(payload, { stripUnknown: true })
        .then((value) => {
            req.payload = value
            next()
        })
        .catch((error) => {
            return res.status(400).json({
                status: 400,
                message: error.message || error
            });
        });
};

const updateStandardVariants = function (req, res, next) {
    const payload = { data: [...req.body], ...req.params }
    const { idSchema, dimensionSchema } = getCommonSchemas()

    const schema = Joi.object({
        // info
        id: idSchema,
        data: Joi.array().items(Joi.object({
            // stock: Joi.number().integer().allow(''),
            status: Joi.string().valid("active", "inactive").allow('', null),
            variant: idSchema.required(),
            dimensions: Joi.array().items(dimensionSchema).optional(),
            template_mockup: Joi.string().trim().uri().optional().allow('', null),
        })).required()
    });

    return schema.validateAsync(payload, { stripUnknown: true })
        .then((value) => {
            req.payload = value
            next()
        })
        .catch((error) => {
            return res.status(400).json({
                status: 400,
                message: error.message || error
            });
        });
};

const updateAppliedProducts = function (req, res, next) {
    const payload = { ...req.body, ...req.params }
    const { idSchema } = getCommonSchemas()

    const schema = Joi.object({
        id: idSchema,
        applies: Joi.array().items(idSchema).required(),
        variant: idSchema.required(),
    });

    return schema.validateAsync(payload, { stripUnknown: true })
        .then((value) => {
            req.payload = value
            next()
        })
        .catch((error) => {
            return res.status(400).json({
                status: 400,
                message: error.message || error
            });
        });
};

module.exports = {
    productValidate,
    searchProductLine,
    createProductLine,
    editProductLine,
    updatePricing,
    updateStandardVariants,
    editProductStatus,
    updateAppliedProducts
}
