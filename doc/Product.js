const conn = require('../../connections/website');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const { Option }= require('./Option');

// const Description = new Schema({
//     size_guide: { type: String },
//     summary: { type: String },
//     product_details: { type: String },
//     mockup_and_templates: { type: String },
//     care_instructions: { type: String },
//     short_description: { type: String },
// });

const ProductionTime = new Schema({
    min: { type: Number },
    max: { type: Number },
    unit: { type: String }, // days
})

const productSchema = new Schema({
    techniques: { type: [ObjectId], ref: 'Technique' },
    slug: { type: String },
    primary_category: { type: ObjectId, ref: 'Category' },
    categories: { type: [ObjectId], ref: 'Category' },
    media: { type: [ObjectId], ref: 'ProductMedia' },
    options: { type: [Option] },
    tags: { type: [String] },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    variants: { type: [ObjectId] },
    default_variant: { type: ObjectId, ref: 'ProductVariant' },
    price: { type: Number, default: 0 },
    vendor: { type: String },
    descriptions: { type: Object },
    print_areas: { type: [ObjectId], ref: 'PrintArea' },
    fulfillment_location: { type: ObjectId, ref: 'FulfillmentLocation' },
    deleted_at: { type: Date, index: true },
    popularity: { type: Number }, // negative number
    old_link: { type: String },
    notes: { type: [String] },
    options_text: { type: String },
    categories_text: { type: String },
    print_areas_text: { type: String },
    techniques_text: { type: String },
    fulfillment_location_text: { type: String },
    title_seo: { type: String },
    description_seo: { type: String },
    link_mockup_and_templates: { type: String },
    price_prefix: { type: String },
    attached_product: { type: ObjectId, ref: 'Product' },

    title: { type: String, index: true },
    production_time: { type: ProductionTime },
    sku: { type: String, index: true},
    sku_prefix: { type: String },
    is_published: { type: Boolean, default: false, index: true },
    label: { type: String, enum: ["product", "branding"], default: "product", index: true },
    store_scope: { type: String, enum: ["all", "custom"], default: "all"},
}, {
    collection: 'products', 
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

exports.Product = conn.model('Product', productSchema);