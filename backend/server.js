require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const wakatimeRoutes = require("./routes/waka");

const app = express();

// Allow multiple origins
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173","https://tasks-app-frontend-v1.onrender.com"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
}));

app.use(express.json()); // Ensure body is parsed properly
app.use(cookieParser());

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

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

// ✅ User Registration
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("Received Register Request:", req.body);
    const { username, email, password } = req.body;

    // Check if user exists (by username or email)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or Email already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Received Login Request:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true }).json({ message: "Logged in", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

// ✅ Get User's Tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add Task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const task = new Task({ userId: req.user.userId, title, description });
    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Send Email Alerts for Unfinished Tasks
app.post("/send-alert", authMiddleware, async (req, res) => {
  try {
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
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).send(error.toString());
      }
      res.status(200).send("Email sent: " + info.response);
    });
  } catch (err) {
    console.error("Send Alert Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
