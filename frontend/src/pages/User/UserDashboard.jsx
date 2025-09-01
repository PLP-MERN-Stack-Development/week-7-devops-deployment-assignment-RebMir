import React, { useEffect, useState, useContext } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/UserContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import TaskListTable from "../../components/TaskListTable";
import { LuArrowRight, LuRefreshCw } from "react-icons/lu";

const UserDashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add state for dynamic greeting
  const [greetingData, setGreetingData] = useState({
    greeting: "Welcome!",
    timeOfDay: "morning",
    subtext: "Have a great day!",
  });

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const userName = user?.name || "User";
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const isWeekend = [0, 6].includes(now.getDay());

    let greeting;
    let subtext;
    let timeOfDay;

    if (hour >= 5 && hour < 12) {
      timeOfDay = "morning";
      const morningGreetings = [
        `Good morning, ${userName}!`,
        `Rise and shine, ${userName}!`,
        `Morning, ${userName}! Ready to be productive?`,
        `Good morning, ${userName}! Hope you slept well.`,
      ];
      greeting =
        morningGreetings[Math.floor(Math.random() * morningGreetings.length)];

      if (hour < 7) {
        subtext = "Early bird! Time to get things done.";
      } else if (isWeekend) {
        subtext = `Happy ${dayName}! Perfect time to tackle your tasks.`;
      } else {
        subtext = `Hope you're having a productive ${dayName} morning.`;
      }
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
      const afternoonGreetings = [
        `Good afternoon, ${userName}!`,
        `Afternoon, ${userName}! How's your progress?`,
        `Hey ${userName}! Hope you're staying focused.`,
        `Good afternoon, ${userName}! Keep up the momentum.`,
      ];
      greeting =
        afternoonGreetings[
          Math.floor(Math.random() * afternoonGreetings.length)
        ];

      if (hour === 12) {
        subtext = "Lunch break? Perfect time to check your tasks.";
      } else if (isWeekend) {
        subtext = `Making progress on your ${dayName} goals?`;
      } else {
        subtext = "Afternoon energy! Time to tackle more tasks.";
      }
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = "evening";
      const eveningGreetings = [
        `Good evening, ${userName}!`,
        `Evening, ${userName}! How did today go?`,
        `Hey ${userName}! Checking in on your tasks?`,
        `Good evening, ${userName}! Time to wrap things up.`,
      ];
      greeting =
        eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];

      if (isWeekend) {
        subtext = `Hope you're having a relaxing ${dayName} evening.`;
      } else {
        subtext = "Evening check-in! See what you've accomplished today.";
      }
    } else {
      timeOfDay = "night";
      const nightGreetings = [
        `Good night, ${userName}!`,
        `Hey ${userName}! Working late tonight?`,
        `Night owl, ${userName}?`,
        `Good night, ${userName}! Don't forget to rest.`,
      ];
      greeting =
        nightGreetings[Math.floor(Math.random() * nightGreetings.length)];

      if (hour >= 21 && hour < 24) {
        subtext = "Late evening productivity session?";
      } else {
        subtext = "Midnight check-in! Remember to get some sleep.";
      }
    }

    return { greeting, subtext, timeOfDay, hour };
  };

  // Update greeting function
  const updateGreeting = () => {
    const newGreetingData = getTimeBasedGreeting();
    setGreetingData(newGreetingData);
  };

  const getDashboardData = async () => {
    setIsLoading(true);
    try {
      // Debug: Check what user data we have
      console.log("🔍 Current user:", user);
      console.log("🔍 User ID:", user?.id);
      console.log("🔍 API Path:", API_PATHS.TASKS.GET_USER_DASHBOARD_DATA);

      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
      );

      // Debug: Check the full response
      console.log("📊 Full API Response:", response);
      console.log("📈 Response Status:", response.status);
      console.log("📋 Response Data:", response.data);
      console.log("🎯 Recent Tasks:", response.data?.recentTasks);
      console.log(
        "📊 Task Distribution:",
        response.data?.charts?.taskDistribution
      );

      if (response.data) {
        setDashboardData(response.data);
        console.log("✅ Dashboard data set successfully");
      } else {
        console.warn("⚠️ No data received from API");
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      console.error("❌ Error message:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSeeMore = () => {
    navigate("/user/tasks");
  };

  const refreshDashboard = () => {
    getDashboardData();
    updateGreeting(); // Also refresh greeting
  };

  // Initialize greeting when component mounts or user changes
  useEffect(() => {
    if (user && user.name) {
      updateGreeting();
    }
  }, [user]);

  // Update greeting every minute to handle time changes during long sessions
  useEffect(() => {
    if (user && user.name) {
      const greetingInterval = setInterval(updateGreeting, 60000);
      // Show loading if user context isn't ready yet
      if (!user || (!user.id && !user._id)) {
        return (
          <DashboardLayout activeMenu="Dashboard">
            <div className="card my-5">
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your dashboard...</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Authenticating user
                  </p>
                </div>
              </div>
            </div>
          </DashboardLayout>
        );
      }

      return () => clearInterval(greetingInterval);
    }
  }, [user]);

  useEffect(() => {
    console.log("🚀 UserDashboard mounted, checking user...");
    console.log("👤 User on mount:", user);

    // Wait for user to be available, then fetch data
    // Check for both _id (MongoDB) and id (other databases)
    if (user && (user.id || user._id)) {
      console.log("✅ User available, fetching dashboard data...");
      console.log("🆔 User ID found:", user.id || user._id);
      getDashboardData();
    } else {
      console.warn("⚠️ No user ID available, waiting for user context...");
      console.log("🔄 User state:", {
        user,
        hasUser: !!user,
        hasId: !!(user?.id || user?._id),
      });
    }
  }, [user]); // Changed to depend on the entire user object

  // Update greeting when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateGreeting();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Get CSS classes for time-based styling
  const getGreetingClasses = () => {
    const baseClasses =
      "transition-all duration-500 ease-in-out rounded-lg p-4 mb-4";

    switch (greetingData.timeOfDay) {
      case "morning":
        return `${baseClasses} bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400`;
      case "afternoon":
        return `${baseClasses} bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400`;
      case "evening":
        return `${baseClasses} bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-400`;
      case "night":
        return `${baseClasses} bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-slate-400`;
      default:
        return baseClasses;
    }
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="flex justify-between items-center">
          <div className="col-span-3 flex-1">
            {/* Updated greeting section with dynamic content and styling */}
            <div className={getGreetingClasses()}>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                {greetingData.greeting}
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {greetingData.subtext}
              </p>
              <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
                {moment().format("dddd, DD MMM YYYY • HH:mm")}
              </p>
            </div>
          </div>

          {/* Add refresh button */}
          <button
            onClick={refreshDashboard}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors ${isLoading ? "opacity-50" : ""}`}
            disabled={isLoading}
            title="Refresh Dashboard"
          >
            <LuRefreshCw
              className={`text-sm ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg">Recent Tasks</h5>
              <button className="card-btn" onClick={onSeeMore}>
                See All <LuArrowRight className="text-base" />
              </button>
            </div>

            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : dashboardData?.recentTasks?.length > 0 ? (
              <TaskListTable tableData={dashboardData.recentTasks} />
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">📋 No tasks assigned yet</p>
                  <p className="text-sm">
                    Tasks assigned to you will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
