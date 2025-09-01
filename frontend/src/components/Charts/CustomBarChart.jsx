import React from 'react'
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    BarChart,
} from "recharts";

const CustomBarChart = ({data}) => {
    // Function to get bar colors
    const getBarColor = (entry) => {
        switch (entry?.priority) {
            case 'Low':
                return '#00BC7D'
            case 'Medium':
                return '#FE9900'
            case 'High':
                return "#FF1F57";
            default:
                return '#8D51FF';
        }
    };

    // FIXED: Define CustomToolTip outside component or use the imported one
    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    <p className='text-xs font-semibold text-purple-800 mb-1'>
                        {payload[0].payload.priority}
                    </p>
                    <p className='text-sm text-gray-600'>
                        Count:{" "}
                        <span className="text-sm font-medium text-gray-900">
                            {payload[0].payload.count}
                        </span>
                    </p>
                </div>
            )
        }
        return null;
    }

    // FIXED: Add data validation
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="bg-white mt-6 h-[300px] flex items-center justify-center">
                <p className="text-gray-500">No priority data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white mt-6">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                    <XAxis
                        dataKey="priority"
                        tick={{ fontSize: 12, fill: "#555" }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 12, fill: "#555" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "transparent" }} />

                    <Bar 
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CustomBarChart;