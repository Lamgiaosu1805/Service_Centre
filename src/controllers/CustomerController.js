const CustomerModel = require("../models/CustomerModel")
const LoanNeedModel = require("../models/LoanNeedModel");
const { SuccessResponse } = require("../utils/ResponseRequest")
const mongoose = require('mongoose');

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
        const {body, partner} = req
        const listCustomer = body.list_customer
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
                    make_by: `Partner ${partner.partner_code}`
                }
                batch.push(newRecord);
            }
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
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
    }
}

module.exports = CustomerController