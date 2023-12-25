const { toSlug } = require("../../../utils/toSlug");
const { Product } = require("../../database/models/website/Product");
const crypto = require("crypto");
const {
    ProductStandardVariantRepository,
} = require("../../repositories/ProductStandardVariantRepository");
const { ProductStandardVariant } = require("../../database/models/website/ProductStandardVariant");
const { delay } = require("../../../utils/delay");
const { ProductVariantCode } = require("../../database/models/website/ProductVariantCode");
const LIMIT = 100;
const _ = require('lodash')

const handleAsync = (asyncHandler) => async (req, res, next) => {
    try {
        const result = await asyncHandler(req, res, next);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

/**
 * @param {{prefix: string, length: number}} options
 */
function genStr(options) {
    const { prefix = "", length = 7 } = options || {};
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
    const randomString = randomBytes.toString("hex");
    const accountId = prefix + randomString.toLowerCase().substring(0, length);
    return accountId;
}

async function transformOptions(options) {
    const sortOrder = { TIERS: 1, TYPES: 2, COLORS: 3, SIZES: 4 };

    options.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        const orderA = sortOrder[nameA] || Infinity;
        const orderB = sortOrder[nameB] || Infinity;

        return orderA - orderB;
    });

    const variantCodes = await ProductVariantCode.find()
    const groupedByAttributeType = variantCodes.reduce((grouped, variant) => {
        const { attribute_type, items } = variant;
        if (!grouped[attribute_type]) {
            grouped[attribute_type] = [];
        }
        grouped[attribute_type].push(...items);
        return grouped;
    }, {});

    function generateMetaValues(attribute, values, name) {
        return values.map((value) => {
            const code = toSlug(value);
            const item = attribute.find(item => item.code === code);
            const sku_code = item?.sku_code || (name === "COLORS" ? undefined : code);

            return {
                text: value,
                code: name === "COLORS" ? genStr({ prefix: "#", length: 6 }) : code,
                type: name,
                sku_code
            };
        });
    }

    return options.map((option) => {
        const { name, selected_value, values = [], label, customized = false } = option;
        if (name === "COLORS") {
            option.meta_values = generateMetaValues(groupedByAttributeType['COLOR'], values, name);
        } else if (name === "TYPES") {
            option.meta_values = generateMetaValues(groupedByAttributeType['TYPE'], values, name);
        } else if (name === "SIZES") {
            option.meta_values = generateMetaValues(groupedByAttributeType['SIZE'], values, name);
        } else {
            option.meta_values = values.map((value) => ({
                text: value,
                code: toSlug(value),
                type: name,
            }));
        }

        if (values && !values.includes(selected_value)) {
            option.selected_value = values[0];
        }
        
        option.label = label || name;
        option.customized = (name !== 'TIERS') ? customized : undefined;

        return option;
    });
}

const _fetchProducts = async (skip) => {
    const products = await Product.find({
        // deleted_at: { $exists: false },
        _id: "6417e0121056d810376a39a6"
    })
        .limit(LIMIT)
        .select(
            "is_published status label fulfillment_location sku store_scope options price sku"
        )
        .populate("fulfillment_location")
        .skip(skip)
        .lean();

    return products;
};

const _handler = async (products) => {
    const bulkUpdateOps = [];

    for (const product of products) {
        const {
            is_published,
            status,
            label,
            _id: productId,
            store_scope,
            fulfillment_location,
            options,
            price,
        } = product;

        const ffmCode = fulfillment_location?.code;
        if (!ffmCode) continue

        const skuPrefix = genStr({ length: 5 }).toUpperCase();
        const productSku = skuPrefix + ffmCode;

        const update = {
            is_published: is_published !== false ? true : false,
            status: status !== "inactive" ? "active" : "inactive",
            label: label !== "branding" ? "product" : "branding",
            store_scope: store_scope === "custom" ? "custom" : "all",
            sku_prefix: skuPrefix,
            sku: productSku,
        };

        console.log({ productId, productSku, skuPrefix })

        if (options.length > 0) {
            const newOptions = await transformOptions(options)
            update.options = newOptions

            const standardOptions = newOptions.filter(
                (option) => option.name !== "TIERS"
            );

            if (standardOptions.length) {
                const standardVariants =
                    await ProductStandardVariantRepository.createStandardVariant({
                        options: standardOptions,
                        productId,
                        productSku,
                        isGetVariants: true,
                    });

                // fake pricing
                // for (const variant of standardVariants) {
                //     let SHIPPINGS = ["US", "EU", "WW"];
                //     if (ffmCode === "CN") SHIPPINGS.push("ROW");
                //     if (ffmCode === "AU") SHIPPINGS = ["AU"];

                //     if (!variant.base_cost) {
                //         variant.base_cost =
                //             ffmCode === "CN"
                //                 ? { tier1: price || 101 }
                //                 : { tier1: price || 101, tier2: 11, tier3: 13 };
                //     }

                //     if (
                //         !variant.shipping_prices ||
                //         !Array.isArray(variant.shipping_prices) ||
                //         variant.shipping_prices.length
                //     ) {
                //         const shippings = SHIPPINGS.map((location) => {
                //             if (ffmCode === "CN" && location === "US") {
                //                 return {
                //                     ship_location: location,
                //                     express_shipping_price: 3,
                //                     post_service_price: 4,
                //                     fast_shipping_price: 5,
                //                 };
                //             }

                //             return {
                //                 ship_location: location,
                //                 additional_item_price: 1,
                //                 first_item_price: 2,
                //             };
                //         });
                //         variant.shipping_prices = shippings;
                //     }
                // }
                
                await Promise.all([
                    ProductStandardVariant.deleteMany({ product: productId }),
                    ProductStandardVariant.create(standardVariants)
                ])
            }
        }

        if (update.status === "inactive") update.is_published = false;

        bulkUpdateOps.push({
            updateOne: {
                filter: { _id: productId },
                update: {
                    $set: update,
                },
            },
        })
    }

    return Product.bulkWrite(bulkUpdateOps, { ordered: false })
};

const _main = async (skip = 0) => {
    const products = await _fetchProducts(skip);
    if (!products.length) return true;

    await _handler(products);

    // skip += LIMIT
    // await delay(2000)
    // return _main(skip)
};

const addCodeForFulfillmentLocation = handleAsync(async () => {
    try {
        await _main();
        return { success: true }
    } catch (error) {
        return { success: false, message: error.message }
    }
});

module.exports = addCodeForFulfillmentLocation;
