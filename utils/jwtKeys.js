module.exports = {
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  issuer: process.env.JWT_ISSUER || "leavebot-auth",
  audience: process.env.JWT_AUDIENCE || "leavebot-services",
  accessTtl: process.env.JWT_ACCESS_TTL || "15m",
};
