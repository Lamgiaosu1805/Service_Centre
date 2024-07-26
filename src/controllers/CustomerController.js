const AddressModel = require("../models/AddressModel")

const CustomerController = {
    verifyCustomer: async (req, res, next) => {
        const {body} = req
        try {
            // await AddressModel.insertMany(body.data)
        } catch (error) {
            console.log(error)
            res.json({})
        }
        
    }
}

module.exports = CustomerController