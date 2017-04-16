const mongoose = require('mongoose');

const galerySchema = new mongoose.Schema({
    id:  { type: String, unique: true },
    name: { type: String, unique: true },
    image_urls: [String],
    description: String,
    metaDescription: String,
    keywords: [String]
})


const Galery = mongoose.model('Galery', galerySchema);

module.exports = Galery;
