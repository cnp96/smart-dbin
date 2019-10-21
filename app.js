require('dotenv').config()
const morgan = require('morgan')
const logger = require('./libs/logger')
const express = require('express')
const path = require('path')

// Middlewares
const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'static/build')))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length')
  next()
})

// Routes
app.use('/api', require('./routes/api'))
app.use('*', (req, res, next) => res.sendFile(path.join(__dirname, 'static/build/index.html')))
app.use(({ status, message }, req, res, next) => {
  switch (status) {
    case 500: message = message || 'Internal sever error'; break
    case 503: message = message || 'Service not available'; break
    default:
  }
  res.json({ status, message })
})

// Cleanup
require('./cleanup')()

const port = process.env.PORT || 5000
app.listen(port, () => logger.info(`Server started on PORT ${port}`))
