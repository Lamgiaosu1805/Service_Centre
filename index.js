const express = require('express')
const app = express()
const route = require('./src/routes')
const morgan = require('morgan')
const db = require('./src/config/connectdb')
const cors = require('cors');
const schedule = require('node-schedule')
const { pushDocument } = require('./src/controllers/F88ServiceController')
require('dotenv').config();

//===================== JOB===============
const pushDocumentJob = async () => {
  // const hour = new Date().getHours()
  await pushDocument(false, null, 10)
  // if(hour == 8 || hour == 15) {
  //   await pushDocument(false, null, 30)
  // }
  // else {
  //   await pushDocument(false, null, 40)
  // }
}
const rule = new schedule.RecurrenceRule()
rule.dayOfWeek = [1, 2, 3, 4, 5];
rule.hour = [10, 13, 15];
rule.minute = 30
// schedule.scheduleJob(rule, pushDocumentJob)
//===================== JOB=================

//use middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(cors());

//connectdb
db.connect()

//routing
route(app);

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Service listening on port ${port}`)
})