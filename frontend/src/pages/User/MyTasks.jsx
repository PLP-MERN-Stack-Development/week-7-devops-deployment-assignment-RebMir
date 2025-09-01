import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getAllTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      });

      // Debug logs
      console.log("API Response:", response.data);
      console.log("Tasks received:", response.data);

      // API returns tasks array directly, not wrapped in a tasks property
      setAllTasks(Array.isArray(response.data) ? response.data : []);

      //Map statusSummary data with fixed labels and order
      // Since statusSummary is not in the response, calculate counts from the tasks
      const allCount = Array.isArray(response.data) ? response.data.length : 0;
      const pendingCount = Array.isArray(response.data)
        ? response.data.filter((task) => task.status === "Pending").length
        : 0;
      const inProgressCount = Array.isArray(response.data)
        ? response.data.filter((task) => task.status === "In Progress").length
        : 0;
      const completedCount = Array.isArray(response.data)
        ? response.data.filter((task) => task.status === "Completed").length
        : 0;

      const statusArray = [
        { label: "All", count: allCount },
        { label: "Pending", count: pendingCount },
        { label: "In Progress", count: inProgressCount },
        { label: "Completed", count: completedCount },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  useEffect(() => {
    getAllTasks();
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
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
            allTasks.map((item, index) => {
              console.log("Rendering task:", item); // Debug log
              return (
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
                  onClick={() => {
                    handleClick(item._id);
                  }}
                />
              );
            })
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
