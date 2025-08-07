const jwt = require('jsonwebtoken');

const authenticateTokenAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Xác thực thất bại" });
    }

    // Kiểm tra quyền admin
    if (!decoded.is_admin) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = authenticateTokenAdmin;
