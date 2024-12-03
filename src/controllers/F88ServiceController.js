const { default: axios } = require("axios")
const CustomerModel = require("../models/CustomerModel")
const { SuccessResponse, FailureResponse } = require("../utils/ResponseRequest")
const { default: mongoose } = require("mongoose")
const FormPushF88Model = require("../models/FormPushF88Model")
const IdentityCustomer = require("../models/IdentityCustomer")

const pushDocument = async (isApi, res, numberCustomer) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const requestId = new Date().getTime().toString()
        const data = await CustomerModel.aggregate([
            {$match: {is_active: false}},
            {$limit: numberCustomer},
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
        console.log("F88 Response-----------------------------")
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
            console.log(listForm)
            await CustomerModel.updateMany({ _id: { $in: customerIds } }, { $set: { is_active: true }}, {session});
            // await FormPushF88Model.insertMany(listForm, {session})
            isApi == true
            ?
            res.json(SuccessResponse({
                request_id: requestId,
                message: "Đẩy đơn thành công"
            }))
            :
            console.log(SuccessResponse({
                request_id: requestId,
                message: "Đẩy đơn thành công"
            }))
        } else {
            isApi == true
            ?
            res.json(FailureResponse("03", {
                data: response.data,
                request_id: requestId,
            }))
            :
            console.log(FailureResponse("03", {
                data: response.data,
                request_id: requestId,
            }))
        }
        console.log("-----------------------------")
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        isApi == true
        ?
        res.json(FailureResponse("04", error))
        : 
        console.log(error)
    }
} 

const F88ServiceController = {
    pushDocumentRequest: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        const body = req.body
        const requestId = new Date().getTime().toString()
        const now = new Date(); // Lấy ngày giờ hiện tại
        const day = String(now.getDate()).padStart(2, '0'); // Lấy ngày và đảm bảo có 2 chữ số
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Lấy tháng (0-11) và chuyển về 1-12
        const year = now.getFullYear(); // Lấy năm
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
                }, {session})
            }
            else {
                const newCustomer = new CustomerModel({
                    full_name: body.full_name,
                    phone_number: body.phone_number,
                    mail: body.mail,
                    address: body.address,
                    birth: body.birth,
                    make_by: "FORM",
                    city: body.city_name,
                    district: body.district_name
                })
                const newCustomerInserted = await newCustomer.save({session})

                const newIdentityCustomer = new IdentityCustomer({
                    cccd: body.cccd,
                    date_range: body.date_range ?? "Chưa cung cấp",
                    issued_by: body.issued_by ?? "Chưa cung cấp",
                    address: body.address,
                    permanent_address: body.permanent_address,
                    birth: body.birth,
                    gender: body.gender,
                    phone_number: body.phone_number
                })
                await newIdentityCustomer.save({session})

                const newFormPush = new FormPushF88Model({
                    id_customer: newCustomerInserted._id,
                    date: `${day}/${month}/${year}`,
                    asset_type_id: body.asset_type_id,
                    price_debit: body.money
                })
                await newFormPush.save({session})
            }
            // const response = await axios.post(process.env.F88_API, {
            //     PartnerCode: "VNFITE",
            //     RequestId: requestId,
            //     Data: [
            //         {
            //             CampaignId: 2,
            //             SourceId: 393,
            //             AssetTypeId: body.asset_type_id,
            //             PhoneNumber: body.phone_number,
            //             TrackingId: "VNFITE_F88",
            //             FullName: body.full_name,
            //             Address: body.address,
            //             CityId: body.city_id,
            //             DistrictId: body.district_id,
            //             Money: body.money
            //         }
            //     ]
            // });
            res.json(SuccessResponse({
                request_id: requestId,
                message: "Đẩy đơn thành công"
            }))
            
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("04", error))
            await session.abortTransaction();
            session.endSession();
        }
    },
    pushData: async(req, res) => {
        await pushDocument(true, res, 30)
    },
    getSoLuongDataThang: async(req, res) => {
        const {body} = req;
        try {
            const records = await FormPushF88Model.find({
                $expr: {
                  $and: [
                    { $eq: [{ $arrayElemAt: [{ $split: ["$date", "/"] }, 1] }, body.month] }, // So sánh tháng
                    { $eq: [{ $arrayElemAt: [{ $split: ["$date", "/"] }, 2] }, body.year] }   // So sánh năm
                  ]
                }
              });
          
              res.json(SuccessResponse({
                totalRecord: records.length,
                records: records
              })); // Trả về kết quả
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = {F88ServiceController, pushDocument}