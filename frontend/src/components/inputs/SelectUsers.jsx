import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance'; // Import axiosInstance
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../Modal';
import { LuUsers } from 'react-icons/lu';
import AvatarGroup from '../AvatarGroup';

const SelectUsers = ({ selectedUsers = [], setSelectedUsers = () => {} }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAssign = () => {
        setSelectedUsers(tempSelectedUsers);
        setIsModalOpen(false);
    };

    const selectedUserAvatars = allUsers
        .filter((user) => selectedUsers.includes(user._id))
        .map((user) => user.profileImageUrl);

    useEffect(() => {
        getAllUsers();
    }, []);

    useEffect(() => {
        if (selectedUsers.length === 0) {
            setTempSelectedUsers([]);
        }
    }, [selectedUsers]);

    return (
        <div className='space-y-4 mt-2'>
            {selectedUserAvatars.length === 0 && (
                <button className="card-btn" onClick={() => setIsModalOpen(true)}>
                    <LuUsers className="text-sm" /> Add Members
                </button>
            )}

            {selectedUserAvatars.length > 0 && (
                <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Selected Users"
            >
                <div className='space-y-4 h-[60vh] overflow-y-auto'>
                    {allUsers.map((user) => (
                        <div 
                            key={user._id}
                            className='flex items-center gap-4 p-3 border-b border-gray-200'
                        >
                            <img
                                src={user.profileImageUrl}
                                alt={user.name}
                                className='w-10 h-10 rounded-full'
                            />
                            <div className='flex-1'>
                                <p className='font-medium text-gray-800 dark:text-white'>
                                    {user.name}
                                </p>
                                <p className='text-[13px] text-gray-500'>{user.email}</p>
                            </div>

                            <input
                                type='checkbox'
                                checked={tempSelectedUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                                className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none'
                            />
                        </div>
                    ))}
                </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button className="card-btn" onClick={() => setIsModalOpen(false)}>
                            CANCEL
                        </button>
                        <button className='card-btn-fill' onClick={handleAssign}>
                            DONE
                        </button>
                    </div>
            </Modal>
        </div>
    );
};

export default SelectUsers;
