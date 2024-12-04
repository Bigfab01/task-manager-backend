const mongoose = require('mongoose');
const TaskSchema = mongoose.Schema;  // Renamed to avoid potential conflicts

const taskSchema = new TaskSchema({
  task: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Task', taskSchema);