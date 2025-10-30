import React, { useState, useEffect } from 'react';
import { Home, Package, History, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link dan useNavigate

const HomeUser = () => {
    const [devices, setDevices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Inisialisasi useNavigate

    const fetchDevices = async () => {
        setLoading(true);
        setError('');
        try {
            // Menggunakan data dummy
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setDevices([
                { id: 'XX', name: 'Antena', brand: 'Antena A', condition: 'Baik', status: 'Tersedia' },
                { id: 'XX', name: 'Antena', brand: 'Antena B', condition: 'Baik', status: 'Tersedia' },
                { id: 'XX', name: 'Antena', brand: 'Antena C', condition: 'Baik', status: 'Digunakan' },
            ]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const filteredDevices = devices.filter(device =>
        Object.values(device).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

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
                    <li className="flex flex-col items-center text-blue-600 font-semibold">
                        <Link to="/homeuser" className="flex flex-col items-center text-blue-600">
                            <Home className="w-5 h-5 mb-1" />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center">
                        <Link to="/perangkatscan" className="flex flex-col items-center text-gray-600">
                            <Package className="w-5 h-5 mb-1" />
                            <span>Perangkat</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center">
                        <Link to="/PenggunaanPerangkat" className="flex flex-col items-center text-gray-600">
                            <History className="w-5 h-5 mb-1" />
                            <span>Riwayat</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center">
                        <Link to="/RiwayatPerangkat" className="flex flex-col items-center text-gray-600">
                            <User className="w-5 h-5 mb-1" />
                            <span>Profile</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 p-6 bg-gray-100 overflow-auto">
                <h1 className="text-xl font-semibold text-gray-800 mb-2">Penggunaan Perangkat Monitoring</h1>
                <p className="text-sm text-gray-600 mb-6">Ingin meminjam perangkat monitoring? tekan tombol dibawah ini</p>

                <button 
                    onClick={() => navigate('/perangkatscan')} // Navigasi ke halaman scan
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    PILIH ALAT MONITORING
                </button>

                <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Daftar Ketersediaan Perangkat</h2>

                {/* Search Bar */}
                <div className="flex items-center space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Cari perangkat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        Cari
                    </button>
                </div>

                {loading && <p className="text-center text-gray-600">Memuat data perangkat...</p>}
                {error && <p className="text-center text-red-600">Error: {error}</p>}

                {/* Device List Table */}
                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Penggunaan</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDevices.length > 0 ? (
                                    filteredDevices.map((device, index) => (
                                        <tr key={device.id + index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.brand}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.condition}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    device.status === 'Tersedia' ? 'bg-green-100 text-green-800' :
                                                    device.status === 'Digunakan' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {device.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada perangkat yang ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeUser;