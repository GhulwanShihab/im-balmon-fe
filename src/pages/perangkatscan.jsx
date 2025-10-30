import React, { useState } from 'react';
import { Home, Package, History, User, Scan } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom'; // Import Link dan useNavigate

const PerangkatScan = () => {
    const [scannedDevices, setScannedDevices] = useState([
        // Dummy data for scanned devices
        { id: 'dev-1', name: 'Perangkat Monitor XYZ' },
        { id: 'dev-2', name: 'Perangkat Monitor XYZ' },
        { id: 'dev-3', name: 'Perangkat Monitor XYZ' },
    ]);
    const [loadingScan, setLoadingScan] = useState(false); // State for scan loading
    const navigate = useNavigate(); // Inisialisasi useNavigate

    const handleCancelScan = (idToCancel) => {
        setScannedDevices(prevDevices => 
            prevDevices.filter(device => device.id !== idToCancel)
        );
    };

    const handleScanNewDevice = () => {
        setLoadingScan(true);
        // Simulate a scanning process
        setTimeout(() => {
            const newDeviceId = `dev-${Date.now()}`;
            setScannedDevices(prevDevices => [
                ...prevDevices,
                { id: newDeviceId, name: `Perangkat Monitor Baru ${prevDevices.length + 1}` }
            ]);
            setLoadingScan(false);
        }, 1500); // Simulate 1.5 seconds scan time
    };

    const handleNext = () => {
        // Logic to proceed after scanning devices
        console.log('Proceeding with scanned devices:', scannedDevices);
        // Navigasi kembali ke halaman home setelah proses selesai
        navigate('/homeuser'); 
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Status Bar - Consistent with login.jsx */}
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

            {/* Top Navigation Bar (Home, Perangkat, Riwayat, Profile) - Consistent with HomeUser.jsx */}
            <nav className="bg-white py-3 shadow-sm">
                <ul className="flex justify-around text-center text-xs text-gray-600">
                    <li className="flex flex-col items-center">
                        <Link to="/homeuser" className="flex flex-col items-center text-gray-600">
                            <Home className="w-5 h-5 mb-1" />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center text-blue-600 font-semibold">
                        <Link to="/perangkatscan" className="flex flex-col items-center text-blue-600">
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
            <div className="flex-1 px-6 py-8 flex flex-col">
                <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">SCAN ALAT MONITORING</h1>

                {/* Scan Area */}
                <div 
                    className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-md mb-8 cursor-pointer"
                    onClick={handleScanNewDevice} 
                >
                    {loadingScan ? (
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-blue-400 border-t-blue-800 rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600">Scanning...</p>
                        </div>
                    ) : (
                        <Scan className="w-24 h-24 text-gray-400" /> 
                    )}
                </div>

                {/* Scanned Devices List */}
                <div className="space-y-4 mb-8">
                    {scannedDevices.length > 0 ? (
                        scannedDevices.map(device => (
                            <div key={device.id} className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <span className="flex-1 text-gray-900 font-medium">{device.name}</span>
                                <button
                                    onClick={() => handleCancelScan(device.id)}
                                    className="ml-4 px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                                >
                                    Batalkan
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">Belum ada perangkat yang dipindai.</div>
                    )}
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={scannedDevices.length === 0} 
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-auto" 
                >
                    Selanjutnya
                </button>
            </div>
        </div>
    );
};

export default PerangkatScan;