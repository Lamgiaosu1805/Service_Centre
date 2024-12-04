const CustomerModel = require("../models/CustomerModel")
const LoanNeedModel = require("../models/LoanNeedModel");
const { SuccessResponse, FailureResponse } = require("../utils/ResponseRequest")
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const IdentityCustomer = require("../models/IdentityCustomer");
const FormPushF88Model = require("../models/FormPushF88Model");

const CustomerController = {
    verifyCustomer: async (req, res, next) => {
        const {body} = req
        try {
            // await AddressModel.insertMany(body.data)
        } catch (error) {
            console.log(error)
            res.json({})
        }
        
    },
    insertCustomerFromPartner: async (req, res, next) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        else {
            const {body, partner} = req
            try {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(req.file.buffer);
                const worksheet = workbook.getWorksheet(1); // Lấy worksheet đầu tiên
                let headers = [];
                let data = [];
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) {
                        headers = row.values.slice(1); // Bỏ giá trị đầu tiên vì nó là null
                    } else {
                        let rowData = {};
                        row.values.slice(1).forEach((value, index) => {
                            rowData[headers[index]] = value;
                        });
                        data.push(rowData);
                    }
                });
                const newData = data.map((item) => {
                    return {
                        full_name: item.Name,
                        phone_number: item.Tel ?? "Chưa cung cấp",
                        mail: item.Email ?? "Chưa cung cấp",
                        customer_type: item.customerType,
                        job: item.NgheNghiep,
                        position: item.position ?? "Chưa cung cấp",
                        work_place: item.work_place ?? "Chưa cung cấp",
                        make_by: `Partner ${partner.partner_code}`,
                        cccd: item.CCCD ?? item.CMND ?? "Chưa cung cấp",
                        date_range: item.date_range ?? "Chưa cung cấp",
                        issued_by: item.issued_by ?? "Chưa cung cấp",
                        address: item.DiaChi ?? "Chưa cung cấp",
                        permanent_address: item.permanent_address??"Chưa cung cấp",
                        birth: `${item.ngaySinh}/${item.thangSinh}/${item.namSinh}`,
                        gender: item.gender,
                    }
                })

                const listCustomer = newData
                const totalRecords = listCustomer.length
                const batchSize = 500
                const totalBatches = Math.ceil(totalRecords / batchSize);
                var successBatch = 0
                var failureBatch = 0
                const listError = []
                for(let i = 0; i < totalRecords / batchSize; i++){
                    const batch = [];
                    const currentBatchSize = Math.min(batchSize, totalRecords - i * batchSize);
                    for (let j = 0; j < currentBatchSize; j++) {
                        const newRecord = {
                            full_name: listCustomer[i * batchSize + j].full_name,
                            phone_number: listCustomer[i * batchSize + j].phone_number,
                            mail: listCustomer[i * batchSize + j].mail,
                            customer_type: listCustomer[i * batchSize + j].customer_type,
                            job: listCustomer[i * batchSize + j].job,
                            position: listCustomer[i * batchSize + j].position,
                            work_place: listCustomer[i * batchSize + j].work_place,
                            make_by: listCustomer[i * batchSize + j].make_by,
                            cccd: listCustomer[i * batchSize + j].cccd,
                            date_range: listCustomer[i * batchSize + j].date_range,
                            issued_by: listCustomer[i * batchSize + j].issued_by,
                            address: listCustomer[i * batchSize + j].address,
                            permanent_address: listCustomer[i * batchSize + j].permanent_address,
                            birth: listCustomer[i * batchSize + j].birth,
                            gender: listCustomer[i * batchSize + j].gender,
                        }
                        batch.push(newRecord);
                    }
                    const session = await mongoose.startSession();
                    session.startTransaction();
                    try {
                        await IdentityCustomer.insertMany(batch, {session});
                        console.log(`Inserted IdentityCustomer batch ${i + 1}`);
                        const insertedDocs = await CustomerModel.insertMany(batch, { session });
                        console.log(`Inserted customer batch ${i + 1}`);
                        const relatedBatch = insertedDocs.map((doc, index) => ({
                            id_customer: doc._id,
                            loan_needs: listCustomer[i * batchSize + index].loan_needs,
                            living_habits: listCustomer[i * batchSize + index].living_habits,
                            consumption_habits: listCustomer[i * batchSize + index].consumption_habits,
                        }));
                        await LoanNeedModel.insertMany(relatedBatch, { session });
                        console.log(`Inserted LoanNeeds data for customer batch ${i + 1}`);
                        successBatch += 1
                        await session.commitTransaction();
                    } catch (error) {
                        await session.abortTransaction();
                        console.log(`Error inserting customer batch ${i + 1}:`, error);
                        listError.push(error.errorResponse.message)
                        failureBatch+=1
                    }
                    finally {
                        session.endSession();
                    }
                }
                res.json(SuccessResponse({
                    successBatches: successBatch,
                    failureBatches: failureBatch,
                    totalBatches: totalBatches,
                    Errors: listError
                }))
            } catch (error) {
                console.log(error)
                res.send(error)
            }
            
        }
    },
    getCustomerInfo: async(req, res) => {
        const {params} = req
        try {
            const customerId = params.customerId
            const customerInfo = await CustomerModel.findById(customerId).lean()
            const identityCustomer = await IdentityCustomer.findOne({phone_number: customerInfo.phone_number})
            const formPush = await FormPushF88Model.findOne({id_customer: customerId})
            res.json(SuccessResponse({
                data: {
                    customerInfo: customerInfo,
                    identityInfo: identityCustomer,
                    formPushInfo: formPush
                }
            }))
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("19", error))
        }
    }
}

module.exports = CustomerController