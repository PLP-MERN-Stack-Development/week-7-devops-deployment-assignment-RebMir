require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");


const app = express();

// Middleware to handle CORS
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://taskmanager-hxr3.onrender.com",
            process.env.FRONTEND_URL
        ].filter(Boolean), // This removes any undefined values
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Connect Database
connectDB();

//Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
