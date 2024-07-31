const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CustomerType = new Schema({
    type: { type: String, required: true, unique: true },
    typeName: { type: String, required: true },
}, {
    timestamps: true
})

module.exports = mongoose.model('customerType', CustomerType)