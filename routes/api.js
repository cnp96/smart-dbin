const router = require("express").Router()
const _ = require("lodash")
const db = require("../db")

/**
 * MODEL
 * 
 * users
 *  - name, mobile, rewards, created_on, modified_on
 * 
 * dustbin
 *  - name, otp, secret
 * 
 */

// Register a Dustbin
router.post("/dustbin", (req, res, next) => {
  const params = ["name", "secret"];
  const payload = _.pick(req.body, params)
  if (params.filter(p => !payload[p]).length) {
    return next({ status: 400, message: "Invalid parameters." })
  }

  db.getDustbinCollection()
    .then(col => {
      col.findOne({ name: payload.name }, (err, result) => {
        if (err) next({ status: 500 })
        else if (result) {
          next({ status: 400, message: "Dustbin already registered" })
        } else {
          col.insertOne(payload, (err, { result }) => {
            if (err) next({ status: 500 })
            else if (result.ok) {
              res.json({
                data: result.ops[0]
              })
            } else {
              next({ status: 503 })
            }
          })
        }
      })

    }).catch((err) => next({ status: 500 }))
})

// Generate OTP

// Verify OTP

// Add/Update rewards

module.exports = router;