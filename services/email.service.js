import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
// console.log(process.env.OTP_HOST, process.env.OTP_USER, process.env.OTP_SMTP_KEY);
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",              // MUST be hardcoded
    pass: "xsmtpsib-8cf0d13613786a25d54a228ce9c552f246bdd264027664d17a39f97ed2943eff-qdHBr7KkznkIOsqz"
  }
});


// console.log("SMTP USER =", process.env.OTP_USER);
// console.log("SMTP KEY =", process.env.OTP_SMTP_KEY?.slice(0, 10));

const sendOtpThroughEmail = async (to, subject, text) => {
  await transporter.verify();
  console.log("not here");
  console.log("SMTP AUTH SUCCESS");
  
  const info = await transporter.sendMail({
    from: '"HmmBro" <no-reply@hmmbro.com>',
    to: to,
    subject: subject,
    text: text
  });
}

export {
    sendOtpThroughEmail
};