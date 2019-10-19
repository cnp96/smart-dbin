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

const validate = (params, payload) => {
  if (params.filter(p => !payload[p]).length) {
    return { status: 400, message: `${params.join(", ")} are required parameters.` }
  } else return null
}

const createOTP = () => parseInt(Math.random() * (9999 - 1000) + 1000)

// Register a Dustbin
router.post("/create/dustbin", async (req, res, next) => {
  const params = ["name", "secret"];
  const payload = _.pick(req.body, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getDustbinCollection()
    const findRes = await col.findOne({ name: payload.name })
    if (findRes) {
      next({ status: 400, message: "Dustbin already registered." })
    } else {
      const insRes = await col.insertOne(payload)
      if (insRes && insRes.result.ok) {
        res.json({ data: insRes.ops[0] })
      } else {
        next({ status: 503 })
      }
    }
  } catch (e) { next({ status: 500 }) }
})

// Generate OTP
router.post("/create/otp", async (req, res, next) => {
  const params = ["dustbin", "mobile"];
  const payload = _.pick(req.body, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getDustbinCollection()
    const findRes = await col.findOne({ name: payload.dustbin })
    if (findRes) {
      col.updateOne({ name: payload.dustbin }, { $set: { otp: createOTP() } }, { upsert: true })
        .then(otpRes => {
          if (!otpRes.result.ok) {
            throw new Error("Unable to generate OTP.")
          } else {
            // Send SMS to payload.mobile
            res.json({
              data: {
                dustbinName: payload.dustbin,
                otp
              }
            })
          }
        })
    } else next({ status: 404, message: "Invalid dustbin name." })
  }
  catch (e) { next({ status: 500 }) }
})

// Verify OTP
router.get("/verify/otp/:dustbin/:otp", async (req, res, next) => {
  const params = ["dustbin", "otp"]
  const payload = _.pick(req.params, params);
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getDustbinCollection()

    const dbinRes = await col.findOne({ name: payload.dustbin })
    if (!dbinRes) next({ status: 404, message: "Invalid dustbin name." })
    else {
      if (dbinRes.otp == payload.otp) {
        res.json({ data: "OTP verified." })
        col.updateOne({ _id: dbinRes._id }, { $set: { otp: createOTP() } }, { upsert: true })
      } else {
        next({ status: 403, message: "Invalid OTP." })
      }
    }
  }
  catch (e) { next({ status: 500 }) }
})

// Add/Update rewards
router.post("/user/reward", async (req, res, next) => {
  const params = ["mobile", "reward"]
  const payload = _.pick(req.body, params);
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getUsersCollection()
    const rwResp = await col.findOneAndUpdate({ mobile: payload.mobile }, { $inc: { reward: parseInt(payload.reward) } },
      { upsert: true, returnOriginal: false }
    )

    res.json(rwResp.value)
  }
  catch (e) { next({ status: 500 }) }
})

module.exports = router;