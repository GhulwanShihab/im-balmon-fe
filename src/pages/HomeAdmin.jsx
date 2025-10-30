import React, { useState, useEffect } from 'react';
import { Home, Package, History, BarChart2, Users, LogOut, User } from 'lucide-react'; // Make sure User is imported here
import { Link, useNavigate } from 'react-router-dom';

const HomeAdmin = () => {
    const navigate = useNavigate();

    // Dummy data for "Penggunaan Alat Monitoring" table
    const [alatMonitoringData, setAlatMonitoringData] = useState([
        { idPerangkat: 'xxxxxx', namaPengguna: 'Fulan', merkPerangkat: 'Alat Monitor X', tanggal: '26/04/2025', lamaPenggunaan: '5 Hari', kondisi: 'Baik' },
        { idPerangkat: 'xxxxxx', namaPengguna: 'Fulana', merkPerangkat: 'Alat Monitor Y', tanggal: '28/04/2025', lamaPenggunaan: '3 Hari', kondisi: 'Baik' },
    ]);

    // This would ideally fetch real data for the chart and table
    useEffect(() => {
        // Simulate fetching data
        // For chart data, you'd typically have an array of data points
        // For table data, it's already defined above as dummy data
    }, []);

    const handleLogout = () => {
        // Implement logout logic here
        alert('Logging out...');
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-blue-700 text-white flex flex-col py-6 px-4 shadow-lg">
                <div className="flex flex-col items-center mb-8">
                    {/* Placeholder for user profile image */}
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mb-3">
                        {/* CORRECTED: Use the User icon here */}
                        <User className="w-16 h-16 text-gray-500" />
                    </div>
                    <span className="text-lg font-semibold">PAK BIMA</span>
                </div>

                <nav className="flex-1">
                    <ul className="space-y-2">
                        <li>
                            <Link to="/homeadmin" className="flex items-center p-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors duration-200">
                                <Home className="w-5 h-5 mr-3" />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/perangkatadmin" className="flex items-center p-3 rounded-lg text-white hover:bg-blue-500 transition-colors duration-200">
                                <Package className="w-5 h-5 mr-3" />
                                <span>Perangkat</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/riwayatadmin" className="flex items-center p-3 rounded-lg text-white hover:bg-blue-500 transition-colors duration-200">
                                <History className="w-5 h-5 mr-3" />
                                <span>Riwayat</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/statistikadmin" className="flex items-center p-3 rounded-lg text-white hover:bg-blue-500 transition-colors duration-200">
                                <BarChart2 className="w-5 h-5 mr-3" />
                                <span>Statistik</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/penggunaadmin" className="flex items-center p-3 rounded-lg text-white hover:bg-blue-500 transition-colors duration-200">
                                <Users className="w-5 h-5 mr-3" />
                                <span>Pengguna</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-lg text-white hover:bg-blue-500 transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-auto">
                {/* Status Bar - Adapted for admin view, similar to user pages */}
                <div className="flex justify-end items-center mb-6">
                    <span className="text-sm font-medium mr-4">9:30</span>
                    <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                            <div className="w-1 h-3 bg-black rounded-full"></div>
                            <div className="w-1 h-3 bg-black rounded-full"></div>
                            <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="w-6 h-3 border border-black rounded-sm">
                            <div className="w-4 h-2 bg-black rounded-sm m-0.5"></div>
                        </div>
                    </div>
                </div>

                {/* Penggunaan Perangkat Monitoring Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">PENGGUNAAN PERANGKAT MONITORING</h2>
                        <select className="text-sm border border-gray-300 rounded-md py-1 px-2">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    {/* Placeholder for the chart. In a real app, you'd integrate a charting library like Recharts, Chart.js, etc. */}
                    <div className="bg-gray-50 h-64 flex items-center justify-center rounded-md border border-gray-200">
                        <p className="text-gray-500">Chart will be rendered here (e.g., using Recharts, Chart.js)</p>
                        {/* Example of a very basic bar chart-like div structure */}
                        <div className="flex items-end h-full p-4 w-full justify-around">
                            {[40, 60, 30, 50, 20, 45, 25, 55, 35, 15, 50, 30].map((height, index) => (
                                <div
                                    key={index}
                                    style={{ height: `${height * 1.2}px` }} // Scale height for visual effect
                                    className="w-4 bg-blue-500 mx-1 rounded-t-sm"
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center mt-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Content</span>
                    </div>
                </div>

                {/* Penggunaan Alat Monitoring Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">PENGGUNAAN ALAT MONITORING</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Perangkat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pengguna</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merk Perangkat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lama Penggunaan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {alatMonitoringData.length > 0 ? (
                                    alatMonitoringData.map((data, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.idPerangkat}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.namaPengguna}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.merkPerangkat}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.tanggal}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.lamaPenggunaan}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.kondisi}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data penggunaan alat monitoring.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeAdmin;