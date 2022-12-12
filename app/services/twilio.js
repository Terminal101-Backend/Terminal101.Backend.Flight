let client;

module.exports.initialize = () => {
  try {
    client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    console.log("Twilio initilized");
  } catch (e) {
    console.warn("Twilio not initilized");
  }
};

const send = async (to, message) => {
  const response = await client.messages
    .create({
      body: message,
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      // from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
  // .then(message => console.log(message.sid));

  return response;
};

module.exports.sendVerificationCode = async (to, code) => {
  const response = await send(to, `Your verification code: ${code}`);
  console.log(response);
};

module.exports.sendTicket = async to => {
  const response = await send(to, `Your ticket is ready\nhttps://terminal101.co`);
  console.log(response);
};
