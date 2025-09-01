import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import TaskListTable from '../../components/TaskListTable'; // or wherever you put it
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
                toast.success('Task deleted successfully!');
                fetchTasks(); // Refresh the list
            } catch (error) {
                console.error('Error deleting task:', error);
                toast.error('Failed to delete task');
            }
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <DashboardLayout activeMenu="Tasks">
            <div className="mt-5">
                <h1 className="text-2xl font-semibold">Tasks</h1>
                
                {loading ? (
                    <p>Loading tasks...</p>
                ) : (
                    <TaskListTable 
                        tableData={tasks} 
                        onDelete={handleDeleteTask}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default TaskList;