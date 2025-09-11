import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import { API_PATHS } from "../../utils/apiPaths"; 

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getUserTasks = async () => {
    setLoading(true);
    try {
      // ✅ Correct usage
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_MY_TASKS, {
        params: filterStatus !== "All" ? { status: filterStatus } : {},
      });

      console.log("🔥 User API Response:", response.data);

      const tasks = Array.isArray(response.data) ? response.data : [];
      setAllTasks(tasks);

      // Compute tab counts
      const allCount = tasks.length;
      const pendingCount = tasks.filter((t) => t.status === "Pending").length;
      const inProgressCount = tasks.filter(
        (t) => t.status === "In Progress"
      ).length;
      const completedCount = tasks.filter(
        (t) => t.status === "Completed"
      ).length;

      setTabs([
        { label: "All", count: allCount },
        { label: "Pending", count: pendingCount },
        { label: "In Progress", count: inProgressCount },
        { label: "Completed", count: completedCount },
      ]);
    } catch (error) {
      console.error(
        "Error fetching tasks:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  useEffect(() => {
    getUserTasks();
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>

          {tabs?.[0]?.count > 0 && (
            <TaskStatusTabs
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p>Loading tasks...</p>
            </div>
          ) : allTasks?.length > 0 ? (
            allTasks.map((item) => (
              <TaskCard
                key={item._id}
                title={item.title || ""}
                description={item.description || ""}
                priority={item.priority || "Low"}
                status={item.status || "Pending"}
                progress={item.progress || 0}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={
                  item.assignedTo?.map(
                    (assignee) => assignee.profileImageUrl
                  ) || []
                }
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todoChecklist={item.todoChecklist || []}
                onClick={() => handleClick(item._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <LuFileSpreadsheet className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500">
                No tasks found for the selected status.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
