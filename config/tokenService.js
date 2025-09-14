const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const argon2 = require("argon2");
// const { privateKey, issuer, audience, accessTtl } = require("../utils/jwtKeys");
const { privateKey, issuer, audience, accessTtl } = require("../utils/jwtKeys");
const User = require("../models/User");

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: accessTtl,
      issuer,
      audience,
    }
  );
}

async function issueRefreshToken(user, meta = {}) {
  const id = uuidv4();
  const secret = crypto.randomBytes(32).toString("hex");
  const hash = await argon2.hash(secret);

  user.refreshTokens.push({
    id,
    hash,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  await user.save();

  return `${id}.${secret}`; // composite token; only client holds secret
}

async function rotateRefreshToken(presented) {
  const [id, secret] = String(presented).split(".");
  if (!id || !secret) return { ok: false, code: 400, msg: "Malformed token" };

  const user = await User.findOne({ "refreshTokens.id": id });
  if (!user) return { ok: false, code: 403, msg: "Invalid refresh token" };

  const rec = user.refreshTokens.find((t) => t.id === id);
  const valid = await argon2.verify(rec.hash, secret);

  if (!valid) {
    // reuse / theft → revoke all
    user.refreshTokens = [];
    await user.save();
    return {
      ok: false,
      code: 403,
      msg: "Reuse detected. All sessions revoked.",
    };
  }

  // rotate in place
  rec.lastUsedAt = new Date();
  const newId = uuidv4();
  const newSecret = crypto.randomBytes(32).toString("hex");
  rec.id = newId;
  rec.hash = await argon2.hash(newSecret);
  await user.save();

  const accessToken = signAccessToken(user);
  const newRefreshToken = `${newId}.${newSecret}`;

  return { ok: true, accessToken, newRefreshToken };
}

async function revokeById(id) {
  await User.updateOne(
    { "refreshTokens.id": id },
    { $pull: { refreshTokens: { id } } }
  );
}

async function revokeAll(userId) {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}

module.exports = {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeById,
  revokeAll,
};
