const AddressModel = require("../models/AddressModel")
const { SuccessResponse, FailureResponse } = require("../utils/ResponseRequest")

const AddressController = {
    getCity: async (req, res) => {
        try {
            const data = await AddressModel.find({TenTinh: ""})
            res.json(SuccessResponse(data))
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("01", error))
        }
    },
    getDistrict: async (req, res) => {
        const {body} = req
        console.log(body)
        try {
            const data = await AddressModel.find({TenTinh: body.city_name})
            res.json(SuccessResponse(data))
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("02", error))
        }
    }
}

module.exports = AddressController