const jwt = require("jsonwebtoken");

const createJwt = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};

const authenticate = (req, res, next) => {
  const token = req.cookies.JWT_token;

  try {
    const decoedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoedToken;
    console.log("authenticated success");
    next();
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

module.exports = { createJwt, authenticate };
