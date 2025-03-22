const express = require("express");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();
const Task = require("../models/Task"); // Assuming you have a Task model

router.post("/add", async (req, res) => {
  try {
    const { title, description, important, email } = req.body;

    const newTask = new Task({ title, description, important });
    await newTask.save();

    // If task is important, send an email
    if (important) {
      await sendEmail(
        email,
        "Important Task Added",
        `Your important task "${title}" has been added!`
      );
    }

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
