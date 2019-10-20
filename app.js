require('dotenv').config()
const morgan = require('morgan')
const logger = require('./libs/logger')
const express = require('express')
const app = express()
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api', require('./routes/api'))
app.use(({ status, message }, req, res, next) => {
  switch (status) {
    case 500: message = message || 'Internal sever error'; break
    case 503: message = message || 'Service not available'; break
    default:
  }
  res.status(status || 500).json({ status, message })
})

// Cleanup
require('./cleanup')()

const port = process.env.PORT || 5000
app.listen(port, () => logger.info(`Server started on PORT ${port}`))
