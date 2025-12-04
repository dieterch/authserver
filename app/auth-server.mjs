import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import path from "path";

const __dirname = process.cwd(); // in ES modules richtig

import {
  authenticate,
  getuser,
  generateToken,
  verifyToken,
  isAllowedOrigin,
  isAllowedRole,
  loadUsersFromEnv,
  adminOnly,
  saveUsersToEnv,
  reloadEnv,
} from "./auth-module.mjs";

import {
  loginpage,
  logoutpage,
  forbiddenpage,
  adminUsersPage,
} from "./html-module.mjs";
import { log, levels } from "./logger.mjs";

const app = express();
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "static")));

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
  domain: process.env.DOMAIN,
  maxAge: parseInt(process.env.COOKIE_LIFETIME),
};

let host = "";

/**
 * Helper: Liefert nur die Origin (scheme + host), z.B.:
 * https://expense.home.smallfamilybusiness.net
 *
 * Bevorzugt Traefik-Header, fällt sauber zurück.
 */
function getOrigin(req) {
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "http")
    .split(",")[0]
    .trim();
  const hostHeader = (
    req.headers["x-forwarded-host"] ||
    req.get("host") ||
    "localhost"
  )
    .split(",")[0]
    .trim();
  return `${proto}://${hostHeader}`;
}

/**
 * Hauptroute – zeigt je nach Login-Status Login oder Logout-Seite
 */
app.get("/", async (req, res) => {
  const token = req.cookies.authhome;
  const session = verifyToken(token);

  if (session) {
    await log(levels.INFO, "User session active", {
      user: session.username,
      url: getOrigin(req),
    });
    return res.send(logoutpage(session.username));
  }

  res.redirect("/login");
});

/**
 * Login-Seite anzeigen
 */
app.get("/login", (req, res) => {
  const redirectUrl = host || "/";
  res.send(loginpage(redirectUrl));
});

/**
 * Login-Verarbeitung
 */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (authenticate(username, password)) {
    const token = generateToken(username);
    res.cookie("authhome", token, cookieOptions);

    await log(levels.SECURITY, "Login erfolgreich", {
      user: username,
      ip: req.ip,
      url: getOrigin(req),
    });
    return res.redirect(req.query.redirect || "/");
  }

  await log(levels.SECURITY, "Login fehlgeschlagen", {
    user: username,
    ip: req.ip,
    url: getOrigin(req),
  });
  res.status(401).send(forbiddenpage("Invalid credentials"));
});

/**
 * Logout
 */
app.post("/logout", async (req, res) => {
  const session = verifyToken(req.cookies.authhome);

  if (session) {
    await log(levels.INFO, "Logout", {
      user: session.username,
      url: getOrigin(req),
    });
  }

  res.cookie("authhome", "xxx", cookieOptions);
  res.redirect("/login");
});

/**
 * Verify-Endpunkt für Traefik ForwardAuth
 */
app.get("/verify", async (req, res) => {
  host =
    req.headers["x-forwarded-proto"] + "://" + req.headers["x-forwarded-host"];
  const origin = req.hostname;

  if (!isAllowedOrigin(origin)) {
    await log(levels.WARN, "Unzulässiger Origin", {
      origin,
      ip: req.ip,
      url: getOrigin(req),
    });
    return res.status(403).send(forbiddenpage("Origin not allowed"));
  }

  const token = req.cookies.authhome;

  if (!token) {
    await log(levels.DEBUG, "Kein Token vorhanden", {
      path: req.originalUrl,
      origin: getOrigin(req),
    });
  }

  const session = verifyToken(token);

  if (!session) {
    await log(levels.DEBUG, "Token ungültig oder abgelaufen", {
      path: req.originalUrl,
      origin: getOrigin(req),
    });
  }

  if (!session) {
    await log(levels.SECURITY, "Kein gültiges Token – redirect login", {
      origin,
      url: getOrigin(req),
    });
    return res.redirect(
      302,
      `${req.headers["x-forwarded-proto"]}://auth${process.env.DOMAIN}/login`
    );
  }

  const user = getuser(session.username);

  if (!user) {
    await log(levels.DEBUG, "Token-User nicht in USER_* definiert", {
      decoded: session.username,
    });
  }

  const allowed = isAllowedRole(user.role, req.headers["x-forwarded-host"]);

  if (allowed) {
    await log(levels.DEBUG, "RBAC erlaubt Zugriff", {
      user: session.username,
      role: user.role,
      service: req.headers["x-forwarded-host"],
    });

    await log(levels.INFO, "Access granted", {
      user: session.username,
      url: getOrigin(req),
    });
    return res.sendStatus(200);
  }

  await log(levels.SECURITY, "Access denied", {
    user: session.username,
    url: getOrigin(req),
  });
  res.status(403).send(forbiddenpage("Access restricted"));
});

/** ADMIN: User Verwaltung */
app.get("/admin/users", adminOnly, (req, res) => {
  res.send(adminUsersPage(loadUsersFromEnv()));
});

app.post("/admin/users/create", adminOnly, async (req, res) => {
  const { username, password, role } = req.body;
  const users = loadUsersFromEnv();

  if (users.find((u) => u.username === username)) {
    return res.send("User existiert bereits");
  }

  users.push({
    username,
    role,
    hash: bcrypt.hashSync(password, 10),
  });

  saveUsersToEnv(users);
  reloadEnv();

  await log(levels.INFO, "User erstellt", {
    username,
    role,
    url: getOrigin(req),
  });
  res.redirect("/admin/users");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  log(levels.INFO, `Auth Server gestartet`, { port: PORT });
});
