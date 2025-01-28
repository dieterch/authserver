import express from "express";
import  cookieParser from "cookie-parser"; // Middleware for cookies
import fs from 'fs/promises';
import path from 'path';
import { authenticate, getuser, generateToken, verifyToken, isAllowedOrigin, isAllowedRole } from "./auth-module.mjs";
import { loginpage, logoutpage, forbiddenpage } from "./html-module.mjs";

const logFile = path.resolve('auth-log.txt');
// Helper function to log events
const logEvent = async (user, action, status) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | User: ${user} | Action: ${action} | Status: ${status}\n`;
  console.log(logEntry); // Log to console
  await fs.appendFile(logFile, logEntry); // Append to log file
};

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const cookieOptions = {
    httpOnly: true, 
    secure: true,     // Ensure this is true for HTTPS
    sameSite: "Lax",  // Ensures cookies are sent on navigation from one subdomain to another
    domain: process.env.DOMAIN, //".home.smallfamilybusiness.net", // Makes the cookie available across all subdomains
    maxAge: parseInt(process.env.COOKIE_LIFETIME) 
}
let host = ''

// Main Page: Show Logout Button if the user has a valid cookie
app.get("/", (req, res) => {
  const token = req.cookies.authhome;
  // if authenticated go to the logoutpage
  const rec = verifyToken(token)
  if (token && rec) {

    // Formatter für Europe/Vienna
    const formatter = new Intl.DateTimeFormat('de-AT', {
      timeZone: 'Europe/Vienna',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
    });

    const prompt = `${String(rec.username).toUpperCase()}, ${formatter.format(new Date(rec.exp * 1000))}`
    return res.send(logoutpage(prompt));
  }
  // else go to login.
  res.redirect("/login");
});

// Show the Login Page
app.get("/login", (req, res) => {
  const redirectUrl = host || "/";
  res.send(loginpage(redirectUrl))
});

// Handle Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (authenticate(username, password)) {
    const token = generateToken(username);
    const rec = verifyToken(token)
    console.log(cookieOptions)
    res.cookie("authhome", token, cookieOptions); // Set secure cookie
    await logEvent(username, 'login', 'success');
    return res.redirect(req.query.redirect || "/login");
  }


  await logEvent(username, 'login', 'fail');
  res.status(401).send(forbiddenpage('Invalid credentials'));
});

// Logout Endpoint: Clear the cookie and redirect to login
app.post("/logout", async (req, res) => {

  const token = req.cookies.authhome;
  const rec = verifyToken(token)
  await logEvent(rec.username, 'logout', 'n/a');
  
  // workaraund: set an invalid auth cookie to log out, because clearcookie does not clear domain cokkies
  res.cookie("authhome", 'xxx', cookieOptions);
  res.redirect("/login");
});

// Verify Endpoint (Internal Access Only)
app.get("/verify", (req, res) => {
  host = req.headers['x-forwarded-proto'] + '://' + req.headers['x-forwarded-host']

  // restrict acess to internal
  const origin = req.hostname;
  // console.log('origin:',origin)
  if (!isAllowedOrigin(origin)) {
    return res.status(403).send(forbiddenpage('Access restricted.'));
  }

  const token = req.cookies.authhome;

  if (!token || !verifyToken(token)) {
    // redirect to login:
    const redirecto = req.headers['x-forwarded-proto'] + '://auth' + process.env.DOMAIN + '/login'
    return res.redirect(302,redirecto);
  }

  // role based authorization
  const rec = verifyToken(token)
  const user = getuser(rec.username)
  // console.log()
  // console.log('================================')
  // console.log(user)
  // console.log('referer:', req.headers.referer)
  // console.log('x-forwarded-host:',req.headers['x-forwarded-host'])
  const allowed = isAllowedRole(user.role,req.headers['x-forwarded-host']) 
  // console.log(allowed)

  if (allowed) {
    // Authorized
    res.sendStatus(200);
  } else {
    res.status(403).send(forbiddenpage('Access restricted'));
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
