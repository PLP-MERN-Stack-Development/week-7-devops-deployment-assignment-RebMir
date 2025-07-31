import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. Import useLocation
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import { UserContext } from '../../context/UserContext';

const SideMenu = () => {
    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);

    // 2. Create the 'activeMenu' state variable.
    //    We will use this to track which menu item is currently selected.
    const [activeMenu, setActiveMenu] = useState('');

    const navigate = useNavigate();
    const location = useLocation(); // 3. Get the current URL location

    // This useEffect will run whenever the URL changes.
    // It will check the current path and set the active menu item accordingly.
    useEffect(() => {
        const currentPath = location.pathname;
        const currentMenuItem = sideMenuData.find(item => item.path === currentPath);
        if (currentMenuItem) {
            setActiveMenu(currentMenuItem.label);
        }
    }, [location, sideMenuData]); // It runs when location or menu data changes

    const handleClick = (route, label) => { // Pass the label in
        if (route === "logout") {
            handleLogout();
            return;
        }
        setActiveMenu(label); // Set the active menu on click
        navigate(route);
    };

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    useEffect(() => {
        if (user) {
            setSideMenuData(user?.role === 'admin' ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA);
        }
        return () => {};
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <div className='w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-21'>
            <div className='flex flex-col items-center justify-center mb-7 pt-5'>
                <div className='relative'>
                    {user?.profileImageUrl && (
                        <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            className="w-20 h-20 bg-slate-400 rounded-full"
                        />
                    )}
                    {!user?.profileImageUrl && (
                        <div className="w-20 h-20 bg-slate-400 rounded-full" />
                    )}
                </div>

                {user?.role === "admin" && (
                    <div className='text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1'>
                        Admin
                    </div>
                )}

                <h5 className="text-gray-950 font-medium leading-6 mt-3">
                    {user?.name || ""}
                </h5>

                <p className='text-[12px] text-gray-500'>{user?.email || ""}</p>
            </div>

            {sideMenuData.map((item, index) => (
                <button
                    key={`menu_${index}`}
                    // This comparison will now work because 'activeMenu' exists
                    className={`w-full flex items-center gap-4 text-[15px] ${
                        activeMenu === item.label
                            ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
                            : ""
                    } py-3 px-6 mb-3 cursor-pointer`}
                    onClick={() => handleClick(item.path, item.label)} // Pass the label here
                >
                    <item.icon className="text-xl" />
                    {item.label}
                </button>
            ))}
        </div>
    );
}

export default SideMenu;