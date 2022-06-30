const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

const getGmailService = async () => {
  const oAuth2Client = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URL);
  // const { tokens } = await oAuth2Client.getToken(process.env.GMAIL_CODE);
  const tokens = {
    access_token: "ya29.a0ARrdaM-D-iaOL6PeicB9MaOufdwAsEyNcgS1HKrm0M6fuA7c37k45IwF_UB_N9tZUt0eKYe7-rMuYebCnRqzf9QU51tcPBLtsrfJmKw4Md5Ej9TBhFmYZuu_PaIM2DrabI0Opn4VMlF2bzT1zvJdK5_rSZ3h",
    refresh_token: "1//095tsv6gjuwPyCgYIARAAGAkSNwF-L9Irz_EyWOwRbVzqvbc8rPxI4i6pm7iKL8AhjAl0fH81zW-wpAG4Z6rO-watamo-Rlx4h_M",
    scope: "https://www.googleapis.com/auth/gmail.send",
    token_type: "Bearer",
    expiry_date: 1653559255803
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
