import crypto from "crypto";


const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export { hashOTP,generateRandomOTP };