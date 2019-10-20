const db = require('./libs/db')
const logger = require('./libs/logger')

module.exports = function () {
  const signals = ['SIGTERM', 'SIGINT']
  signals.forEach(s => {
    process.on(s, () => {
      console.log(s)
      const close = db.close()
      if (close === 1) {
        logger.info('DB connection closed')
      } else if (close === -1) {
        logger.info('No active connections')
      } else {
        logger.info('Error closing DB connection')
      }
      process.exit()
    })
  })

  // process.on("unhandledRejection", (reason, promise) => {
  //   logger.error("Caught unhandledRejection", reason)
  // })
}
