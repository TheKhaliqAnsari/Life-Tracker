/**
 * Simple JSON file database utilities.
 * Data file lives at `data/db.json` relative to project root.
 * Uses synchronous fs APIs for simplicity.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "data", "db.json");

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} password - Hashed password
 */

/**
 * @typedef {Object} TaskBoard
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} boardId
 * @property {string} title
 * @property {string} [description]
 * @property {"pending"|"completed"} status
 * @property {"low"|"medium"|"high"} [priority] - Task priority level
 * @property {string} [dueDate] - ISO date string
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Database
 * @property {User[]} users
 * @property {TaskBoard[]} boards
 * @property {Task[]} tasks
 */

/** @type {Database} */
const DEFAULT_DB = { users: [], boards: [], tasks: [] };

// In-memory cache for Vercel serverless environment
let memoryCache = null;

/** Ensure the data directory and file exist with a default structure. */
function ensureDBFileExists() {
  const dir = path.dirname(DB_PATH);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      console.log(`Created database file: ${DB_PATH}`);
    }
  } catch (err) {
    console.error("Error ensuring database file exists:", err);
    // In serverless environments like Vercel, this might fail
    // The app will fallback to default empty data structure
  }
}

/**
 * Safely parse a JSON string, falling back to DEFAULT_DB.
 * @param {string} text
 * @returns {Database}
 */
function parseDB(text) {
  try {
    const parsed = JSON.parse(text);
    // Sanitize shape and provide fallbacks
    return {
      users: Array.isArray(parsed?.users) ? parsed.users : [],
      boards: Array.isArray(parsed?.boards) ? parsed.boards : [],
      tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [],
    };
  } catch (_err) {
    return { ...DEFAULT_DB };
  }
}

/**
 * Load database from environment variable (for Vercel compatibility)
 * @returns {Database}
 */
function loadFromEnv() {
  try {
    const envData = process.env.DEMO_DB_DATA;
    if (envData) {
      console.log("Loading database from environment variable");
      return parseDB(envData);
    }
  } catch (err) {
    console.error("Failed to load from environment:", err);
  }
  return { ...DEFAULT_DB };
}

/**
 * Save database to environment variable (for demo purposes)
 * @param {Database} db
 */
function saveToEnv(db) {
  try {
    // Note: This won't actually persist in Vercel, but helps with debugging
    process.env.DEMO_DB_DATA = JSON.stringify(db);
    console.log("Saved database to environment variable (session only)");
  } catch (err) {
    console.error("Failed to save to environment:", err);
  }
}

/**
 * Read and return the entire JSON database.
 * Returns an empty structure if the file doesn't exist or JSON is invalid.
 * @returns {Database}
 */
function getDB() {
  // Try memory cache first (for same function execution)
  if (memoryCache) {
    console.log("Using cached database from memory");
    return memoryCache;
  }

  try {
    ensureDBFileExists();
    const text = fs.readFileSync(DB_PATH, "utf8");
    const db = parseDB(text);
    memoryCache = db; // Cache in memory
    console.log(`Database read successfully. Users: ${db.users.length}, Boards: ${db.boards.length}, Tasks: ${db.tasks.length}`);
    return db;
  } catch (err) {
    console.error("Failed to read database:", err);
    
    // Try loading from environment variable (Vercel fallback)
    const envDb = loadFromEnv();
    if (envDb.users.length > 0 || envDb.boards.length > 0 || envDb.tasks.length > 0) {
      memoryCache = envDb;
      return envDb;
    }
    
    console.log("Returning default empty database structure");
    const defaultDb = { ...DEFAULT_DB };
    memoryCache = defaultDb;
    return defaultDb;
  }
}

/**
 * Write the entire database to the JSON file.
 * @param {Database} db
 */
function saveDB(db) {
  // Update memory cache
  memoryCache = db;
  
  try {
    ensureDBFileExists();
    const text = JSON.stringify(db, null, 2);
    fs.writeFileSync(DB_PATH, text, "utf8");
    console.log(`Database saved successfully. Users: ${db.users.length}, Boards: ${db.boards.length}, Tasks: ${db.tasks.length}`);
  } catch (err) {
    console.error("Failed to save database:", err);
    // In serverless environments like Vercel, file writes might fail
    // This is expected behavior for the demo app
  }
  
  // Also try to save to environment (though it won't persist)
  saveToEnv(db);
}

/**
 * Find a user by username.
 * @param {string} username
 * @returns {User | undefined}
 */
function getUserByUsername(username) {
  const db = getDB();
  const user = db.users.find((u) => u.username === username);
  console.log(`Looking for user "${username}": ${user ? 'found' : 'not found'}`);
  if (user) {
    console.log(`User details: id=${user.id}, username=${user.username}`);
  }
  return user;
}

/**
 * Find all boards for a specific user.
 * @param {string} userId
 * @returns {TaskBoard[]}
 */
function getBoardsByUserId(userId) {
  const db = getDB();
  return db.boards.filter((b) => b.userId === userId);
}

/**
 * Find all tasks for a specific board.
 * @param {string} boardId
 * @returns {Task[]}
 */
function getTasksByBoardId(boardId) {
  const db = getDB();
  return db.tasks.filter((t) => t.boardId === boardId);
}

module.exports = {
  getDB,
  saveDB,
  getUserByUsername,
  getBoardsByUserId,
  getTasksByBoardId,
}; 