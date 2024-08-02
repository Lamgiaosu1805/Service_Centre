const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    roleId: { type: Number, required: true }, //Id = 1: Ad system manager - 2: Ad support
    fullName: { type: String, required: true },
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true
})

module.exports = mongoose.model('account', Account)