const { default: axios } = require("axios")
const CustomerModel = require("../models/CustomerModel")
const { SuccessResponse, FailureResponse } = require("../utils/ResponseRequest")

const F88ServiceController = {
    pushDocumentRequest: async (req, res) => {
        const body = req.body
        const requestId = new Date().getTime().toString()
        try {
            const customer = await CustomerModel.findOne({cccd: body.cccd})
            if(customer) {
                await customer.updateOne({
                    full_name: body.full_name,
                    cccd: body.cccd,
                    phone_number: body.phone_number,
                    mail: body.mail,
                    address: body.address,
                    birth: body.birth,
                    make_by: "FORM",
                    city: body.city_name,
                    district: body.district_name
                })
            }
            else {
                const newCustomer = new CustomerModel({
                    full_name: body.full_name,
                    cccd: body.cccd,
                    phone_number: body.phone_number,
                    mail: body.mail,
                    address: body.address,
                    birth: body.birth,
                    make_by: "FORM",
                    city: body.city_name,
                    district: body.district_name
                })
                await newCustomer.save()
            }
            const response = await axios.post('https://api-ida-pn.f88.co/api/v1/POL/AddNewForm', {
                PartnerCode: "VNFITE",
                RequestId: requestId,
                Data: [
                    {
                        CampaignId: 2,
                        SourceId: 393,
                        AssetTypeId: body.asset_type_id,
                        PhoneNumber: body.phone_number,
                        TrackingId: "VNFITE_F88",
                        FullName: body.full_name,
                        Address: body.address,
                        CityId: body.city_id,
                        DistrictId: body.district_id,
                        Money: body.money
                    }
                ]
            });
            if(response.data.ErrorCode == "200") {
                res.json(SuccessResponse({
                    request_id: requestId,
                    message: "Đẩy đơn thành công"
                }))
            } else {
                res.json(FailureResponse("03", {
                    data: response.data,
                    request_id: requestId,
                }))
            }
        } catch (error) {
            res.json(FailureResponse("04", error))
        }
    }
}

module.exports = F88ServiceController