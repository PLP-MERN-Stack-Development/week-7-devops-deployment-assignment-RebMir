import React, { useState, useContext, useEffect } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/inputs/Inputs";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🚀 FORM SUBMITTED - handleLogin called!");

    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      console.log("[Login.jsx] Making login request...");
      console.log("[Login.jsx] Login URL:", API_PATHS.AUTH.LOGIN);
      console.log("[Login.jsx] Full URL:", axiosInstance.defaults.baseURL + API_PATHS.AUTH.LOGIN);
      console.log("[Login.jsx] Login data:", { email, password: "***" });
      
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      console.log("[Login.jsx] Login response received:", response.data);

      const { token, role } = response.data;

      if (token) {
        console.log("[Login.jsx] Token found, calling updateUser...");
        localStorage.setItem("token", token);
        updateUser(response.data);

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        console.log("[Login.jsx] No token in response");
        setError("Login failed: No token received.");
      }
    } catch (error) {
      console.log("[Login.jsx] Login error:", error);
      console.log("[Login.jsx] Error response:", error.response?.data);
      console.log("[Login.jsx] Error status:", error.response?.status);
      console.log("[Login.jsx] Request URL:", error.config?.url);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred during login.");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-3xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your credentials to access your account.
        </p>

        <form onSubmit={handleLogin}>
          <Input
            id="email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
            autoComplete="email"
          />
          <Input
            id="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Your Password"
            placeholder="Min 8 characters"
            type="password"
            autoComplete="current-password"
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
