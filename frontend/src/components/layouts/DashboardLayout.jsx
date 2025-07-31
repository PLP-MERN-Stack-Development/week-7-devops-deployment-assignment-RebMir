import React, { useContext } from 'react';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import { UserContext } from '../../context/UserContext'; // Adjust path as needed

const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext); // ✅ define user here

    return (
        <div className=''>
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className="flex">
                    <div className="max-[1080px]:hidden">
                        <SideMenu activeMenu={activeMenu} />
                    </div>
                    <div className='grow mx-5'>{children}</div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
