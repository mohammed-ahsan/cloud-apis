const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
    {
        title: {
            type: Object,
            required: true,
        },
        parentName: {
            type: String,
            required: false,
        },
        countryName: {
            type: String,
            required: false
        },
        parentId: {
            type: String,
            required: false,
        },
        imageurl: {
            type: String,
            required: false
        },
        status: {
            type: String,
            lowercase: true,
            enum: ['show', 'hide'],
            default: 'show',
        },
    },
    {
        timestamps: true,
    }
);


const SubCategory = mongoose.model('SubCategory', subcategorySchema);
module.exports = SubCategory;
