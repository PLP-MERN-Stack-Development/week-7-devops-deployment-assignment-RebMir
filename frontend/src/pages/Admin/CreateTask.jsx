import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { PRIORITY_DATA } from '../../utils/data';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from 'moment';
import { LuTrash2 } from 'react-icons/lu';
import SelectUsers from '../../components/inputs/SelectUsers';
import SelectDropdown from '../../components/inputs/SelectDropdown';
import TodoListInput from '../../components/inputs/TodoListInput';
import AddAttachmentsInput from '../../components/inputs/AddAttachmentsInput';
import { useUserAuth } from '../../hooks/useUserAuth';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/DeleteAlert';

const CreateTask = () => {
    console.log("CreateTask component mounting...");
    
    const location = useLocation();
    const { taskId } = location.state || {};
    const navigate = useNavigate();
    
    console.log("Location state:", location.state);
    console.log("TaskId:", taskId);

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        priority: "Low",
        dueDate: "",
        assignedTo: [],
        todoChecklist: [],
        attachments: [],
    });

    const [currentTask, setCurrentTask] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const handleValueChange = (key, value) => {
        setTaskData((prevData) => ({ ...prevData, [key]: value }));
    };

    const clearData = () => {
        //reset form
        setTaskData({
            title: "",
            description: "",
            priority: "Low",
            dueDate: "",
            assignedTo: [],
            todoChecklist: [],
            attachments: [],
        });
    };

    //Create Task
