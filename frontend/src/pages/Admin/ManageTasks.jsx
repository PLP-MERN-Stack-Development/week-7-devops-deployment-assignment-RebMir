import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import toast from "react-hot-toast";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      console.log("🌐 Frontend: Making API call to get tasks...");
      console.log("🌐 API Path:", API_PATHS.TASKS.GET_ALL_TASKS);
      console.log("🌐 Filter Status:", filterStatus);

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      });

      console.log("✅ Frontend: Full API response:", response);
      console.log("✅ Frontend: Response data:", response.data);
      console.log("✅ Frontend: Tasks array:", response.data?.tasks);
      console.log("✅ Frontend: Status summary:", response.data?.statusSummary);

      setAllTasks(response.data?.tasks?.length > 0 ? response.data?.tasks : []);

      // Map statusSummary data
      const statusSummary = response.data?.statusSummary || {};
      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ];

      console.log("📊 Frontend: Status array:", statusArray);
      setTabs(statusArray);
    } catch (error) {
      console.error("❌ Frontend: Error fetching tasks:", error);
      console.error("❌ Frontend: Error response:", error.response?.data);
      toast.error("Failed to load tasks.");
    }
  };

  const handleClick = (taskData) => {
    navigate("/admin/create-task", { state: { taskId: taskData._id } });
  };

  // ✅ Toggle todo and auto-update task status
  const handleToggleTodo = async (taskId, index, checked) => {
    try {
      const task = allTasks.find((t) => t._id === taskId);
      if (!task) return;

      const updatedChecklist = [...task.todoChecklist];
      updatedChecklist[index].completed = checked;

      // Auto-update status
      let newStatus = "In Progress";
      if (updatedChecklist.every((t) => t.completed)) {
        newStatus = "Completed";
      }

      // Update backend
      await axiosInstance.put(`${API_PATHS.TASKS.UPDATE_TASK(taskId)}`, {
        todoChecklist: updatedChecklist,
        status: newStatus,
      });

      // Update frontend state
      setAllTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? { ...t, todoChecklist: updatedChecklist, status: newStatus }
            : t
        )
      );
    } catch (error) {
      console.error("❌ Error updating todo:", error);
      toast.error("Failed to update todo.");
      getAllTasks();
    }
  };

  // Download task report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading task details:", error);
      toast.error("Failed to download task details.");
    }
  };

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font medium">My Tasks</h2>

            <button
              className="flex lg:hidden download-btn"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button
                className="hidden lg:flex download-btn"
                onClick={handleDownloadReport}
              >
                <LuFileSpreadsheet className="text-lg" />
                Download Report
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks?.map((item) => (
            <TaskCard
              key={item._id}
              {...item}
              onClick={() => handleClick(item)}
              onToggleTodo={(index, checked) =>
                handleToggleTodo(item._id, index, checked)
              }
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
