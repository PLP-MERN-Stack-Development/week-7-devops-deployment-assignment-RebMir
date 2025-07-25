import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Admin/Dashboard"; //
import ManageTasks from "./pages/Admin/ManageTasks";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import ManageUsers from "./pages/Admin/ManageUsers";
import CreateTask from "./pages/Admin/CreateTask";
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

import UserProvider, { UserContext } from "./context/UserContext"; 
import PrivateRoute from "./routes/PrivateRoute";



const App = () => {
  return (
    <Router>
      <UserProvider>
        <div>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin Routes (Protected) */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/tasks" element={<ManageTasks />} />
              <Route path="/admin/create-task" element={<CreateTask />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route>

            {/* User Routes (Protected) */}
            <Route element={<PrivateRoute allowedRoles={["member"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/tasks" element={<MyTasks />} />
              <Route
                path="/user/task-details/:id"
                element={<ViewTaskDetails />}
              />
            </Route>
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
};

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin" ? (
    <Navigate to="/admin/dashboard" />
  ) : (
    <Navigate to="/user/dashboard" />
  );
};
export default App;
