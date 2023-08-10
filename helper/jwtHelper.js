const JWT = require('jsonwebtoken');

const jwtSettings = require('../constants/jwtSetting');

const generateToken = (user) => {
  const expiresIn = '24h';
  const algorithm = 'HS256'; 

  return JWT.sign(
    {
      iat: Math.floor(Date.now() / 1000),
      // email: user.email,
      // name: user.firstName,
      ...user,
      algorithm,
    },
    jwtSettings.SECRET,
    {
      expiresIn,
    },
  )
};

const generateRefreshToken = (id) => {
  const expiresIn = '30d';

  return JWT.sign({ id }, jwtSettings.SECRET, { expiresIn })
};

module.exports = {
  generateToken,
  generateRefreshToken,
};