const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FormPush = new Schema({
    id_doi_tac: { type: String, required: true, unique: true },
    id_customer: { type: String, required: true },
    status: { type: Boolean, default: false },
}, {
    timestamps: true
})

module.exports = mongoose.model('formPush', FormPush)