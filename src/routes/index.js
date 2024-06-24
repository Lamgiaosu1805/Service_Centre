const f88Router = require('./f88service')

const api_ver = "/api/v1"
const route = (app) => {
    app.use(`${api_ver}/f88`, f88Router)
}

module.exports = route;