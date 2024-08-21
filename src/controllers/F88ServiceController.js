const { default: axios } = require("axios")
const CustomerModel = require("../models/CustomerModel")
const { SuccessResponse, FailureResponse } = require("../utils/ResponseRequest")
const { default: mongoose } = require("mongoose")
const FormPushF88Model = require("../models/FormPushF88Model")

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
            const response = await axios.post(process.env.F88_API, {
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
    },
    pushData: async(req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const requestId = new Date().getTime().toString()
            const data = await CustomerModel.aggregate([
                {$match: {is_active: false}},
                {$limit: 30},
                {
                    $lookup: {
                        from: 'identitycustomers',
                        localField: 'phone_number',
                        foreignField: 'phone_number',
                        as: 'identities'
                    }
                },
                { $unwind: '$identities' },
            ]).session(session)
            const dataPush = data.map((item) => {
                return {
                    CampaignId: 2,
                    SourceId: 393,
                    AssetTypeId: 17,
                    PhoneNumber: item.phone_number,
                    TrackingId: "VNFITE_F88",
                    FullName: item.full_name,
                    Address: item.identities.address
                }
            })
            const response = await axios.post(process.env.F88_API, {
                PartnerCode: "VNFITE",
                RequestId: requestId,
                Data: dataPush
            });
            console.log("F88 Response ")
            console.log(response.data)
            if(response.data.ErrorCode == "200") {
                const customerIds = data.map(doc => doc._id);
                const now = new Date(); // Lấy ngày giờ hiện tại
                const day = String(now.getDate()).padStart(2, '0'); // Lấy ngày và đảm bảo có 2 chữ số
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Lấy tháng (0-11) và chuyển về 1-12
                const year = now.getFullYear(); // Lấy năm
                const listForm = data.map((item) => {
                    return {
                        id_customer: item._id,
                        date: `${day}/${month}/${year}`,
                    }
                })
                await CustomerModel.updateMany({ _id: { $in: customerIds } }, { $set: { is_active: true }}, {session});
                await FormPushF88Model.insertMany(listForm, {session})
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
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.json(FailureResponse("04", error))
        }
        
    }
}

module.exports = F88ServiceController