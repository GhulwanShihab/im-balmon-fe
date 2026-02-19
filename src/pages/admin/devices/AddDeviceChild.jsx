import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, X } from "lucide-react";
import apiClient from "../../../services/api";

const AddDeviceChild = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [childDevice, setChildDevice] = useState({
    parent_id: null,
    device_name: "",
    device_code: "",
    nup_device: "",
    bmn_brand: "",
    sample_brand: "",
    device_year: new Date().getFullYear(),
    device_type: "",
    device_station: "",
    device_condition: "BAIK",
    device_status: "TERSEDIA",
    device_room: "",
    description: "",
  });

  // 🔍 Fetch parent devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await apiClient.get("/devices/");
        const allDevices = Array.isArray(res.data?.devices)
          ? res.data.devices
          : res.data;
        setDevices(allDevices || []);
      } catch (err) {
        console.error("❌ Gagal mengambil daftar perangkat parent:", err);
        setDevices([]);
      }
    };
    fetchDevices();
  }, []);

  // Fetch locations for dropdowns
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await apiClient.get('/locations/');
        const data = Array.isArray(res.data) ? res.data : [];
        setLocations(data);
      } catch (err) {
        console.error('❌ Gagal mengambil daftar lokasi:', err);
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Stations and rooms from locations API (filtered by type)
  const stations = locations.filter(loc => loc.type === 'STASIUN');
  const rooms = locations.filter(loc => loc.type === 'RUANGAN');

  // ✏️ Handle input
  const handleInputChange = (field, value) => {
    setChildDevice((prev) => ({ ...prev, [field]: value }));
  };

  // 🖼️ Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 💾 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("📦 Data dikirim ke backend:", childDevice);

      const res = await apiClient.post("/device-children", childDevice);
      const newChild = res.data;

      if (photos && photos.length > 0 && newChild.id) {
        for (const file of photos) {
          const formData = new FormData();
          formData.append("file", file);
          await apiClient.post(`/device-children/${newChild.id}/photos`, formData, {
            headers: { "Content-Type": undefined },
          });
        }
      }

      alert("Device child berhasil ditambahkan!");
      navigate("/admin/devices");
    } catch (error) {
      console.error("❌ Gagal menambahkan device child:", error);
      alert("Gagal menambahkan device child. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter((d) =>
    d.device_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/admin/devices")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Device Child</h1>
          <p className="text-gray-600">Hubungkan ke perangkat utama</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1️⃣ Pilih parent */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">1</span>
            </div>
            Pilih Parent Device
          </h3>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari perangkat induk..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <select
              value={childDevice.parent_id || ""}
              onChange={(e) =>
                handleInputChange("parent_id", Number(e.target.value))
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Pilih perangkat utama</option>
              {filteredDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.device_name} ({d.device_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2️⃣ Identitas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">2</span>
            </div>
            Identitas Device Child
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nama Device Child" field="device_name" value={childDevice.device_name} placeholder="Contoh: Sensor A" onChange={handleInputChange} />
            <InputField label="Kode Device Child *" field="device_code" value={childDevice.device_code} required placeholder="Contoh: SENSOR-A-01" onChange={handleInputChange} />
            <InputField label="NUP Device Child *" field="nup_device" value={childDevice.nup_device} required placeholder="Nomor Urut Pendaftaran" onChange={handleInputChange} />
            <InputField label="Brand BMN" field="bmn_brand" value={childDevice.bmn_brand} onChange={handleInputChange} />
            <InputField label="Brand Sample" field="sample_brand" value={childDevice.sample_brand} onChange={handleInputChange} />
            <InputField label="Tahun Device" field="device_year" type="number" value={childDevice.device_year} onChange={(f, val) => handleInputChange(f, parseInt(val) || new Date().getFullYear())} />
            <InputField label="Tipe Device" field="device_type" value={childDevice.device_type} placeholder="Contoh: Sensor, Modul" onChange={handleInputChange} />
          </div>
        </div>

        {/* 3️⃣ Lokasi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">3</span>
            </div>
            Lokasi & Penempatan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stasiun Perangkat</label>
              <select
                value={childDevice.device_station}
                onChange={(e) => handleInputChange('device_station', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Pilih Stasiun --</option>
                {stations.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ruangan</label>
              <select
                value={childDevice.device_room}
                onChange={(e) => handleInputChange('device_room', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4️⃣ Status & Kondisi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">4</span>
            </div>
            Status & Kondisi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kondisi Perangkat
              </label>
              <select
                value={childDevice.device_condition}
                onChange={(e) =>
                  handleInputChange("device_condition", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK">Rusak</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Perangkat
              </label>
              <select
                value={childDevice.device_status}
                onChange={(e) =>
                  handleInputChange("device_status", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="NONAKTIF">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5️⃣ Deskripsi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">5</span>
            </div>
            Informasi Tambahan
          </h3>
          <textarea
            value={childDevice.description}
            onChange={(e) =>
              handleInputChange("description", e.target.value)
            }
            rows={4}
            placeholder="Deskripsi detail perangkat..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* 6️⃣ Foto */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-emerald-600 text-sm font-semibold">6</span>
            </div>
            Foto Device Child
          </h3>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/devices")}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Device Child"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ✅ Capitalized component
const InputField = ({ label, field, value, onChange, type = "text", placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
    />
  </div>
);

export default AddDeviceChild;
