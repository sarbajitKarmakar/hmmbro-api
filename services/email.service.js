import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
// console.log(process.env.OTP_HOST, process.env.OTP_USER, process.env.OTP_SMTP_KEY);
const transporter = nodemailer.createTransport({
  host: process.env.OTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.OTP_USER ,
    pass: process.env.OTP_SMTP_KEY,
  }
});

// console.log("SMTP USER =", process.env.OTP_USER);
// console.log("SMTP KEY =", process.env.OTP_SMTP_KEY?.slice(0, 10));

const sendOtpEmail = async (to, subject, text) => {
  // await transporter.verify();
  // console.log("not here");
  // console.log("SMTP AUTH SUCCESS");
  
  const info = await transporter.sendMail({
    from: '"HmmBro" <no-reply@hmmbro.com>',
    to: to,
    subject: subject,
    text: text
  });
}

export {
    sendOtpEmail,
};

// import axios from "axios";

// const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// export async function sendOtpEmail({ to, otp }) {
//   try {
//     const res = await axios.post(
//       BREVO_URL,
//       {
//         sender: {
//           name: "HmmBro",
//           email: "no-reply@hmmbro.com"
//         },
//         to: [{ email: to }],
//         replyTo: {
//           name: "HmmBro Support",
//           email: "support@hmmbro.com"
//         },
//         subject: "Your HmmBro verification code",
//         textContent:
//           `Your verification code is ${otp}.\n` +
//           `This code is valid for 5 minutes.\n\n` +
//           `If you did not request this, you can ignore this email.`,
//         htmlContent:
//           `<p>Your verification code is <b>${otp}</b>.</p>` +
//           `<p>This code is valid for 5 minutes.</p>` +
//           `<p>If you did not request this, you can ignore this email.</p>`
//       },
//       {
//         headers: {
//           "api-key": process.env.BREVO_API_KEY,
//           "Content-Type": "application/json"
//         },
//         timeout: 10000
//       }
//     );

//     // Brevo returns a messageId when accepted
//     return res.data; // { messageId: "..." }
//   } catch (err) {
//     console.error(
//       "Brevo send error:",
//       err.response?.data || err.message
//     );
//     throw err;
//   }
// }
