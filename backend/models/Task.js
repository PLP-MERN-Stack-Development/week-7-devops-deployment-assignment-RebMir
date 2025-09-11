const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    progress: { type: Number, default: 0 },
    dueDate: Date,

    // ✅ FIX: make sure these exist
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    todoChecklist: [
      {
        text: String,
        completed: { type: Boolean, default: false },
      },
    ],
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
