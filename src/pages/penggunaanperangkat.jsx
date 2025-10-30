import React, { useState } from 'react';
import { Home, Package, History, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const PenggunaanPerangkat = () => {
    const [tanggalBa, setTanggalBa] = useState('');
    const [nomorSuratTugas, setNomorSuratTugas] = useState('03<manual>/BALMON.18/KP.01.06/<manual> 01/2025');
    const [tanggalSuratTugas, setTanggalSuratTugas] = useState('');
    const [namaPengguna, setNamaPengguna] = useState('');
    const [namaKegiatan, setNamaKegiatan] = useState('');
    const [lamaPenggunaan, setLamaPenggunaan] = useState('');
    const [alatMonitoring, setAlatMonitoring] = useState('');

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({
            tanggalBa,
            nomorSuratTugas,
            tanggalSuratTugas,
            namaPengguna,
            namaKegiatan,
            lamaPenggunaan,
            alatMonitoring,
        });
        alert('Data Penggunaan Perangkat Tersimpan!');
        // You might want to send this data to an API
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
                    <li className="flex flex-col items-center text-blue-600 font-semibold">
                        <Link to="/perangkatscan" className="flex flex-col items-center text-gray-600">
                            <Package className="w-5 h-5 mb-1" />
                            <span>Perangkat</span>
                        </Link>
                    </li>
                    <li className="flex flex-col items-center">
                        <Link to="/PenggunaanPerangkat" className="flex flex-col items-center text-blue-600">
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
                <h1 className="text-xl font-semibold text-gray-800 mb-6">Penggunaan Perangkat</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="tanggalBa" className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal BA Penggunaan Alat Monitoring
                        </label>
                        <input
                            type="text" // Or "date" if a date picker is desired later
                            id="tanggalBa"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Date (Alphabet)"
                            value={tanggalBa}
                            onChange={handleInputChange(setTanggalBa)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="nomorSuratTugas" className="block text-sm font-medium text-gray-700 mb-1">
                            Nomor Surat Tugas
                        </label>
                        <input
                            type="text"
                            id="nomorSuratTugas"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" // Make it look disabled if it's auto-filled
                            value={nomorSuratTugas}
                            readOnly // Prevent manual editing if it's auto-filled
                        />
                    </div>

                    <div>
                        <label htmlFor="tanggalSuratTugas" className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Surat Tugas
                        </label>
                        <input
                            type="text" // Or "date"
                            id="tanggalSuratTugas"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Date"
                            value={tanggalSuratTugas}
                            onChange={handleInputChange(setTanggalSuratTugas)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="namaPengguna" className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Pengguna
                        </label>
                        <input
                            type="text"
                            id="namaPengguna"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nama"
                            value={namaPengguna}
                            onChange={handleInputChange(setNamaPengguna)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="namaKegiatan" className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Kegiatan (sesuai surat tugas)
                        </label>
                        <input
                            type="text"
                            id="namaKegiatan"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Kegiatan"
                            value={namaKegiatan}
                            onChange={handleInputChange(setNamaKegiatan)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="lamaPenggunaan" className="block text-sm font-medium text-gray-700 mb-1">
                            Lama Penggunaan Alat Monitoring
                        </label>
                        <input
                            type="text" // Or a number input with unit, e.g., "Number of Days"
                            id="lamaPenggunaan"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Date Alphabet"
                            value={lamaPenggunaan}
                            onChange={handleInputChange(setLamaPenggunaan)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="alatMonitoring" className="block text-sm font-medium text-gray-700 mb-1">
                            Alat monitoring yang digunakan (Scan Barcode)
                        </label>
                        <input
                            type="text"
                            id="alatMonitoring"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="" // Placeholder is empty as per image
                            value={alatMonitoring}
                            onChange={handleInputChange(setAlatMonitoring)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Gunakan
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PenggunaanPerangkat;