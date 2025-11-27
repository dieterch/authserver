import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();
const ENV_PATH = path.resolve(process.cwd(), '.env');

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

// /**
//  * Restrict access to /verify by checking the origin.
//  * @param {string} origin
//  * @returns {boolean}
//  */
// export function isAllowedOrigin(origin) {
//   const allowedOrigins = ["auth-server"];
//   return allowedOrigins.includes(origin);
// }

/**
 * Restrict access to /verify by checking the origin.
 * @param {string} origin
 * @returns {boolean}
 */
export function isAllowedOrigin(origin) {
    if (!origin) return false;
    try {
        return origin.endsWith(process.env.DOMAIN);
    } catch (e) {
        return false;
    }
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

/**
 * Read users from .env file
 * @returns {array}
 */
export function loadUsersFromEnv() {
    const env = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
    const users = [];

    env.forEach(line => {
      if (line.startsWith('USER_')) {
        const [, value] = line.split('=');
        const [username, role, hash] = value.trim().split(':');
        users.push({ username, role, hash });
      }
    });
    return users;
}

/**
 * Save users to .env file
 * @param {array} users
 */
export function saveUsersToEnv(users) {
  let env = fs.readFileSync(ENV_PATH, 'utf8').split('\n');

  // Remove old USER_ lines
  env = env.filter(line => !line.startsWith('USER_'));

  users.forEach(user => {
    env.push(`USER_${user.username.toUpperCase()}=${user.username}:${user.role}:${user.hash}`);
  });

  fs.writeFileSync(ENV_PATH, env.join('\n'));
}

/**
 * Admin-Guard Middleware
 */
export function adminOnly(req, res, next) {
  const token = req.cookies.authhome;
  if (!token || !verifyToken(token)) return res.redirect('/login');

  const data = verifyToken(token);
  const user = getuser(data.username);

  if (!user || user.role !== 'admin') {
    return res.status(403).send('Admins only');
  }

  next();
}

/**
 * Reload .env file
 */
export function reloadEnv() {
  const envConfig = dotenv.parse(fs.readFileSync('.env'));

  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}
