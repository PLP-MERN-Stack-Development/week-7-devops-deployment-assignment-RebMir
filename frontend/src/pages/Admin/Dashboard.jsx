import React, { useEffect, useState } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import { addThousandsSeparator } from '../../utils/helper';
import InfoCard from '../../components/Cards/InfoCard';
import TaskListTable from '../../components/TaskListTable';
import { LuArrowRight, LuRefreshCw } from 'react-icons/lu';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const Dashboard = () => {
    useUserAuth();

    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [dashboardData, setDashboardData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Add state for dynamic greeting
    const [greetingData, setGreetingData] = useState({
        greeting: "Welcome!",
        timeOfDay: "morning",
        subtext: "Have a great day!"
    });

    // Function to get time-based greeting
    const getTimeBasedGreeting = () => {
        const now = new Date();
        const hour = now.getHours();
        const userName = user?.name || "User";
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
        const isWeekend = [0, 6].includes(now.getDay());
        
        let greeting;
        let subtext;
        let timeOfDay;
        
        if (hour >= 5 && hour < 12) {
            timeOfDay = "morning";
            const morningGreetings = [
                `Good morning, ${userName}!`,
                `Rise and shine, ${userName}!`,
                `Morning, ${userName}! Ready to tackle the day?`,
                `Good morning, ${userName}! Hope you slept well.`
            ];
            greeting = morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
            
            if (hour < 7) {
                subtext = "You're up early today! Ready to seize the day?";
            } else if (isWeekend) {
                subtext = `Happy ${dayName}! Enjoy your weekend.`;
            } else {
                subtext = `Hope you're having a great ${dayName} morning.`;
            }
        } else if (hour >= 12 && hour < 17) {
            timeOfDay = "afternoon";
            const afternoonGreetings = [
                `Good afternoon, ${userName}!`,
                `Afternoon, ${userName}! How's your day going?`,
                `Hey ${userName}! Hope you're having a productive afternoon.`,
                `Good afternoon, ${userName}! Keep up the great work.`
            ];
            greeting = afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
            
            if (hour === 12) {
                subtext = "Lunch time! Hope you're taking a break.";
            } else if (isWeekend) {
                subtext = `Enjoying your ${dayName} afternoon?`;
            } else {
                subtext = "Hope your day is going well so far.";
            }
        } else if (hour >= 17 && hour < 21) {
            timeOfDay = "evening";
            const eveningGreetings = [
                `Good evening, ${userName}!`,
                `Evening, ${userName}! Time to wind down?`,
                `Hey ${userName}! How was your day?`,
                `Good evening, ${userName}! Almost time to relax.`
            ];
            greeting = eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
            
            if (isWeekend) {
                subtext = `Hope you're having a relaxing ${dayName} evening.`;
            } else {
                subtext = "Wrapping up the day? Great time to review your progress.";
            }
        } else {
            timeOfDay = "night";
            const nightGreetings = [
                `Good night, ${userName}!`,
                `Hey ${userName}! Burning the midnight oil?`,
                `Night owl mode, ${userName}?`,
                `Good night, ${userName}! Don't stay up too late.`
            ];
            greeting = nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
            
            if (hour >= 21 && hour < 24) {
                subtext = "Working late? Don't forget to take care of yourself.";
            } else {
                subtext = "Burning the midnight oil? Hope everything's going well.";
            }
        }
        
        return { greeting, subtext, timeOfDay, hour };
    };

    // Update greeting function
    const updateGreeting = () => {
        const newGreetingData = getTimeBasedGreeting();
        setGreetingData(newGreetingData);
    };

    // Prepare Chart Data
    const prepareChartData = (data) => {
        console.log("🎯 Preparing chart data with:", data);
        
        const taskDistribution = data?.taskDistribution || {};
        const taskPriorityLevels = data?.taskPriorityLevels || {};

        console.log("📊 Task Distribution Raw:", taskDistribution);
        console.log("🎯 Priority Levels Raw:", taskPriorityLevels);

        const taskDistributionData = [
            { status: "Pending", count: taskDistribution?.Pending || 0 },
            { status: "In Progress", count: taskDistribution?.InProgress || 0 },
            { status: "Completed", count: taskDistribution?.Completed || 0 },
        ];

        const PriorityLevelData = [
            { priority: "Low", count: taskPriorityLevels?.Low || 0 },
            { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
            { priority: "High", count: taskPriorityLevels?.High || 0 },
        ];

        console.log("🥧 Final Pie Chart Data:", taskDistributionData);
        console.log("📊 Final Bar Chart Data:", PriorityLevelData);

        setPieChartData(taskDistributionData);
        setBarChartData(PriorityLevelData);
    }

    const getDashboardData = async () => {
        console.log("🔄 Fetching dashboard data...");
        setIsLoading(true);
        
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
            
            console.log("📊 Raw API Response:", response);
            console.log("📈 Response Data:", response.data);
            console.log("🎯 Charts Section:", response.data?.charts);
            
            if (response.data) {
                setDashboardData(response.data);
                prepareChartData(response.data?.charts || null);
            } else {
                console.warn("⚠️ No data received from API");
            }
        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
            console.error("❌ Error details:", error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const onSeeMore = () => {
        navigate('/admin/tasks');
    }

    const refreshDashboard = () => {
        console.log("🔄 Manual refresh triggered");
        getDashboardData();
        updateGreeting(); // Also refresh greeting
    };

    // Initialize greeting when component mounts or user changes
    useEffect(() => {
        updateGreeting();
    }, [user?.name]);

    // Update greeting every minute to handle time changes during long sessions
    useEffect(() => {
        const greetingInterval = setInterval(updateGreeting, 60000);
        return () => clearInterval(greetingInterval);
    }, [user?.name]);

    // FIXED: Single useEffect that handles both initial load and navigation
    useEffect(() => {
        console.log("🚀 Dashboard useEffect triggered, pathname:", location.pathname);
        getDashboardData();
    }, [location.pathname]); // This will trigger on route changes

    // ADDITIONAL: Force refresh when component becomes visible (browser tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log("👁️ Page became visible, refreshing...");
                getDashboardData();
                updateGreeting(); // Update greeting when tab becomes visible
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Get CSS classes for time-based styling
    const getGreetingClasses = () => {
        const baseClasses = "transition-all duration-500 ease-in-out rounded-lg p-4 mb-4";
        
        switch (greetingData.timeOfDay) {
            case "morning":
                return `${baseClasses} bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400`;
            case "afternoon":
                return `${baseClasses} bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400`;
            case "evening":
                return `${baseClasses} bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-400`;
            case "night":
                return `${baseClasses} bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-slate-400`;
            default:
                return baseClasses;
        }
    };

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className='card my-5'>
                <div className='flex justify-between items-center'>
                    <div className='col-span-3'>
                        {/* Updated greeting section with dynamic content and styling */}
                        <div className={getGreetingClasses()}>
                            <h2 className='text-xl md:text-2xl font-semibold text-gray-800'>
                                {greetingData.greeting}
                            </h2>
                            <p className='text-sm md:text-base text-gray-600 mt-1'>
                                {greetingData.subtext}
                            </p>
                            <p className='text-xs md:text-[13px] text-gray-400 mt-1.5'>
                                {moment().format("dddd, DD MMM YYYY • HH:mm")}
                            </p>
                        </div>
                    </div>
                    
                    {/* DEBUG: Add refresh button */}
                    <button 
                        onClick={refreshDashboard} 
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors ${isLoading ? 'opacity-50' : ''}`}
                        disabled={isLoading}
                    >
                        <LuRefreshCw className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols md:grid-cols-4 gap-3 md:gap-6 mt-5'>
                    <InfoCard
                        label="Total Tasks"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.All || 0
                        )}
                        color="bg-primary"
                    />
                    <InfoCard
                        label="Pending Tasks"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.Pending || 0
                        )}
                        color="bg-violet-500"
                    />
                    <InfoCard
                        label="In Progress Tasks"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.InProgress || 0
                        )}
                        color="bg-cyan-500"
                    />
                    <InfoCard
                        label="Completed Tasks"
                        value={addThousandsSeparator(
                            dashboardData?.charts?.taskDistribution?.Completed || 0
                        )}
                        color="bg-lime-500"
                    />
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6'>

                <div>
                    <div className='card'>
                        <div className='flex items-center justify-between'>
                            <h5 className='font-medium'>Task Distribution</h5>
                        </div>

                        {isLoading ? (
                            <div className="h-[325px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <CustomPieChart
                                data={pieChartData}
                                colors={COLORS}
                            />
                        )}
                    </div>
                </div>
                
                <div>
                    <div className='card'>
                        <div className='flex items-center justify-between'>
                            <h5 className='font-medium'>Task Priority Levels</h5>
                        </div>

                        {isLoading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <CustomBarChart
                                data={barChartData}
                            />
                        )}
                    </div>
                </div>

                <div className='md:col-span-2'>
                    <div className='card'>
                        <div className='flex items-center justify-between'>
                            <h5 className='text-lg'>Recent Tasks</h5>

                            <button className='card-btn' onClick={onSeeMore}>
                                See All <LuArrowRight className='text-base' />
                            </button>
                        </div>

                        <TaskListTable tableData={dashboardData?.recentTasks || []} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;