const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

const getGmailService = async () => {
  const oAuth2Client = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URL);
  // const { tokens } = await oAuth2Client.getToken(process.env.GMAIL_CODE);
  const tokens = {
    access_token: process.env.EMAIL_ACCESS_TOKEN,
    refresh_token: process.env.EMAIL_REFRESH_TOKEN,
    scope: process.env.EMAIL_SCOPE,
    token_type: process.env.EMAIL_TOKEN_TYPE,
    expiry_date: process.env.EMAIL_EXPIRY_AT
  };
  oAuth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  return gmail;
};

const encodeMessage = (message) => {
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const createMail = async (options) => {
  const mailComposer = new MailComposer(options);
  const message = await mailComposer.compile().build();
  return encodeMessage(message);
};

module.exports.sendMail = async (options) => {
  const gmail = await getGmailService();
  const rawMessage = await createMail(options);
  const { data: { id } = {} } = await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: rawMessage,
    },
  });
  return id;
};
