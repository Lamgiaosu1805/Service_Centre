const jwt = require('jsonwebtoken');
const PartnerModel = require('../models/PartnerModel');
const AccountModel = require('../models/AccountModel');
const { FailureResponse } = require('../utils/ResponseRequest');

const auth = {
    //verify
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization;
        if(token) {
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.SECRET_KEY, async (err, partner) => {
                if(err) {
                    res.json(FailureResponse('07'))
                }
                else {
                    req.partner = partner;
                    try {
                        const validatedPartner = await PartnerModel.findOne({partner_code: partner.partner_code})
                        if(!validatedPartner?.is_delete) {
                            next();
                        }
                        else {
                            res.json(FailureResponse("05"))
                        }
                    } catch (error) {
                        console.log(error)
                        res.json(FailureResponse("08", error))
                    }
                    
                }
            })
        }
        else {
            res.json(FailureResponse('09'))
            console.log("Not Authenticated")
        }
    },

    verifyAccount: (req, res, next) => {
        const token = req.headers.authorization;
        if(token) {
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.SECRET_KEY_ACCOUNT, async (err, user) => {
                if(err) {
                    res.json(FailureResponse('07'))
                }
                else {
                    req.user = user;
                    try {
                        const validatedUser = await AccountModel.findById(user.id)
                        if(!validatedUser?.isDelete) {
                            next();
                        }
                        else {
                            res.json(FailureResponse("12"))
                        }
                    } catch (error) {
                        console.log(error)
                        res.json(FailureResponse("13", error))
                    }
                    
                }
            })
        }
        else {
            res.json(FailureResponse('09'))
            console.log("Not Authenticated")
        }
    },

    // verifyTokenForAdmin: (req, res, next) => {
    //     auth.verifyToken(req, res, () => {
    //         if(req.user.roleId <= 1) {
    //             next();
    //         }
    //         else {
    //             res.json(FailureResponse('14'))
    //         }
    //     })
    // },

    // verifyTokenForAdminXuDoan: (req, res, next) => {
    //     auth.verifyToken(req, res, () => {
    //         if(req.user.roleId <= 2 ) {
    //             next();
    //         }
    //         else {
    //             res.status(403).json("Not Allowed")
    //         }
    //     })
    // }

}

module.exports = auth;