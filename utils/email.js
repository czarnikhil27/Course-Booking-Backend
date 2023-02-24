const nodeMailer = require("nodemailer");
async function sendEmail(options) {
  // 1) create transported - define which service to use

      const transporter = nodeMailer.createTransport({
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD
    }
      })
//   const transporter = nodeMailer.createTransport({
//     service: "SendGrid",
//     auth: {
//       user: process.env.SENDGRID_KEY,
//       pass: process.env.SENDGRID_SECRET,
//     },
//   });
  // 2) define email options

  const mailOptions = {
    from: `Nikhil Jha ${MY_MAIL}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send email
  console.log("line15");
  await transporter.sendMail(mailOptions);
}
module.exports = { sendEmail };
