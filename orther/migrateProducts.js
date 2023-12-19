const { toSlug } = require("../../../utils/toSlug");
const { Product } = require("../../database/models/website/Product");
const crypto = require('crypto');
const { ProductStandardVariant } = require("../../database/models/website/ProductStandardVariant");

function genSKU(options) {
    const { prefix = '', length = 7 } = options || {};
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
    const randomString = randomBytes.toString('hex');
    const accountId = prefix + randomString.toLowerCase().substring(0, length);
    return accountId;
}

function transformOptions(options) {
    const sortOrder = { TIERS: 1, TYPES: 2, COLORS: 3, SIZES: 4 };

    options.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        const orderA = sortOrder[nameA] || Infinity;
        const orderB = sortOrder[nameB] || Infinity;

        return orderA - orderB;
    });

    return options.map(option => {
        const { name, meta_values, selected_value, values } = option;
        if (name === 'COLORS' && meta_values?.length > 0) {
            option.meta_values = meta_values.map(value => ({ ...value, type: name }));
            option.values = meta_values.map(value => value.text);
        } else {
            option.meta_values = values.map(value => ({ text: value, code: toSlug(value), type: name }));
        }

        if (values && !values.includes(selected_value)) {
            option.selected_value = values[0];
        }
        return option;
    })
}

function genVariants(options, productId){
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

function generateSKU(productSku, variant) {
    const { meta_values } = variant;
    const metaSize = meta_values.find(meta => meta.type === 'SIZES').text || '';
    const metaColor = meta_values.find(meta => meta.type === 'COLORS').text || '';
    const metaType = meta_values.find(meta => meta.type === 'TYPES').text || '';

    const sku = productSku
        + (metaType.charAt(0).toUpperCase())
        + (metaColor.charAt(0).toUpperCase())
        + (metaSize.charAt(0).toUpperCase())
        + Math.floor(Math.random() * 999) + 1;
    return sku
}

function checkUniqueSku(variants) {
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

const handleAsyncError = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const LIMIT = 100

const _fetchProducts = async (skip) => {
    return Product
        .find()
        .limit(LIMIT)
        .select('is_published status label fulfillment_location sku store_scope options')
        .populate('fulfillment_location')
        .skip(skip)
        .lean()
}

const _handler = async (products) => {
    const bulkUpdateOps = []

    for (const product of products) {
        const { is_published, status, label, _id: productId, store_scope, sku, fulfillment_location, options } = product

        const ffmCode = fulfillment_location.code

        const skuPrefix = sku || genSKU()
        const productSku = skuPrefix + ffmCode

        const update = {
            is_published: is_published !== false ? true : false,
            status: status !== 'inactive' ? 'active' : 'inactive',
            label: label !== 'branding' ? 'product' : 'branding',
            store_scope: store_scope === 'custom' ? 'custom' : 'all',
            sku_prefix: skuPrefix,
            sku: productSku
        }

        let standardOptions = []
        if (options.length > 0) {
            standardOptions = transformOptions(options).filter(option => option.name !== "TIERS")
        }

        if (standardOptions.length) {
            const variants = genVariants(options, productId)

            for (const variant of variants) {
                const sku = generateSKU(productSku, variant);
                variant.sku = sku
            }

            const error = checkUniqueSku(variants)
            if (error) throw new Error(error)

            let bulkVariants = [];
            for (const variant of variants) {
                bulkVariants.push({
                    insertOne: {
                        document: variant
                    }
                })
            }

            await ProductStandardVariant.bulkWrite(bulkVariants, { ordered: false })
        }

        if (update.status === 'inactive') update.is_published = false

        bulkUpdateOps.push({
            updateOne: {
                filter: { _id: productId },
                update: {
                    $set: update,
                },
            },
        })
    }

    return Product.bulkWrite(
        bulkUpdateOps,
        { ordered: false }
    )
}

const _main = async (skip = 0) => {
    const products = await _fetchProducts(skip)
    if (!products.length) return true

    await _handler(products)

    skip += LIMIT
    return _main(skip)
}

const addCodeForFulfillmentLocation = handleAsyncError(async (req, res) => {
    await _main()
    res.json({
        success: true,
    })
})


module.exports = addCodeForFulfillmentLocation