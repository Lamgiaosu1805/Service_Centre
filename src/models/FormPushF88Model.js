const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FormPushF88 = new Schema({
    id_Pol: { type: String, default: ""}, // Sau khi F88 callback sẽ update lại giá trị
    id_customer: { type: String, required: true },
    date: {type: String, required: true},
     // result_push: 1, Thành côg; 0, thất bại; #
    result_push: { type: Number, default: -1 },
    //status 1- Đang chăm sóc; 2- Thành công; 3- Hủy
    status: { type: Number, default: -1 },
    price_debit: { type: String, default: "" },
    insurance: {type: String, default: ""},
    canceled_reason: {type: String, default: ""},
    asset_type_id: {type: Number, required: true}
}, {
    timestamps: true
})

module.exports = mongoose.model('formPushF88', FormPushF88)