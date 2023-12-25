const { handleAsync } = require('../../utils/handleAsync');
const { ProductVariantCode } = require('../database/models/website/ProductVariantCode');

const createVariantCode = handleAsync(async (req) => {
    const { group_name, attribute_type, items } = req.body
    const result = await ProductVariantCode.create({ group_name, attribute_type, items })
    return result
})

const getVariantCodes = handleAsync(async () => {
    const variantCodes = await ProductVariantCode.find()
    return variantCodes
})

const getVariantCode = handleAsync(async (req) => {
    const { id } = req.params
    const variantCode = await ProductVariantCode.findById(id)
    if (!variantCode) throw new Error('Variant code not found')
    return variantCode
})

const updateVariantCode = handleAsync(async (req) => {
    const { id } = req.params
    const { group_name, attribute_type, items } = req.body

    const variantCode = await ProductVariantCode.findOneAndUpdate({
        _id: id,
    },{
        ...(group_name && { group_name }),
        ...(attribute_type && { attribute_type }),
        ...(items && { items }),
    })

    if (!variantCode) throw new Error('Variant code not found')
    return variantCode
})


const deleteVariantCode = handleAsync(async (req) => {
    const { id } = req.params
    const variantCode = await ProductVariantCode.findByIdAndDelete(id)
    if(!variantCode) throw new Error('Variant code not found')
    return variantCode
})

module.exports = {
    createVariantCode,
    getVariantCodes,
    getVariantCode,
    updateVariantCode,
    deleteVariantCode
};
