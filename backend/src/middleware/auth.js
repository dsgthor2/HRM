import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied. Super Admins only." });
  }
  next();
};

export default auth;
