const jwt = require('jsonwebtoken');

// Generates a signed JWT and sets it as an httpOnly cookie on the response
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  const cookieDays = Number(process.env.COOKIE_EXPIRES_DAYS) || 30;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: cookieDays * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
