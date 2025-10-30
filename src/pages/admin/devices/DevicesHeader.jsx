import { useEffect, useState } from "react";
import { Plus, Layers } from "lucide-react";
import apiClient from "../../../services/api";

const DevicesHeader = ({ navigate }) => {
  const [hasParentDevice, setHasParentDevice] = useState(false);

  // 🔍 Cek apakah sudah ada parent device
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await apiClient.get("/devices/");
        const devices = res.data?.devices || res.data || [];

        // hanya hitung device yang tidak punya parent_id (parent utama)
        const parentCount = devices.filter((d) => !d.parent_id).length;
        setHasParentDevice(parentCount > 0);
      } catch (err) {
        console.error("❌ Gagal memuat daftar perangkat:", err);
        setHasParentDevice(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div className="flex justify-between items-center">
      {/* 🧩 Judul dan deskripsi */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Perangkat</h1>
        <p className="text-gray-600 mt-1">Kelola semua perangkat dalam sistem</p>
      </div>

      {/* 🔘 Tombol aksi */}
      <div className="flex space-x-3">
        {/* Tambah parent device */}
        <button
          onClick={() => navigate("/admin/devices/add")}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perangkat</span>
        </button>

        {/* Tambah child device (muncul hanya jika sudah ada parent) */}
        {hasParentDevice && (
          <button
            onClick={() => navigate("/admin/devices/add-child")}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Tambah Device Child</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DevicesHeader;
