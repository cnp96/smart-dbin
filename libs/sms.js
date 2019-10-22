const { post } = require('axios')
const endpoint = process.env.smsEndpoint
const authkey = process.env.smsAuthKey

const sendMsg = (mobiles, message, isPlainMsg) => {
  return post(endpoint, {
    sender: 'SMTBIN',
    route: '4',
    country: '91',
    sms: [
      {
        message: isPlainMsg ? message : `Please enter OTP ${message} to open the dustbin.`,
        to: mobiles
      }
    ]
  }, { headers: { 'Content-Type': 'application/json', authkey: authkey } })
}

module.exports = {
  sendMsg
}
