const express = require('express')
const app = express()
const route = require('./src/routes')
const morgan = require('morgan')
const db = require('./src/config/connectdb')
const cors = require('cors');

require('dotenv').config();

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