const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LoanNeed = new Schema({
    id_customer: { type: String, required: true },
    loan_needs: { type: String, default: "" },//Nhu cầu vay vốn
    living_habits: { type: String, default: "" },//Thói quen sinh hoạt
    consumption_habits: { type: String, default: "" },// Thói quen tiêu dùng
}, {
    timestamps: true
})

module.exports = mongoose.model('loanNeed', LoanNeed)