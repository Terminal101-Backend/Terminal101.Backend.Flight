const fs = require("fs");
const { gmail } = require("../services");
// const nodemailer = require("nodemailer");

const renderTemplate = (template, variables = {}) => {
  let result = template;

  for ([key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\{\{\s*${key}\s*\}\}`, "ig"), value);
  }

  return result;
};

// const sendByNodemailer = async ({ to, cc, replyTo, subject, content, plainContent, attachments = [] }) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: true,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     }
//   });
//   const message = {
//     from: process.env.EMAIL_ADDRESS,
//     to,
//     subject,
//     html: content,
//   }
//   transporter.verify(function (error, success) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Server is ready to take our messages');
//     }
//   });
//   transporter.sendMail(message, console.log);
// };

const sendByGmail = async ({ to, cc, replyTo, subject, content, plainContent, attachments = [] }) => {
  const options = {
    to,
    cc,
    replyTo,
    subject,
    text: plainContent ?? content,
    html: content,
    attachments,
    textEncoding: 'base64',
    headers: [
      // { key: 'X-Application-Developer', value: 'Test1' },
      // { key: 'X-Application-Version', value: 'v1.0.0.2' },
    ],
  };

  const messageId = await gmail.sendMail(options);
  return messageId;
};

module.exports.sendVerificationEmail = async (to, link, code) => {
  let content = fs.readFileSync(process.env.TEMPLATE_EMAIL_VERIFICATION_FILE).toString();

  return sendByGmail({
    to,
    subject: "Verification Email",
    content: renderTemplate(content, { link, code }),
    // attachments: [
    //   {
    //     fileNmae: "logo.svg",
    //     path: "https://terminal101-static.s3.ir-thr-at1.arvanstorage.com/logo.svg",
    //     cid: "unique@logo",
    //   }
    // ]
  });
};

module.exports.sendResetPasswordEmail = async (to, link) => {
  let content = "<a href='{{link}}'>Click Here</a>" ?? fs.readFileSync(process.env.TEMPLATE_EMAIL_FORGOT_PASSWORD_FILE).toString();

  return sendByGmail({
    to,
    subject: "Reset Password",
    content: renderTemplate(content, { link }),
    // attachments: [
    //   {
    //     fileNmae: "logo.svg",
    //     path: "https://terminal101-static.s3.ir-thr-at1.arvanstorage.com/logo.svg",
    //     cid: "unique@logo",
    //   }
    // ]
  });
};

module.exports.sendTicket = async (to, bookedFlightCode) => {
  let content = !!process.env.TEMPLATE_EMAIL_TICKET_FILE ? fs.readFileSync(process.env.TEMPLATE_EMAIL_TICKET_FILE).toString() : "Your ticket is ready.";

  return sendByGmail({
    to,
    subject: "Flight ticket",
    content: renderTemplate(content),
    attachments: [
      {
        fileNmae: "ticket.pdf",
        path: "app/static/tickets/" + bookedFlightCode + ".pdf",
        // cid: "unique@logo",
      }
    ]
  });
};
