const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

// @desc Export all tasks as an Excel file
// @route GET /api/reports/export/tasks
// @access Private (Admin)
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate("user", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        // Define columns
        worksheet.columns = [
            { header: "Task ID", key: "_id", width: 30 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority", key: "priority", width: 20 },
            { header: "Due Date", key: "dueDate", width: 20 },
            { header: "Status", key: "status", width: 20 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
        ];

        // Add rows
        tasks.forEach(task => {
            const assignedTo = task.assignedTo
                .map(user => user.name)
                .join(", ");
            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                user: task.user ? task.user.name : "Unassigned",
                dueDate: task.dueDate.toISOString().split("T")[0], 
                assignedTo: assignedTo || "Unassigned",
            });
        });

        // Set response headers
        res.setHeader(
            "Content-Type", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition", 
            `attachment; filename=tasks_report_${new Date().toISOString()}.xlsx`);

        // Write to response
        return await workbook.xlsx.write(res).then(() => {;
            res.end();
        });
    } catch (error) {
        res.status(500).json({ message: "Error exporting tasks", error: error.message });
    }
};

// @desc Export user-task report as an Excel file
// @route GET /api/reports/export/users
// @access Private (Admin)
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate(
            "assignedTo", 
            "name email _id"
        );

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo) {
                task.assignedTo.forEach((assignedUser) => {
                    if (userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if (task.status === "Pending") {
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        } else if (task.status === "In Progress") {
                            userTaskMap[assignedUser._id].inProgressTasks += 1;
                        } else if (task.status === "Completed") {
                            userTaskMap[assignedUser._id].completedTasks += 1;
                        }
                    }
                });
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        // Define columns
        worksheet.columns = [
            { header: "User Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 30 },
            { header: "Total Tasks", key: "taskCount", width: 20 },
            { header: "Pending Tasks", key: "pendingTasks", width: 20 },
            { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
            { header: "Completed Tasks", key: "completedTasks", width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition", 
            `attachment; filename=users_report_${new Date().toISOString()}.xlsx`
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(500).json({ message: "Error exporting tasks", error: error.message });
    }
};


module.exports = {
    exportTasksReport,
    exportUsersReport,
};