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

// ✅ Allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tasks-frontend-2.onrender.com",
  "http://localhost:10000",
];

// ✅ CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight response for 24h

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }

  next();
});

app.use(express.json()); // Ensure JSON body is parsed properly
app.use(cookieParser());

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ User Schema
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// ✅ Task Schema
const Task = mongoose.model("Task", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  date: { type: Date , required:true }// ✅ Add this line  , default: Date.now
}));

// ✅ Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// ✅ Routes
app.use("/api", wakatimeRoutes);

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Ensure secure cookie in production
      sameSite: "None", // Required for cross-origin cookies
    }).json({ message: "Logged in", token });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  }).json({ message: "Logged out" });
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
    const { title, description, date } = req.body; // ✅ Extract date from req.body
    if (!title || !description || !date) {
      return res.status(400).json({ error: "Title, description, and date are required" });
    }

    const task = new Task({ userId: req.user.userId, title, description, date }); // ✅ Use the extracted date
    await task.save();

    // Fetch user's email
    const user = await User.findById(req.user.userId);
    
    if (user) {
      // Email Content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "New Task Created",
        text: `Your task "${title}" has been added successfully!\n\nDescription: ${description}`,
      };

      // Send Email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email sending error:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    res.json({ message: "Task created and email sent!", task });
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

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
