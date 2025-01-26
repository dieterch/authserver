import express from "express";
import  cookieParser from "cookie-parser"; // Middleware for cookies
import { authenticate, getuser, generateToken, verifyToken, isAllowedOrigin, isAllowedRole } from "./auth-module.mjs";
import { loginpage, logoutpage } from "./html-module.mjs";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const cookieOptions = {
    httpOnly: true, 
    secure: true,     // Ensure this is true for HTTPS
    sameSite: "Lax",  // Ensures cookies are sent on navigation from one subdomain to another
    domain: process.env.DOMAIN //".home.smallfamilybusiness.net", // Makes the cookie available across all subdomains
}
let host = ''

// Main Page: Show Logout Button if the user has a valid cookie
app.get("/", (req, res) => {
  const token = req.cookies.auth;
  // if authenticated go to the logoutpage
  if (token && verifyToken(token)) {
    const rec = verifyToken(token)

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
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (authenticate(username, password)) {
    const token = generateToken(username);
    res.cookie("auth", token, cookieOptions); // Set secure cookie
    return res.redirect(req.query.redirect || "/login");
  }

  res.status(401).send("<h2>Invalid credentials</h2>");
});

// Logout Endpoint: Clear the cookie and redirect to login
app.post("/logout", (req, res) => {
  // workaraund: set an invalid auth cookie to log out, because clearcookie does not clear domain cokkies
  res.cookie("auth", 'xxx', cookieOptions);
  res.redirect("/login");
});

// Verify Endpoint (Internal Access Only)
app.get("/verify", (req, res) => {
  host = req.headers['x-forwarded-proto'] + '://' + req.headers['x-forwarded-host']

  // restrict acess to internal
  const origin = req.hostname;
  // console.log('origin:',origin)
  if (!isAllowedOrigin(origin)) {
    return res.status(403).send("<h2>Forbidden</h2>");
  }

  const token = req.cookies.auth;

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
    res.status(403).send("<h2>Forbidden</h2>");
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
