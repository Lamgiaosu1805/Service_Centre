const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Partner = new Schema({
    partner_code: { type: String, required: true, unique: true },
    partner_name: { type: String, required: true },
    key_tracking: { type: String, required: true },
    is_delete: { type: Boolean, default: false },
}, {
    timestamps: true
})

module.exports = mongoose.model('partner', Partner)