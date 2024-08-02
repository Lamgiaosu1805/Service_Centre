const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Customer = new Schema({
    full_name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    mail: { type: String, default: "" },
    is_active: {type: Boolean, default: false},
    make_by: {type: String, default: ""}, //Nguồn data FORM hoặc Data sẵn có,
    city: {type: String, default: ""},//Tỉnh - TP
    district: {type: String, default: ""},// Quận - Huyện
    customer_type: {type: Number},// Đối tượng khách hàng
    job: {type: String, default: ""},//Nghề nghiệp
    position: {type: String, default: ""},//Chức vụ
    work_place: {type: String, default: ""},//Đơn vị công tác
}, {
    timestamps: true
})
module.exports = mongoose.model('customer', Customer)