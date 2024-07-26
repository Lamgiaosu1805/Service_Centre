const f88Router = require('./f88service')
const customerRouter = require('./customer')
const systemRouter = require('./system')

const api_ver = "/api/v1"
const route = (app) => {
    app.use(`${api_ver}/f88`, f88Router)
    app.use(`${api_ver}/customer`, customerRouter)
    app.use(`${api_ver}/system`, systemRouter)
}

module.exports = route;