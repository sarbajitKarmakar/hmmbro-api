import bcrypt from "bcrypt";

const saltRounds = 10;

// Function to hash a password
const hashPassword = async (plainPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

// Function to verify a password
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error verifying password:", error);
  }
};

export { hashPassword, verifyPassword };