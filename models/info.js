const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema({
    numbers: [String]
})


const Info = mongoose.model('Info', infoSchema);

module.exports = Info;
