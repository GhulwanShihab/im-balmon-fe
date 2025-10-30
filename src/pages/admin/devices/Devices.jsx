import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../services/api";
import QRCodeGenerator from "../../../components/QRCodeGenerator";

import DevicesHeader from "./DevicesHeader";
import DevicesFilters from "./DevicesFilters";
import DevicesTable from "./DevicesTable";
import Pagination from "./Pagination";

const Devices = () => {
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

  const handleDeleteDevice = async (deviceId, isChild = false) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus perangkat ini?")) return;

    try {
      const endpoint = isChild
        ? `/device-children/${deviceId}` // endpoint untuk child
        : `/devices/${deviceId}`;       // endpoint untuk parent

      await apiClient.delete(endpoint);
      fetchDevices();
      alert("Perangkat berhasil dihapus");
    } catch (error) {
      console.error("Error deleting device:", error);
      if (error.message !== "Session expired. Please login again.") {
        alert("Gagal menghapus perangkat. Silakan coba lagi.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <DevicesHeader navigate={navigate} />
      <DevicesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
      />
      <DevicesTable
        loading={loading}
        devices={devices}
        navigate={navigate}
        onDelete={handleDeleteDevice}
        onGenerateQR={(device) => {
          setSelectedDeviceForQR(device);
          setShowQRModal(true);
        }}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
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

export default Devices;
