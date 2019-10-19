const express = require("express");
const app = express();

const logger = require("./logger")

// DB
const db = require("./db")
db.connect()
  .then(conn => logger.info("Connected to DB"))
  .then(db.close)

// Routes
const apiRoutes = require("./routes/api")
app.use("/api", apiRoutes)
app.use((err, req, res, next) => {
  logger.error(err.message)
  res.status(err.status).json(err)
})

// Cleanup
require("./cleanup")()

const port = process.env.PORT || 5000;
app.listen(port, () => logger.info(`Server started on PORT ${port}`))