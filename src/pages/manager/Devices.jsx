import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, QrCode, Search, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../../services/api";
import QRCodeGenerator from "../../../components/QRCodeGenerator";

const ManagerDevices = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDeviceForQR, setSelectedDeviceForQR] = useState(null);
  const [filters, setFilters] = useState({
    device_type: "",
    device_condition: "",
    device_status: "",
    device_room: "",
  });

  useEffect(() => {
    fetchDevices();
  }, [currentPage, searchTerm, filters]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 10,
        ...(searchTerm && { device_name: searchTerm }),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const response = await apiClient.get("/devices/", { params });
      const devicesData =
        response.data?.devices || response.data?.data || response.data || [];
      const totalCount =
        response.data?.total ||
        response.data?.count ||
        devicesData.length ||
        0;
      
      const normalizedDevices = Array.isArray(devicesData)
        ? devicesData.map((d) => ({
            ...d,
            device_status: d.device_status?.toUpperCase?.() || "TERSEDIA",
            device_condition: d.device_condition?.toLowerCase?.() || "baik",
          }))
        : [];

      setDevices(normalizedDevices);
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (error) {
      console.error("Error fetching devices:", error);
      if (error.message !== "Session expired. Please login again.") {
        alert("Gagal memuat data perangkat. Silakan coba lagi.");
      }
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const DeviceRow = ({ device }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = Array.isArray(device.children) && device.children.length > 0;

    const getStatusBadge = (status) => {
      const badges = {
        TERSEDIA: "bg-green-100 text-green-800",
        DIPINJAM: "bg-blue-100 text-blue-800",
        MAINTENANCE: "bg-orange-100 text-orange-800",
        NONAKTIF: "bg-gray-100 text-gray-800",
      };
      return badges[status] || "bg-gray-100 text-gray-800";
    };

    const getConditionBadge = (condition) => {
      const badges = {
        baik: "bg-green-100 text-green-800",
        rusak_ringan: "bg-yellow-100 text-yellow-800",
        rusak_berat: "bg-red-100 text-red-800",
        hilang: "bg-purple-100 text-purple-800",
      };
      return badges[condition] || "bg-gray-100 text-gray-800";
    };

    const getConditionLabel = (condition) => {
      const labels = {
        baik: "Baik",
        rusak_ringan: "Rusak Ringan",
        rusak_berat: "Rusak Berat",
        hilang: "Hilang",
      };
      return labels[condition] || condition;
    };

    return (
      <>
        <tr className={`hover:bg-green-50 ${hasChildren ? "bg-gray-50" : ""}`}>
          <td className="px-4 py-4">
            <div className="flex items-center space-x-2">
              {hasChildren && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  {expanded ? (
                    <ChevronLeft className="w-4 h-4 rotate-90" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {device.device_name}
                </div>
                {hasChildren ? (
                  <div className="text-xs text-gray-500 italic">
                    {device.children.length} perangkat anak
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{device.device_type}</div>
                )}
              </div>
            </div>
          </td>

          {!hasChildren && (
            <>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-900">{device.device_code}</div>
                <div className="text-sm text-gray-500">{device.nup_device}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {device.bmn_brand || device.sample_brand}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(
                    device.device_condition
                  )}`}
                >
                  {getConditionLabel(device.device_condition)}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                    device.device_status
                  )}`}
                >
                  {device.device_status}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {device.device_room || "-"}
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDeviceForQR(device);
                      setShowQRModal(true);
                    }}
                    className="p-1 text-purple-600 hover:text-purple-800"
                    title="Generate QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/manager/devices/${device.id}/view`)}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </>
          )}
        </tr>

        {/* Child devices */}
        {hasChildren && expanded && (
          <tr>
            <td colSpan="7" className="p-0 bg-gray-50">
              <table className="min-w-full border-t border-gray-200">
                <tbody>
                  {device.children.map((child) => (
                    <tr
                      key={child.id}
                      className="hover:bg-gray-100 border-b last:border-none"
                    >
                      <td className="px-10 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {child.device_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {child.device_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {child.device_code}
                        <div className="text-xs text-gray-500">{child.nup_device}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {child.bmn_brand || child.sample_brand}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(
                            child.device_condition
                          )}`}
                        >
                          {getConditionLabel(child.device_condition)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            child.device_status
                          )}`}
                        >
                          {child.device_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {child.device_room || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDeviceForQR(child);
                              setShowQRModal(true);
                            }}
                            className="p-1 text-purple-600 hover:text-purple-800"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/manager/devices/${child.id}/view-child`)
                            }
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - READ ONLY (tanpa tombol tambah) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Perangkat</h1>
          <p className="text-gray-600 mt-1">Lihat informasi semua perangkat dalam sistem</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <p className="text-sm text-green-800 font-medium">📖 Mode Tampilan (Read-Only)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari perangkat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.device_condition}
              onChange={(e) =>
                setFilters({ ...filters, device_condition: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak_ringan">Rusak Ringan</option>
              <option value="rusak_berat">Rusak Berat</option>
              <option value="hilang">Hilang</option>
            </select>

            <select
              value={filters.device_status}
              onChange={(e) =>
                setFilters({ ...filters, device_status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Status</option>
              <option value="TERSEDIA">Tersedia</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="NONAKTIF">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Tidak ada data perangkat.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Perangkat",
                      "Kode/NUP",
                      "Brand",
                      "Kondisi",
                      "Status",
                      "Ruangan",
                      "Aksi",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <DeviceRow key={device.id} device={device} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeGenerator
        device={selectedDeviceForQR}
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedDeviceForQR(null);
        }}
      />
    </div>
  );
};

export default ManagerDevices;