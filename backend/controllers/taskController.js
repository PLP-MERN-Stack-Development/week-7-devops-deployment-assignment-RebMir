const Task = require("../models/Task");

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Admin
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error("❌ Error creating task:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks = await Task.find({}).populate("createdBy", "name email");

    // Add completed checklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedChecklistCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return {
          ...task._doc,
          completedTodoCount: completedChecklistCount,
        };
      })
    );

    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("❌ Error fetching task by ID:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    const task = await Task.findById(req.params.id);

    if (task) {
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.status = status || task.status;

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("❌ Error updating task:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: "Task removed" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("❌ Error deleting task:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      task.status = status || task.status;
      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("❌ Error updating task status:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update checklist inside a task
// @route   PUT /api/tasks/:id/todo
// @access  Private
// @desc    Update checklist inside a task
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      task.todoChecklist = todoChecklist;

      // Calculate progress
      const completedCount = task.todoChecklist.filter((item) => item.completed).length;
      const totalCount = task.todoChecklist.length;

      task.progress =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // 🔥 Auto-update status
      if (totalCount > 0 && completedCount === totalCount) {
        task.status = "Completed";
      } else if (completedCount > 0) {
        task.status = "In Progress";
      } else {
        task.status = "Pending";
      }

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error("❌ Error updating checklist:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// @desc    Dashboard data (for assigned tasks to the logged-in user)
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    console.log("🔍 Dashboard API - User ID:", req.user._id);
    
    // FIXED: Filter by assignedTo instead of createdBy
    // Since assignedTo is an array, use $in operator
    const tasks = await Task.find({ 
      assignedTo: { $in: [req.user._id] }  // Check if user ID is in assignedTo array
    }).populate("createdBy", "name email");

    console.log("📋 Found tasks for user:", tasks.length);
    console.log("📋 Sample task:", tasks[0] ? {
      title: tasks[0].title,
      assignedTo: tasks[0].assignedTo,
      createdBy: tasks[0].createdBy
    } : "No tasks found");

    const taskDistribution = {
      All: tasks.length,
      Pending: tasks.filter((t) => t.status === "Pending").length,
      InProgress: tasks.filter((t) => t.status === "In Progress").length,
      Completed: tasks.filter((t) => t.status === "Completed").length,
    };

    const taskPriorityLevels = {
      Low: tasks.filter((t) => t.priority === "Low").length,
      Medium: tasks.filter((t) => t.priority === "Medium").length,
      High: tasks.filter((t) => t.priority === "High").length,
    };

    // Add completed checklist count to each task (like in getTasks)
    const tasksWithChecklistCount = await Promise.all(
      tasks.map(async (task) => {
        const completedChecklistCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return {
          ...task._doc,
          completedTodoCount: completedChecklistCount,
        };
      })
    );

    res.json({
      charts: { taskDistribution, taskPriorityLevels },
      recentTasks: tasksWithChecklistCount.slice(-5), // last 5 tasks
    });
  } catch (error) {
    console.error("❌ Error in getDashboardData:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    User-specific dashboard data
// @route   GET /api/tasks/user-dashboard-data  
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // FIXED: Filter by assignedTo instead of createdBy
    const userTasks = await Task.find({ 
      assignedTo: { $in: [userId] } 
    }).populate('assignedTo createdBy', 'name email').sort({ createdAt: -1 });

    // Calculate task distribution
    const taskDistribution = {
      All: userTasks.length,
      Pending: userTasks.filter(task => task.status === "Pending").length,
      InProgress: userTasks.filter(task => task.status === "In Progress").length,
      Completed: userTasks.filter(task => task.status === "Completed").length,
    };

    // Calculate priority levels
    const taskPriorityLevels = {
      Low: userTasks.filter(task => task.priority === "Low").length,
      Medium: userTasks.filter(task => task.priority === "Medium").length,
      High: userTasks.filter(task => task.priority === "High").length,
    };

    // Return in the format your frontend expects
    res.json({
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks: userTasks.slice(0, 5) // Get first 5 for recent tasks
    });

    console.log(`✅ User ${userId} has ${userTasks.length} assigned tasks`);
    
  } catch (error) {
    console.error("❌ Error fetching user dashboard data:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
