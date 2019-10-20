const { post } = require('axios')
const endpoint = process.env.smsEndpoint
const authkey = process.env.smsAuthKey

const sendOTP = (mobiles, otp) => {
  return post(endpoint, {
    sender: 'SMTBIN',
    route: '4',
    country: '91',
    sms: [
      {
        message: `Please enter OTP ${otp} to open the dustbin.`,
        to: mobiles
      }
    ]
  }, { headers: { 'Content-Type': 'application/json', authkey: authkey } })
}

module.exports = {
  sendOTP
}
