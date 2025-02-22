require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const wakatimeRoutes = require("./routes/waka");
//import wakatimeRoutes from "./routes/waka"; 

const app = express();

// Allow multiple origins
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173","https://tasks-app-frontend-v1.onrender.com"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
}));

app.use(express.json());
app.use(cookieParser());

// Check if MONGO_URI is defined in the environment variables
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// JWT Secret
const SECRET = process.env.JWT_SECRET || "supersecret";

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// User Schema
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// Task Schema
const Task = mongoose.model("Task", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
}));

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Routes
app.use("/api", wakatimeRoutes);

// User Registration
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// User Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true }).json({ message: "Logged in", token });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// Get User's Tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json(tasks);
});

// Add Task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const task = new Task({ userId: req.user.userId, title, description });
  await task.save();
  res.json(task);
});

// Send Email Alerts for Unfinished Tasks
app.post("/send-alert", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const tasks = await Task.find({ userId: req.user.userId, completed: false });

  if (!tasks.length) {
    return res.status(400).json({ error: "No unfinished tasks to remind about" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Unfinished Tasks Alert",
    text: `You have the following unfinished tasks: ${tasks.map(task => task.title).join(", ")}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send(error.toString());
    res.status(200).send("Email sent: " + info.response);
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));