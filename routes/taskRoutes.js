// routes/taskRoutes.js
const express = require('express');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get all tasks for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Add a new task
router.post('/', authMiddleware, async (req, res) => {
  const { task } = req.body;
  try {
    const newTask = new Task({ task, userId: req.user.userId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Error adding task' });
  }
});

// Edit a task (both task description and completed status)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { task, completed } = req.body;  // Extract task and completed status from the request body
    const taskId = req.params.id;

    // Find the task by its ID and make sure it's the user's task
    const existingTask = await Task.findById(taskId);
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    // Ensure the task belongs to the authenticated user
    if (existingTask.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the task with new values (either task description, completed status, or both)
    existingTask.task = task || existingTask.task;  // Update task description if provided
    if (completed !== undefined) existingTask.completed = completed;  // Update completed status if provided

    await existingTask.save();  // Save updated task
    res.json(existingTask);  // Return updated task as response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.remove();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
