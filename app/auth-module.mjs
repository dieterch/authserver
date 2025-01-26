import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const secretKey = process.env.SECRET_KEY || "default-secret-key";

// Load users from environment variables
const users = Object.entries(process.env)
  .filter(([key]) => key.startsWith("USER_"))
  .map(([_, value]) => {
    const [username, role, hashedPassword] = value.split(":");
    return { username, role, hashedPassword };
  });

// console.log(users)

/**
 * Authenticate user credentials.
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
export function authenticate(username, password) {
  const user = users.find((u) => u.username === username);
  return user && bcrypt.compareSync(password, user.hashedPassword);
}

/**
 * Get user.
 * @param {string} username
 * @returns {object}
 */
export function getuser(username) {
  const user = users.find((u) => u.username === username);
  return user;
}

/**
 * Generate a JWT token.
 * @param {string} username
 * @returns {string}
 */
export function generateToken(username) {
  return jwt.sign({ username }, secretKey, { expiresIn: process.env.JWT_LIFETIME });
}

/**
 * Verify the JWT token.
 * @param {string} token
 * @returns {object | null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
}

/**
 * Restrict access to /verify by checking the origin.
 * @param {string} origin
 * @returns {boolean}
 */
export function isAllowedOrigin(origin) {
  const allowedOrigins = ["auth-server"];
  return allowedOrigins.includes(origin);
}

/**
 * Restrict Authorization based on role and host
 * @param {string} role
 * @param {string} fwhost
 * @returns {boolean}
 */
export function isAllowedRole(role, fwhost) {
  const notAllowedAsUser = process.env.RESTRICTED_SERVERS.split(",")
  // console.log(notAllowedAsUser)
  return (role === 'admin') || !(notAllowedAsUser.includes(fwhost.split('.')[0]));
}