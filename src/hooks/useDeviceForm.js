import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export const useDeviceForm = (initialDeviceState = {}) => {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]); // file list
  const [previews, setPreviews] = useState([]); // preview URLs
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);

  const defaultDeviceState = {
    device_name: '',
    device_code: '',
    nup_device: '',
    bmn_brand: '',
    sample_brand: '',
    device_year: new Date().getFullYear(),
    device_type: '',
    device_station: '',
    device_condition: 'BAIK',
    device_status: 'TERSEDIA',
    device_room: '',
    description: '',
  };

  const [device, setDevice] = useState({ ...defaultDeviceState, ...initialDeviceState });

  // Ambil daftar perangkat untuk opsi parent
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await apiClient.get('/devices/');
        const allDevices = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.devices)
          ? res.data.devices
          : [];
        setDevices(allDevices);
      } catch (err) {
        console.error('❌ Gagal mengambil daftar perangkat:', err);
        setDevices([]);
      }
    };

    fetchDevices();
  }, []);

  // Ambil daftar lokasi untuk dropdown
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

  const handleInputChange = (field, value) => {
    setDevice(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const stations = locations.filter(loc => loc.type === 'STASIUN');
  const rooms = locations.filter(loc => loc.type === 'RUANGAN');

  return {
    device,
    setDevice,
    loading,
    setLoading,
    photos,
    previews,
    devices,
    locations,
    stations,
    rooms,
    handleInputChange,
    handleFileChange,
    handleRemovePhoto,
  };
};
