const { default: axios } = require("axios")
const CustomerModel = require("../models/CustomerModel")
const { SuccessResponse, FailureResponse } = require("../utils/ResponseRequest")
const { default: mongoose } = require("mongoose")
const FormPushF88Model = require("../models/FormPushF88Model")
const HandleErrorCode = require("../utils/HandleErrorCode")

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
                    as: 'identity'
                },
            },
            { $unwind: '$identity' },
            {
                $addFields: {
                    idCustomerString: { $toString: '$_id' } // Tạo trường mới `idCustomerString` dưới dạng string
                },
            },
            {
                $lookup: {
                    from: 'formpushf88',
                    localField: 'idCustomerString',
                    foreignField: 'id_customer',
                    as: 'formPushF88'
                },
            },
            { $unwind: '$formPushF88' },
        ]).session(session)
        const dataFilterd = data.filter((e) => e.formPushF88.status == 4)
        const dataPush = dataFilterd.map((item) => {
            return {
                CampaignId: 2,
                SourceId: 393,
                AssetTypeId: 17,
                PhoneNumber: item.phone_number,
                TrackingId: item.formPushF88.tracking_id,
                FullName: item.full_name,
                Address: item.identity.address
            }
        })
        console.log(dataPush)
        const response = await axios.post(process.env.F88_API, {
            PartnerCode: "VNFITE",
            RequestId: requestId,
            Data: dataPush
        });
        console.log("F88 Response-----------------------------")
        console.log(response.data)
        if(response.data.ErrorCode == "200") {
            const customerIds = data.map(doc => doc._id);
            // const now = new Date(); // Lấy ngày giờ hiện tại
            // const day = String(now.getDate()).padStart(2, '0'); // Lấy ngày và đảm bảo có 2 chữ số
            // const month = String(now.getMonth() + 1).padStart(2, '0'); // Lấy tháng (0-11) và chuyển về 1-12
            // const year = now.getFullYear(); // Lấy năm
            // const listForm = data.map((item, index) => {
            //     return {
            //         id_customer: item._id,
            //         date: `${day}/${month}/${year}`,
            //         tracking_id: `VNFITE_F88_${numberData + index + 1}`
            //     }
            // })
            // console.log(listForm)
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
        console.log(error)
        await session.abortTransaction();
        session.endSession();
        isApi == true
        ?
        res.json(FailureResponse("04", error))
        : 
        console.log(error)
    }
}

function formatDate(date) {
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getLastForDays(numberDate) {
    let today = new Date();
    let dates = [];
    for (let i = 1; i <= numberDate; i++) {
        let pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        dates.push(formatDate(pastDate));
    }
    return dates;
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
                const numberData = await FormPushF88Model.countDocuments()
                const newFormPush = new FormPushF88Model({
                    id_customer: newCustomerInserted._id,
                    date: `${day}/${month}/${year}`,
                    asset_type_id: body.asset_type_id,
                    price_debit: body.money,
                    tracking_id: `VNFITE_F88_${numberData + 1}`
                })
                await newFormPush.save({session})
            }
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
        await pushDocument(true, res, 1000)
    },
    callbackResultPOL: async(req, res) => {
        const {body} = req
        try {
            console.log("===========F88 Callback============")
            console.log(body)
            const data = []
            for(let i = 0; i < body.length; i++) {
                try {
                    await FormPushF88Model.findOneAndUpdate({tracking_id: body[i].trackingId}, {
                        id_Pol: body[i].idPol, 
                        result_push: body[i].status, 
                        canceled_reason: body[i].canceledReason,
                    })
                    data.push({
                        errorCode: "200",
                        errorMessage: "Thành công",
                        trackingId: body[i].trackingId,
                        idPartnerQueue: body[i].idPartnerQueue
                    })
                } catch (error) {
                    console.log(`tracking_id: ${body[i].trackingId}`)
                    console.log(error)
                    data.push({
                        errorCode: "23",
                        errorMessage: HandleErrorCode("23"),
                        trackingId: body[i].trackingId,
                        idPartnerQueue: body[i].idPartnerQueue
                    })
                }
            }
            res.json({
                data: data
            })
            console.log({
                data: data
            })
            console.log("===================================")
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("21", error))
        }
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
            res.json(FailureResponse("16", error))
        }
    },
    callbackStatusPOL: async(req, res) => {
        const {body} = req
        try {
            console.log("===========F88 Callback============")
            console.log(body)
            const data = []
            for(let i = 0; i < body.length; i++) {
                try {
                    await FormPushF88Model.findOneAndUpdate({tracking_id: body[i].trackingId}, {
                        id_Pol: body[i].idPol,
                        status: body[i].status,
                        last_reason: body[i].lastReason,
                        price_debit: body[i].price,
                    })
                    data.push({
                        errorCode: "200",
                        errorMessage: "Thành công",
                        trackingId: body[i].trackingId,
                        idPartnerQueue: body[i].idPartnerQueue
                    })
                } catch (error) {
                    console.log(`tracking_id: ${body[i].trackingId}`)
                    console.log(error)
                    data.push({
                        errorCode: "24",
                        errorMessage: HandleErrorCode("24"),
                        trackingId: body[i].trackingId,
                        idPartnerQueue: body[i].idPartnerQueue
                    })
                }
            }
            res.json({
                data: data
            })
            console.log({
                data: data
            })
            console.log("===================================")
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("22", error))
        }
    },  

    getNumberOfDataForDate: async(req, res) => {
        try {
            const data = []
            const listDay = getLastForDays(300)
            const results = await Promise.all(
                listDay.map(async (date) => {
                    const count = await FormPushF88Model.countDocuments({ date }); // Truy vấn theo ngày
                    return { date, count };
                })
            )
            res.json(SuccessResponse(results)) // Trả về kết quả
            console.log(data)
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("17", error))
        }
    },
    getDanhSachKhachHangTheoNgay: async(req, res) => {
        const { query } = req
        try {
            const {date} = query
            const listData = await FormPushF88Model.find({date: date}).populate('id_customer').lean()
            const modifiedlistData = listData.map((form) => {
                form.customer_info = form.id_customer
                delete form.id_customer
                return form;
            });
            res.json(SuccessResponse({
                total: modifiedlistData.length,
                data: modifiedlistData
            }))
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("18", error))
        }
    },
    capNhatTrangThaiSauKhiCallReport: async (req, res) => {
        const {body} = req
        try {
            const idCustomer = body.idCustomer
            const trangThaiSauCallReport = body.status
            const cancelReson = body.status == 3 ? body.cancelReson : ""
            await FormPushF88Model.findOneAndUpdate({id_customer: idCustomer}, {status: trangThaiSauCallReport, canceled_reason: cancelReson})
            res.json(SuccessResponse())
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("20", error))
        }
    }

}

module.exports = {F88ServiceController, pushDocument}