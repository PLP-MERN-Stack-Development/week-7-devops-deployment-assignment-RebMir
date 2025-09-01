import React, { useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";

import Dashboard from "./pages/Admin/Dashboard";
import ManageTasks from "./pages/Admin/ManageTasks";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import ManageUsers from "./pages/Admin/ManageUsers";
import CreateTask from "./pages/Admin/CreateTask";
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";
import TaskList from "./pages/Admin/TaskList";

import PrivateRoute from "./routes/PrivateRoute";
import { Root } from "postcss";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin Routes (Protected) */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/edit-task/:taskId" element={<CreateTask />} />
          </Route>

          {/* User Routes (Protected) */}
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Root />} />
        </Routes>
      </div> 

      <Toaster 
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px"
          },
        }}
      />
    </>
  );
};

export default App;

