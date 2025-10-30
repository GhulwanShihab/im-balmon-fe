import React, { useState, useEffect } from 'react';
import { Home, Package, History, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const RiwayatPerangkat = () => {
    // Dummy data for Riwayat Penggunaan
    const [usageHistory, setUsageHistory] = useState([
        { noSuratTugas: '03xx/BALMON.18/KP.01.06/xx01/2025', tanggal: '26/04/2025', keterangan: 'Selesai' },
        { noSuratTugas: '03xx/BALMON.18/KP.01.06/xx01/2025', tanggal: '29/04/2025', keterangan: 'Selesaikan' },
    ]);

    // Dummy data for Berita Pengembalian
    const [returnNews, setReturnNews] = useState([
        { noSuratTugas: '03xx/BALMON.18/KP.01.06/xx01/2025', tanggal: '26/04/2025', exportBp: 'PDF' },
    ]);

    const handleSelesaikan = (index) => {
        // Logic to handle "Selesaikan" action for usage history
        // In a real application, this would update the status in your backend
        alert(`Aksi "Selesaikan" untuk surat tugas: ${usageHistory[index].noSuratTugas}`);
        // Optionally, update the state to reflect the change
        const updatedUsageHistory = [...usageHistory];
        updatedUsageHistory[index].keterangan = 'Selesai';
        setUsageHistory(updatedUsageHistory);
    };

    const handleExportBP = (index) => {
        // Logic to handle "Export BP" action for return news
        // In a real application, this would trigger a PDF download or generation
        alert(`Aksi "Export BP" untuk surat tugas: ${returnNews[index].noSuratTugas}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Status Bar - Consistent with other pages */}
            <div className="flex justify-between items-center px-4 py-2 bg-white">
                <span className="text-sm font-medium">9:30</span>
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

            {/* Top Navigation Bar */}
            <nav className="bg-white py-3 shadow-sm">
                <ul className="flex justify-around text-center text-xs text-gray-600">
                    <li className="flex flex-col items-center">
                        <Link to="/homeuser" className="flex flex-col items-center text-gray-600">
                            <Home className="w-5 h-5 mb-1" />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center">
                        <Link to="/perangkat" className="flex flex-col items-center text-gray-600">
                            <Package className="w-5 h-5 mb-1" />
                            <span>Perangkat</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center">
                        <Link to="/riwayatperangkat" className="flex flex-col items-center text-gray-600">
                            <History className="w-5 h-5 mb-1" />
                            <span>Riwayat</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center text-blue-600 font-semibold">
                        <Link to="/RiwayatPerangkat" className="flex flex-col items-center text-blue-600">
                            <User className="w-5 h-5 mb-1" />
                            <span>Profile</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 p-6 bg-gray-100 overflow-auto">
                <h1 className="text-xl font-semibold text-gray-800 mb-6">Riwayat Penggunaan</h1>

                {/* Riwayat Penggunaan Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Surat Tugas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usageHistory.length > 0 ? (
                                usageHistory.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.noSuratTugas}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.keterangan === 'Selesai' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-300 text-gray-800">
                                                    Selesai
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelesaikan(index)}
                                                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    Selesaikan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada riwayat penggunaan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <h1 className="text-xl font-semibold text-gray-800 mb-6 mt-8">Berita Pengembalian</h1>

                {/* Berita Pengembalian Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Surat Tugas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Export BP</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {returnNews.length > 0 ? (
                                returnNews.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.noSuratTugas}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tanggal}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleExportBP(index)}
                                                className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            >
                                                {item.exportBp}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada berita pengembalian.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RiwayatPerangkat;