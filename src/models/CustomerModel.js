const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Customer = new Schema({
    full_name: { type: String, required: true },
    cccd: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    mail: { type: String, default: "" },
    address: { type: String, default: "" },
    is_active: {type: Boolean, default: false},
    birth: {type: Date, default: null},
    make_by: {type: String, default: ""}, //Nguồn data FORM hoặc Data sẵn có
}, {
    timestamps: true
})
module.exports = mongoose.model('customer', Customer)