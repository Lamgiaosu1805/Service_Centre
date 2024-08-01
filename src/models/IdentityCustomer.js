const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IdentityCustomer = new Schema({
    cccd: { type: String, required: true, unique: true },
    date_range: { type: String },//Ngày cấp
    issued_by: { type: String },//Nơi cấp
    address: { type: String, default: "" },
    permanent_address: { type: String, default: "" },//Địa chỉ thường trú
    birth: {type: String, default: ""},
    gender: {type: Number, default: 0}, //0: Nam, 1: Nữ, # không xác định
    phone_number: { type: String, required: true },
}, {
    timestamps: true
})
module.exports = mongoose.model('identityCustomer', IdentityCustomer)