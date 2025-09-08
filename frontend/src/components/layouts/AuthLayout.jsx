import React from "react";
import UI_IMG from "../../assets/images/auth-image.jpg";

const AuthLayouts = ({ children }) => {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${UI_IMG})` }}
    >
      {/* Optional overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Floating form card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-lg font-medium text-black mb-6">Task Manager</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthLayouts;
