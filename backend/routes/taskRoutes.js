const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  getDashboardData,
  getUserDashboardData,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getTasks,
  getUserTasks,
  getAllTasks, // Add this if you have it
} = require("../controllers/taskController");

const router = express.Router();

// ✅ SPECIFIC routes FIRST (before :id route)
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/user-tasks", protect, getUserTasks);
router.get("/my", protect, getUserTasks);
router.get("/all", protect, getAllTasks); // ✅ Add this specific route
router.get("/all", protect, getTasks);

// ✅ GENERAL routes
router.get("/", protect, getTasks);

// ✅ PARAMETRIC routes LAST
router.get("/:id", protect, getTaskById);

// Other routes
router.post("/", protect, adminOnly, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskChecklist);

module.exports = router;
