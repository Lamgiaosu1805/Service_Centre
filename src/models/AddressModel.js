const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Address = new Schema({
    MaDiaChi: { type: String, required: true },
    TenDiaChi: { type: String, required: true },
    TenTinh: { type: String, default: "" }, // Nếu không tên tỉnh thì tên địa chỉ chính là tên tỉnh luôn, còn không sẽ là tên quận/huyện
}, {
    timestamps: true
})

module.exports = mongoose.model('address', Address)