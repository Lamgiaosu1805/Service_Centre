const f88Router = require('./f88service')
const customerRouter = require('./customer')
const systemRouter = require('./system')
const partnerRouter = require('./partner')
const accountRouter = require('./account')

const api_ver = "/api/v1"
const route = (app) => {
    app.use(`${api_ver}/f88`, f88Router)
    app.use(`${api_ver}/customer`, customerRouter)
    app.use(`${api_ver}/system`, systemRouter)
    app.use(`${api_ver}/partner`, partnerRouter)
    app.use(`${api_ver}/account`, accountRouter)
}

module.exports = route;