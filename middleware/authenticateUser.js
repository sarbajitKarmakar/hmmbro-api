import { verifyToken } from "../services/auth.js";

export default function authenticateUserddd(req, res, next) {
  const authHeader = req.headers["authorization"];
  // console.log(authHeader);
  
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);
  

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  const user = verifyToken(token)
  // console.log(user);
  
  if (user === null ) return res.status(403).json({ message: "Invalid or expired token" });

  req.user = user; // store decoded user info for later use
  next();
}
