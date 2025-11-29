import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const LOG_DIR = path.resolve("logs");
const LOG_FILE = path.join(LOG_DIR, "auth-server.log");

const LOG_LEVEL = (process.env.LOG_LEVEL || "INFO").toUpperCase();

const levelPriority = {
  ERROR: 0,
  SECURITY: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};


// Ordner erstellen wenn nicht vorhanden
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const levels = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  SECURITY: "SECURITY",
};


function shouldLog(level) {
  return levelPriority[level] <= levelPriority[LOG_LEVEL];
}

// formatiert den Logeintrag als Klartextzeile
function formatLine(level, message, meta = {}) {
  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

  // Meta darf NIE crashen
  const safeMeta = meta && typeof meta === "object" ? meta : {};

  const metaStr = Object.entries(safeMeta)
    .map(([k, v]) => `${k}=${v}`)
    .join(" | ");

  return `${timestamp} [${level}] ${message}${metaStr ? " | " + metaStr : ""}\n`;
}

export async function log(level, message, meta = {}) {
  if (!shouldLog(level)) return;

  const line = formatLine(level, message, meta);

  // Konsole
  process.stdout.write(line);

  // Datei
  await fs.promises.appendFile(LOG_FILE, line);
}

