const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    picture: String,
    gstin: Number,
})

module.exports = mongoose.model("owner", ownerSchema);