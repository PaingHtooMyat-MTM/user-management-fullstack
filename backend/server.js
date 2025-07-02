import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const SECRET_KEY = "asdklajs";
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "db.json");

// Helper functions
const readDB = () => JSON.parse(fs.readFileSync(dbPath));
const writeDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

//  Register
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const db = readDB();

  const existingUser = db.users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    role,
  };

  db.users.push(newUser);
  writeDB(db);

  res.status(201).json({ message: "User registered successfully" });
});

//  Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token, role: user.role, message: "Login successful" });
});

//  Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

//  Protected route
app.get("/profile", authenticate, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// CRUD users
app.get("/users", (req, res) => res.json(readDB().users));
app.get("/users/:id", (req, res) => {
  const user = readDB().users.find((u) => u.id == req.params.id);
  user ? res.json(user) : res.status(404).json({ message: "User not found" });
});
app.put("/users/:id", (req, res) => {
  const db = readDB();
  const index = db.users.findIndex((u) => u.id == req.params.id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...req.body };
    writeDB(db);
    res.json(db.users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});
app.delete("/users/:id", (req, res) => {
  const db = readDB();
  const filtered = db.users.filter((u) => u.id != req.params.id);
  if (filtered.length === db.users.length) {
    return res.status(404).json({ message: "User not found" });
  }
  db.users = filtered;
  writeDB(db);
  res.json({ message: "User deleted" });
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
