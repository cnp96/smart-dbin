const logger = require("./logger")
const express = require("express");
const app = express();
app.use(express.json())

// DB
const db = require("./db")
db.connect()
  .then(conn => logger.info("Connected to DB"))
  .then(db.close)

// Routes
app.use("/api", require("./routes/api"))
app.use(({ status, message }, req, res, next) => {
  switch (status) {
    case 500: message = "Internal sever error"; break;
    case 503: message = "Service not available"; break;
    default:
  }
  res.status(status || 500).json({ status, message })
})

// Cleanup
require("./cleanup")()

const port = process.env.PORT || 5000;
app.listen(port, () => logger.info(`Server started on PORT ${port}`))