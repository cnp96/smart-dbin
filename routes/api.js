const router = require('express').Router()
const _ = require('lodash')
const db = require('../libs/db')
const sms = require('../libs/sms')
const logger = require('../libs/logger')

/**
 * MODEL
 *
 * users
 *  - name, mobile, rewards
 *
 * dustbin
 *  - name, otp, otpExpiry, secret
 *
 */

// Utils
const validate = (params, payload) => {
  if (params.filter(p => !payload[p]).length) {
    logger.error('Received parameters', Object.keys(payload))
    return { status: 400, message: `${params.join(', ')} are required parameters.` }
  } else return null
}

const createOTP = () => parseInt(Math.random() * (9999 - 1000) + 1000)
const otpExpiry = 60000 // 1 minute

/** Routes */
// Register a Dustbin
router.post('/create/dustbin', async (req, res, next) => {
  const params = ['name', 'secret']
  const payload = _.pick(req.body, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getDustbinCollection()
    const findRes = await col.findOne({ name: payload.name })
    if (findRes) {
      next({ status: 400, message: 'Dustbin already registered.' })
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
router.post('/create/otp', async (req, res, next) => {
  const params = ['dustbin', 'mobile']
  const payload = _.pick(req.body, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getDustbinCollection()
    const findRes = await col.findOne({ name: payload.dustbin })
    if (findRes) {
      // Generate OTP, if expired
      let otp
      if (findRes.otpExpiry <= Date.now()) {
        otp = createOTP()
        const createOTPResp = await col.updateOne({ name: payload.dustbin },
          { $set: { otp, otpExpiry: Date.now() + otpExpiry } },
          { upsert: true }
        ).catch(e => {
          logger.error('Create OTP error', e.message)
          return next({ status: 503, message: 'Failed to send OTP.' })
        })

        if (!createOTPResp.result.ok) {
          return next({ status: 503, message: 'Failed to send OTP.' })
        }
      } else {
        otp = findRes.otp
      }

      // Send OTP
      sms.sendMsg([payload.mobile], otp)
        .then(r => {
          res.json({
            data: {
              dustbinName: payload.dustbin,
              mobile: payload.mobile
            }
          })
        }).catch(e => {
          logger.error('OTP Send error', e)
          next({ status: 503, message: 'Failed to send OTP. Please try again.' })
        })
    } else next({ status: 404, message: 'Invalid dustbin name.' })
  } catch (e) { next({ status: 500 }) }
})

// Verify OTP
router.get('/verify/otp/:dustbin/:mobile/:otp', async (req, res, next) => {
  const params = ['dustbin', 'otp', 'mobile']
  const payload = _.pick(req.params, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getDustbinCollection()

    const dbinRes = await col.findOne({ name: payload.dustbin })
    if (!dbinRes) next({ status: 404, message: 'Invalid dustbin name.' })
    else {
      if (dbinRes.otp == payload.otp) {
        if (dbinRes.otpExpiry < Date.now()) {
          next({ status: 403, message: 'OTP has expired.' })
        } else {
          res.json({ data: 'OTP verified.' })
          try {
            // Create user
            const userCol = await db.getUsersCollection()
            const findUser = await userCol.findOne({ mobile: payload.mobile })
            if (!findUser) {
              userCol.insertOne({ mobile: payload.mobile, reward: 0 })
            } else {
              // Update reward by 10 points
              col.findOneAndUpdate({ _id: findUser._id }, { $inc: { reward: 10 } },
                { upsert: true, returnOriginal: false })
                .then(r => {
                  logger.info(`Updated reward for ${findUser.mobile} is ${r.value.reward}`)
                  sms.sendMsg([payload.mobile], `Your updated reward points is ${r.value.reward}`, true)
                    .then(s => {
                      logger.info(`Message sent - Reward update for ${payload.mobile} = ${r.value.reward}`)
                    }).catch(e => {
                      logger.error(`Message not sent - Reward update for ${payload.mobile}`, e)
                    })
                })
                .catch(e => {
                  logger.error(`Unable to update reward for ${findUser.mobile}`, e.message)
                })
            }
          } catch (e) { logger.error('Create user error', e) }
        }
        col.updateOne({ _id: dbinRes._id }, { $set: { otp: createOTP(), otpExpiry: Date.now() + otpExpiry } }, { upsert: true })
      } else {
        next({ status: 403, message: 'Invalid OTP.' })
      }
    }
  } catch (e) { next({ status: 500 }) }
})

// Add/Update rewards
router.post('/user/reward', async (req, res, next) => {
  const params = ['mobile', 'reward']
  const payload = _.pick(req.body, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getUsersCollection()
    const rwResp = await col.findOneAndUpdate({ mobile: payload.mobile }, { $inc: { reward: parseInt(payload.reward) } },
      { upsert: true, returnOriginal: false }
    )

    res.json(rwResp.value)
  } catch (e) { next({ status: 500 }) }
})

// Fetch reward points
router.get('/user/reward/:mobile', async (req, res, next) => {
  const params = ['mobile']
  const payload = _.pick(req.params, params)
  const _isInvalid = validate(params, payload)
  if (_isInvalid) return next(_isInvalid)

  try {
    const col = await db.getUsersCollection()
    const user = await col.findOne({ mobile: payload.mobile })
    if (!user) {
      next({ status: 404, message: 'This mobile is not registered.' })
    } else {
      res.json(user)
    }
  } catch (e) {
    next({ status: 500 })
  }
})

module.exports = router
