import { useEffect, useState } from "react";
import { Plus, Layers, FileDown } from "lucide-react";
import apiClient from "../../../services/api";

const DevicesHeader = ({ navigate }) => {
  const [hasParentDevice, setHasParentDevice] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    year: "",
    month: "",
    device_ids: "",
  });

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
        setHasParentDevice(false);
      }
    };

    fetchDevices();
  }, []);

  // 📥 Function to handle Excel export
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (exportFilters.year) {
        params.append("year", exportFilters.year);
      }
      
      if (exportFilters.month) {
        params.append("month", exportFilters.month);
      }
      
      if (exportFilters.device_ids) {
        params.append("device_ids", exportFilters.device_ids);
      }

      
      const queryString = params.toString();
      const endpoint = queryString 
        ? `/export/excel?${queryString}` 
        : `/export/excel`;


      // Make API request to export endpoint
      // Gunakan axios langsung untuk lebih fleksibel
      const baseURL = apiClient.defaults?.baseURL || "";
      const fullURL = `${baseURL}/devices/export/excel${queryString ? '?' + queryString : ''}`;
      

      const response = await apiClient.get(`/devices/export/excel`, {
        params: {
          ...(exportFilters.year && { year: exportFilters.year }),
          ...(exportFilters.month && { month: exportFilters.month }),
          ...(exportFilters.device_ids && { device_ids: exportFilters.device_ids }),
        },
        responseType: "blob", // Important for downloading files
      });


      // Create blob from response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const filename = `device_usage_report_${
        exportFilters.year || "all"
      }_${exportFilters.month || "all"}_${timestamp}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal and reset filters
      setShowExportModal(false);
      setExportFilters({ year: "", month: "", device_ids: "" });

      alert("✅ File Excel berhasil diunduh!");
    } catch (error) {
      
      let errorMessage = "Gagal mengekspor data ke Excel. ";
      
      if (error.response?.status === 404) {
        errorMessage += "Endpoint tidak ditemukan. Pastikan router export sudah didaftarkan di backend.";
      } else if (error.response?.status === 401) {
        errorMessage += "Anda tidak memiliki akses. Silakan login kembali.";
      } else if (error.response?.status === 500) {
        errorMessage += "Terjadi kesalahan di server. Cek log backend.";
      } else {
        errorMessage += "Silakan coba lagi.";
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <>
      <div className="flex justify-between items-center">
        {/* 🧩 Judul dan deskripsi */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Perangkat</h1>
          <p className="text-gray-600 mt-1">Kelola semua perangkat dalam sistem</p>
        </div>

        {/* 🔘 Tombol aksi */}
        <div className="flex space-x-3">
          {/* Export Excel Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            disabled={isExporting}
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? "Mengekspor..." : "Export Excel"}</span>
          </button>

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

      {/* 📋 Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Export Data Perangkat
            </h2>

            <div className="space-y-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun (Opsional)
                </label>
                <select
                  value={exportFilters.year}
                  onChange={(e) =>
                    setExportFilters({ ...exportFilters, year: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Tahun</option>
                  {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => 2020 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan (Opsional)
                </label>
                <select
                  value={exportFilters.month}
                  onChange={(e) =>
                    setExportFilters({ ...exportFilters, month: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!exportFilters.year}
                >
                  <option value="">Semua Bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
                {!exportFilters.year && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih tahun terlebih dahulu untuk memfilter bulan
                  </p>
                )}
              </div>

              {/* Device IDs Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Perangkat Spesifik (Opsional)
                </label>
                <input
                  type="text"
                  value={exportFilters.device_ids}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      device_ids: e.target.value,
                    })
                  }
                  placeholder="Contoh: 1,2,3,4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pisahkan dengan koma untuk beberapa ID
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>File Excel akan berisi:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc space-y-1">
                  <li>Dashboard & Summary</li>
                  <li>Data Semua Perangkat</li>
                  <li>Statistik Bulanan</li>
                  <li>Statistik Tahunan</li>
                  <li>Detail Riwayat Peminjaman</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportFilters({ year: "", month: "", device_ids: "" });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isExporting}
              >
                Batal
              </button>
              <button
                onClick={handleExportExcel}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isExporting}
              >
                {isExporting ? "Mengekspor..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevicesHeader;