const bcrypt = require('bcrypt');
const { FailureResponse, SuccessResponse } = require('../utils/ResponseRequest');
const AccountModel = require('../models/AccountModel');
const jwt = require('jsonwebtoken');

const AccountController = {
    createAccount: async (req, res) => {
        const {body} = req
        try {
            const user = await AccountModel.findOne({username: body.username})
            if(user) {
                res.json(FailureResponse("10"))
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(body.password, salt);
                const newAccount = new AccountModel({
                    username: body.username,
                    password: hashed,
                    roleId: 2,
                    fullName: body.fullname,

                });
                await newAccount.save()
                res.json(SuccessResponse())
            }
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("11", error))
        }
    },
    signIn: async (req, res) => {
        const {body} = req
        try {
            const user = await AccountModel.findOne({username: body.username})
            if(user) {
                const validKey = await bcrypt.compare(
                    body.password,
                    user.password
                );
                if(!validKey) {
                    res.json(FailureResponse("14"))
                }
                else {
                    const accessToken = jwt.sign({
                        id: user._id,
                        username: user.username,
                        roleId: user.roleId,
                    }, process.env.SECRET_KEY_ACCOUNT, {
                        expiresIn: "365d"
                    })
                    const {password, ...others} = user._doc;
                    res.json(SuccessResponse({...others, accessToken}))
                }
            }
            else {
                res.json(FailureResponse("14"))
            }
        } catch (error) {
            console.log(error)
            res.json(FailureResponse("15", error))
        }
    }
}

module.exports = AccountController