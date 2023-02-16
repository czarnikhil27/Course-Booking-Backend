
const nodeMailer = require('nodemailer');
async function sendEmail (options) {
    // 1) create transported - define which service to use

    const transporter = nodeMailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "e74e9135149332",
            pass: "3a6dcff001403d"
  }
    })
    // 2) define email options
    
    const mailOptions = {
        from : 'Nikhil Jha <czarnikhil27@gmail.com>',
        to : options.email,
        subject : options.subject,
        text : options.message
    }

    //send email
    console.log("line15")
    await transporter.sendMail(mailOptions)
}
module.exports = { sendEmail}