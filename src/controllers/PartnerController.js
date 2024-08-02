
const crypto = require('crypto');
const PartnerModel = require('../models/PartnerModel');
const { SuccessResponse, FailureResponse } = require('../utils/ResponseRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const PartnerController = {
    createPartner: async (req, res) => {
        const {body} = req
        try {
            const keyBuffer = crypto.randomBytes(24);
            const base64Key = keyBuffer.toString('base64');
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(base64Key, salt);
            const newPartner = new PartnerModel({
                partner_code: body.partner_code,
                partner_name: body.partner_name,
                key_tracking: hashed
            })
            await newPartner.save()
            res.json(SuccessResponse({
                partner_code: body.partner_code,
                partner_name: body.partner_name,
                key_tracking: base64Key
            }))
        } catch (error) {
            res.send(error)
        }
    },
    getTokenPartner: async (req, res) => {
        const {body} = req
        try {
            const partner = await PartnerModel.findOne({partner_code: body.partner_code})
            if(partner) {
                const validKey = await bcrypt.compare(
                    body.key_tracking,
                    partner.key_tracking
                );
                if(!validKey) {
                    res.json(FailureResponse("05"))
                }
                if(validKey) {
                    const accessToken = jwt.sign({
                        partner_code: partner.partner_code
                    }, process.env.SECRET_KEY, {
                        expiresIn: "60s"
                    })
                    res.json(SuccessResponse({
                        accessToken: accessToken,
                    }))
                }
            }
            else {
                res.json(FailureResponse("05"))
            }
        } catch (error) {
            res.json(FailureResponse("06", error))
        }
    }
}

module.exports = PartnerController