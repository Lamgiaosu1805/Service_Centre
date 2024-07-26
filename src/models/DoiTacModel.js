const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DoiTac = new Schema({
    id_doi_tac: { type: String, required: true, unique: true },
    ten_doi_tac: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
}, {
    timestamps: true
})

module.exports = mongoose.model('doiTac', DoiTac)