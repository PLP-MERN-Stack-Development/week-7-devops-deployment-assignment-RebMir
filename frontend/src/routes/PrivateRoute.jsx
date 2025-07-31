import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation(); // Get the current URL

  // Use JSON.stringify to see the full user object or null
  const userStateString = JSON.stringify(user);

  console.log(
    `%c[PrivateRoute] Checking route: ${
      location.pathname
    }. Allowed: [${allowedRoles.join(
      ", "
    )}]. Loading: ${loading}. User State: ${userStateString}`,
    "color: red; font-weight: bold;"
  );

  if (loading) {
    console.log(
      `%c[PrivateRoute] Decision: App is loading. Rendering loading screen.`,
      "color: red"
    );
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log(
      `%c[PrivateRoute] Decision: NO USER. Redirecting to /login.`,
      "color: red"
    );
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log(
      `%c[PrivateRoute] Decision: ROLE MISMATCH. User role: '${user.role}'. Redirecting.`,
      "color: red"
    );
    // Redirect to their own dashboard if they try to access a page they shouldn't
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  console.log(
    `%c[PrivateRoute] Decision: ACCESS GRANTED to ${location.pathname}.`,
    "color: green; font-weight: bold;"
  );
  return <Outlet />;
};

export default PrivateRoute;
