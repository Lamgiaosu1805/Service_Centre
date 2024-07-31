const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Customer = new Schema({
    full_name: { type: String, required: true },
    cccd: { type: String, required: true, unique: true },
    date_range: { type: String },//Ngày cấp
    issued_by: { type: String },//Nơi cấp
    phone_number: { type: String, required: true },
    mail: { type: String, default: "" },
    address: { type: String, default: "" },
    permanent_address: { type: String, default: "" },//Địa chỉ thường trú
    is_active: {type: Boolean, default: false},
    birth: {type: String, default: ""},
    make_by: {type: String, default: ""}, //Nguồn data FORM hoặc Data sẵn có,
    city: {type: String, default: ""},//Tỉnh - TP
    district: {type: String, default: ""},// Quận - Huyện
    gender: {type: Number, default: 0}, //0: Không xác định, 1: Nam, 2: Nữ
    customer_type: {type: Number},// Đối tượng khách hàng
    job: {type: String, default: ""},//Nghề nghiệp
    position: {type: String, default: ""},//Chức vụ
    work_place: {type: String, default: ""},//Đơn vị công tác
}, {
    timestamps: true
})
module.exports = mongoose.model('customer', Customer)