const createTask = async () => {
    setLoading(true);

    try {
        const todoList = taskData.todoChecklist?.map((item) => ({
            text: item,
            completed: false,
        }));

        const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
            ...taskData,
            dueDate: new Date(taskData.dueDate).toISOString(),
            todoChecklist: todoList,
        });

        console.log("Task created successfully:", response.data);
        toast.success("Task created successfully!");
        clearData();
        
        // Navigate back to dashboard to see the new task
        navigate('/admin/dashboard', {
            state: { refresh: true, timestamp: Date.now() }
        });
        
    } catch (error) {
        console.error("Error creating task:", error);
        toast.error("Failed to create task. Please try again.");
    } finally {
        setLoading(false);
    }
};

    // Update Task
    const updateTask = async () => {
        setLoading(true);

        try {
            const todoList = taskData.todoChecklist?.map((item) => {
                const prevTodoChecklist = currentTask?.todoChecklist || [];
                const matchedTask = prevTodoChecklist.find((task) => task.text === item);

                return {
                    text: item,
                    completed: matchedTask ? matchedTask.completed : false,
                };
            });

            const response = await axiosInstance.put(
                API_PATHS.TASKS.UPDATE_TASK(taskId),
                {
                    ...taskData,
                    dueDate: new Date(taskData.dueDate).toISOString(),
                    todoChecklist: todoList,
                }
            );

            toast.success("Task updated successfully!");
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Failed to update task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError("");

        //Input validation
        if (!taskData.title.trim()) {
            setError("Please enter a title.");
            return;
        }

        if (!taskData.description.trim()) {
            setError("Please enter a description.");
            return;
        }
        if (!taskData.dueDate.trim()) {
            setError("Please enter a due date.");
            return;
        }
        if (taskData.assignedTo?.length === 0) {
            setError("Task not assigned to any user.");
            return;
        }
        if (taskData.todoChecklist?.length === 0) {
            setError("Please add some tasks to the checklist.");
            return;
        }

        if (taskId) {
            await updateTask();
            return;
        }

        await createTask();
    };

    // get Task info by ID
    const getTaskDetailsById = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));

            if (response.data) {
                const taskInfo = response.data;
                setCurrentTask(taskInfo);

                setTaskData((prevState) => ({
                    ...prevState,
                    title: taskInfo.title,
                    description: taskInfo.description,
                    priority: taskInfo.priority,
                    dueDate: taskInfo.dueDate
                        ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
                        : "",
                    assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
                    todoChecklist:
                        taskInfo?.todoChecklist?.map((item) => item?.text) || [],
                    attachments: taskInfo?.attachments || [],
                }));
            }
        } catch (error) {
            console.error("Error fetching task details:", error);
            toast.error("Failed to fetch task details.");
        }
    };

    // Delete Task
    const deleteTask = async () => {
        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
            toast.success("Task deleted successfully!");
            navigate('/tasks'); // Navigate back to tasks list
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task. Please try again.");
        }
    };

    useEffect(() => {
        if (taskId) {
            getTaskDetailsById();
        }
        
        return () => {};
    }, [taskId]);

    return (
        <DashboardLayout activeMenu="Create Task">
            <div className='mt-5'>
                <div className='grid grid-cols-1 md:grid-cols-4 mt-4'>
                    <div className='form-card col-span-3'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-xl md:text-xl font-medium'>
                                {taskId ? "Update Task" : "Create Task"}
                            </h2>

                            {taskId && (
                                <button
                                    className='flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer'
                                    onClick={() => setOpenDeleteAlert(true)}
                                >
                                    <LuTrash2 className='text-base' /> Delete
                                </button>
                            )}
                        </div>

                        <div className='mt-4'>
                            <label className='text-xs font-medium text-slate-600'>
                                Task Title
                            </label>

                            <input
                                placeholder="Create App UI"
                                className='form-input'
                                value={taskData.title}
                                onChange={({ target }) =>
                                    handleValueChange("title", target.value)
                                }
                            />
                        </div>

                        <div className='mt-3'>
                            <label className='text-xs font-medium text-slate-600'>
                                Description
                            </label>

                            <textarea
                                placeholder='Describe Task'
                                className="form-input"
                                rows={4}
                                value={taskData.description}
                                onChange={({ target }) =>
                                    handleValueChange("description", target.value)
                                }
                            />
                        </div>

                        <div className='grid grid-cols-12 gap-4 mt-2'>
                            <div className='col-span-6 md:col-span-4'>
                                <label className='text-xs font-medium text-slate-600'>
                                    Priority
                                </label>

                                <SelectDropdown
                                    options={PRIORITY_DATA}
                                    value={taskData.priority}
                                    onChange={(value) => handleValueChange("priority", value)}
                                    placeholder="Select Priority"
                                />
                            </div>

                            <div className='col-span-6 md:col-span-4'>
                                <label className='text-xs font-medium text-slate-600'>
                                    Due Date
                                </label>

                                <input
                                    placeholder='Select due date'
                                    className='form-input'
                                    value={taskData.dueDate}
                                    onChange={({ target }) =>
                                        handleValueChange("dueDate", target.value)
                                    }
                                    type="date"
                                />
                            </div>

                            <div className='col-span-12 md:col-span-4'>
                                <label className='text-xs font-medium text-slate-600'>
                                    Assign To
                                </label>

                                <SelectUsers
                                    selectedUsers={taskData.assignedTo}
                                    setSelectedUsers={(value) => {
                                        handleValueChange("assignedTo", value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className='mt-3'>
                            <label className='text-xs font-medium text-slate-600'>
                                TODO Checklist
                            </label>

                            <TodoListInput
                                todoList={taskData.todoChecklist}
                                setTodoList={(value) => 
                                    handleValueChange("todoChecklist", value)
                                }
                            />
                        </div>

                        <div className='mt-3'>
                            <label className='text-xs font-medium text-slate-600'>
                                Add Attachments
                            </label>

                            <AddAttachmentsInput
                                attachments={taskData?.attachments}
                                setAttachments={(value) => 
                                    handleValueChange("attachments", value)
                                }
                            />    
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
                        )}

                        <div className="flex justify-end mt-7">
                            <button
                                className='add-btn'
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading 
                                    ? (taskId ? "UPDATING..." : "CREATING...") 
                                    : (taskId ? "UPDATE TASK" : "CREATE TASK")
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Delete Task"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this task?"
                    onDelete={() => deleteTask()}
                />
            </Modal>

        </DashboardLayout>
    );
};

export default CreateTask;