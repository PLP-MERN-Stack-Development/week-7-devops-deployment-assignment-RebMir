import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(`%c[UserContext] useEffect triggered. Current user state:`, 'color: orange', user);

        if (user) {
            console.log(`%c[UserContext] User object already exists. Halting effect.`, 'color: green');
            if(loading) setLoading(false);
            return;
        }

        const accessToken = localStorage.getItem("token");
        if (!accessToken) {
            console.log(`%c[UserContext] No token in storage. Halting effect.`, 'color: gray');
            setLoading(false);
            return;
        }

        console.log(`%c[UserContext] Token found. Fetching user profile...`, 'color: blue');
        const fetchUser = async () => {
            try {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                console.log(`%c[UserContext] Profile fetched successfully. Response data:`, 'color: green', response.data);
                setUser(response.data);
            } catch (error) {
                console.error("[UserContext] CRITICAL: fetchUser failed. This is likely clearing the user state.", error);
                clearUser();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); // Remove [user] dependency to prevent infinite loop

    const updateUser = (userData) => {
        console.log(`%c[UserContext] updateUser called with:`, 'color: purple; font-weight: bold;', userData);
        if (userData && userData.token) {
            localStorage.setItem("token", userData.token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            setUser(userData);
            setLoading(false); // Also set loading to false here
        } else {
            console.error("[UserContext] updateUser called with invalid data (missing token).", userData);
        }
    };

    const clearUser = () => {
        console.error("[UserContext] clearUser has been called. Wiping user state and token.");
        setUser(null);
        localStorage.removeItem("token");
        delete axiosInstance.defaults.headers.common['Authorization'];
    };

    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};
