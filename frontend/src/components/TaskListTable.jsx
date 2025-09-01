import React from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { LuPencil, LuEye, LuTrash2 } from 'react-icons/lu';

const TaskListTable = ({ tableData, onDelete }) => {
    const navigate = useNavigate();

    const getStatusBudgeColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-500 border border-green-200';
            case 'Pending': return 'bg-purple-100 text-purple-500 border border-purple-200';
            case 'In Progress': return 'bg-cyan-100 text-cyan-500 border border-cyan-200';
            default: return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-500 border border-red-200';
            case 'Medium': return 'bg-orange-100 text-orange-500 border border-orange-200';
            case 'Low': return 'bg-green-100 text-green-500 border border-green-200';
            default: return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };

    const handleEditTask = (task) => {
        // Update this path to match your existing route
        navigate('/admin/create-task', { 
            state: { taskId: task._id } 
        });
        // Or use whatever your actual route is:
        // navigate('/admin/tasks/create', { state: { taskId: task._id } });
    };

    const handleViewTask = (task) => {
        // Navigate to task details page
        navigate(`/task-details/${task._id}`);
    };

    const handleDeleteTask = (task) => {
        if (onDelete) {
            onDelete(task._id);
        }
    };

    return (
        <div className='overflow-x-auto p-0 rounded-lg mt-3'>
            <table className='min-w-full'>
                <thead>
                    <tr className='text-left'>
                        <th className='py-3 px-4 text-gray-800 font-medium text-[13px]'>Name</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-[13px]'>Status</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-[13px]'>Priority</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell'>Created On</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-[13px]'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((task) => (
                        <tr key={task._id} className='border-t border-gray-200 hover:bg-gray-50'>
                            <td className='py-3 px-4 text-gray-700 text-[13px]'>
                                <div className='line-clamp-2 max-w-xs'>
                                    {task.title}
                                </div>
                            </td>
                            <td className='py-4 px-4'>
                                <span className={`px-3 py-1 text-xs rounded inline-block ${getStatusBudgeColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className='py-4 px-4'>
                                <span className={`px-3 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className='py-4 px-4 text-gray-700 text-[13px] text-nowrap hidden md:table-cell'>
                                {task.createdAt ? moment(task.createdAt).format('DD MMM YYYY') : 'N/A'}
                            </td>
                            <td className='py-4 px-4'>
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => handleViewTask(task)}
                                        className='p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200'
                                        title="View Task"
                                    >
                                        <LuEye className='text-sm' />
                                    </button>
                                    <button
                                        onClick={() => handleEditTask(task)}
                                        className='p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200'
                                        title="Edit Task"
                                    >
                                        <LuPencil className='text-sm' />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task)}
                                        className='p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200'
                                        title="Delete Task"
                                    >
                                        <LuTrash2 className='text-sm' />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskListTable;