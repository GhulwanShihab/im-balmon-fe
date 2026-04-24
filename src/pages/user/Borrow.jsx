import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  Smartphone, 
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Trash2,
  Search,
  Info
} from 'lucide-react';
import apiClient from '../../services/api';
import DeviceImage from '../../components/DeviceImage';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';

const BorrowPage = () => {
  const [step, setStep] = useState(1); // 1: Device Selection, 2: Form Data, 3: Confirmation
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedDevices, setExpandedDevices] = useState({});
  const [formData, setFormData] = useState({
    borrower_name: '',
    activity_name: '',
    assignment_letter_number: '',
    assignment_letter_date: new Date().toISOString().split('T')[0],
    loan_start_date: new Date().toISOString().split('T')[0],
    usage_duration_days: 1,
    purpose: '',
    monitoring_devices: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [pihak1Employees, setPihak1Employees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const scannerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableDevices();
    
    // Auto-fill borrower name from logged-in user
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const name = user.nama || user.full_name || user.username || '';
        if (name) {
          setFormData(prev => ({ ...prev, borrower_name: name }));
        }
      } catch (e) { /* ignore */ }
    }
    
    // Check if device was passed from dashboard
    if (location.state?.selectedDevice) {
      setSelectedDevices([location.state.selectedDevice]);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeeLoading(true);
        // Fetch semua pegawai untuk dropdown Pihak 2
        const [allRes, pihak1Res] = await Promise.all([
          apiClient.get('/employees/'),
          apiClient.get('/employees/', { params: { pihak_1_only: true } })
        ]);
        const allEmps = allRes.data.employees || allRes.data || [];
        const p1Emps = pihak1Res.data.employees || pihak1Res.data || [];
        setEmployees(allEmps.filter(emp => emp.nip && emp.nip.trim() !== ''));
        setPihak1Employees(p1Emps.filter(emp => emp.nip && emp.nip.trim() !== ''));
      } catch (error) {
      } finally {
        setEmployeeLoading(false);
      }
    };
    fetchEmployees();
  }, []);


  const fetchAvailableDevices = async () => {
    try {
      const response = await apiClient.get('/devices/', {
        params: {  page_size: 100 }
      });
      setAvailableDevices(response.data.devices || []);
    } catch (error) {
    }
  };

  const filteredDevices = availableDevices.filter((device) => {
    const matchesSearch =
      device.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.device_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStation = stationFilter ? device.device_station === stationFilter : true;
    const matchesRoom = roomFilter ? device.device_room === roomFilter : true;
    return matchesSearch && matchesStation && matchesRoom;
  }).sort((a, b) => {
    const statusA = (a.device_status || '').toUpperCase();
    const statusB = (b.device_status || '').toUpperCase();
    
    // Prioritize TERSEDIA
    if (statusA === 'TERSEDIA' && statusB !== 'TERSEDIA') return -1;
    if (statusA !== 'TERSEDIA' && statusB === 'TERSEDIA') return 1;
    
    return 0;
  });

  // Get unique locations for One-Way Logic or just simple unique lists
  const stations = [...new Set(availableDevices.map(d => d.device_station).filter(Boolean))].sort();
  // If a station is selected, only show rooms for that station? Or just all rooms?
  // Let's show all rooms relevant to the current station filter if selected, otherwise all rooms.
  const rooms = [...new Set(
    availableDevices
      .filter(d => !stationFilter || d.device_station === stationFilter)
      .map(d => d.device_room)
      .filter(Boolean)
  )].sort();

  const startQRScanner = () => {
    setIsScanning(true);
    
    // Wait for DOM element to be rendered
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 15, // Tingkatkan FPS untuk responsivitas
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Responsive qrbox - lebih besar di mobile
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * 0.75);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true, // Tombol senter untuk kondisi gelap
          showZoomSliderIfSupported: true,  // Slider zoom
          defaultZoomValueIfSupported: 2,   // Default zoom 2x untuk scan lebih mudah
          formatsToSupport: [ 0 ], // Hanya QR code (format 0)
          rememberLastUsedCamera: true,     // Ingat kamera yang dipilih
          supportedScanTypes: [0]           // Kamera saja
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Handle successful scan
          handleQRScanSuccess(decodedText);
          scanner.clear();
          setIsScanning(false);
        },
        (error) => {
          // Handle scan error - ignore untuk menghindari spam console
          // console.log('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRScanSuccess = async (decodedText) => {
    try {
      let deviceCode = decodedText.trim();
      let nupDevice = null;
      let qrDeviceId = null;
      
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.device_code) {
          deviceCode = parsed.device_code.trim();
        }
        if (parsed.nup_device) {
          nupDevice = parsed.nup_device.trim();
        }
        if (parsed.device_id) {
          qrDeviceId = parsed.device_id;
        }
      } catch {
        // kalau bukan JSON, biarkan tetap pakai decodedText langsung
      }

      // 1. Cari di availableDevices (agar bisa menemukan child device)
      let foundDevice = null;
      for (const parent of availableDevices) {
        // Cek parent
        if (
          (qrDeviceId && parent.id === qrDeviceId && !nupDevice && !parent.nup_device) || 
          (!qrDeviceId && parent.device_code === deviceCode && (!nupDevice || !parent.nup_device))
        ) {
          foundDevice = parent;
          break;
        }
        
        // Cek children
        if (parent.children && parent.children.length > 0) {
          for (const child of parent.children) {
            if (
              (qrDeviceId && child.id === qrDeviceId && (child.nup_device || '') === (nupDevice || '')) ||
              (!qrDeviceId && child.device_code === deviceCode && (child.nup_device || '') === (nupDevice || ''))
            ) {
              foundDevice = { ...child, parent_id: parent.id };
              break;
            }
          }
        }
        if (foundDevice) break;
      }

      let device = foundDevice;

      // 2. Jika tidak ditemukan, fallback ke API backend
      if (!device) {
        const response = await apiClient.get(`/devices/code/${encodeURIComponent(deviceCode)}`);
        device = response.data;
      }

      // Case-insensitive comparison untuk status
      const status = (device.device_status || '').toUpperCase();
      if (status !== 'TERSEDIA') {
        toast.error(`Perangkat tidak tersedia untuk dipinjam (status: ${device.device_status})`);
        return;
      }

      const deviceKey = getDeviceKey(device);
      if (selectedDevices.some(d => getDeviceKey(d) === deviceKey)) {
        toast.error('Perangkat sudah dipilih');
        return;
      }

      setSelectedDevices(prev => [...prev, { ...device, __key: deviceKey }]);
      toast.success(`Perangkat ${device.device_name} berhasil ditambahkan`);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error(`Perangkat dengan kode "${deviceCode}" tidak ditemukan`);
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses untuk melihat perangkat');
      } else {
        toast.error(error.response?.data?.detail || 'Gagal memproses QR code');
      }
    }
  };



  const handleManualDeviceSelect = (device) => {
    if (selectedDevices.some(d => getDeviceKey(d) === getDeviceKey(device))) {
      toast.error('Perangkat sudah dipilih');
      return;
    }
   
    setSelectedDevices(prev => [...prev, { ...device, __key: getDeviceKey(device) }]);
    toast.success(`Perangkat ${device.device_name} berhasil ditambahkan`);
  };

  const removeSelectedDevice = (deviceKey) => {
    setSelectedDevices(prev => prev.filter(d => d.__key !== deviceKey));
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleFormSubmit = async () => {
    if (selectedDevices.length === 0) {
      toast.error('Pilih minimal satu perangkat');
      return;
    }

    if (!formData.borrower_name || !formData.activity_name || !formData.assignment_letter_number || !formData.assignment_letter_date || !formData.usage_duration_days) {
      toast.error('Harap lengkapi semua data yang diperlukan');
      return;
    }

    setLoading(true);

    try {
      // Create loan with proper backend format
      const loanData = {
        assignment_letter_number: formData.assignment_letter_number,
        assignment_letter_date: formData.assignment_letter_date,
        borrower_name: formData.borrower_name,
        activity_name: formData.activity_name,
        usage_duration_days: parseInt(formData.usage_duration_days),
        loan_start_date: formData.loan_start_date,
        purpose: formData.purpose || null,
        monitoring_devices: formData.monitoring_devices || null,
        pihak_1_id: formData.pihak_1_id,
        pihak_2_id: formData.pihak_2_id, 
        loan_items: selectedDevices.map(device => {
          const isChild = !!device.parent_id || device.is_child === true;
          return {
            device_id: isChild ? null : device.id,
            child_device_id: isChild ? device.id : null,
            quantity: 1,
            condition_before: "BAIK",
            condition_notes: null
          };
        })
      };

      const response = await apiClient.post('/loans/', loanData);
      
      toast.success('Peminjaman berhasil dibuat!');
      navigate('/user/reports');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal membuat peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const validateAssignmentNumber = async (number) => {
    try {
      const response = await apiClient.post('/loans/validate-assignment-letter', {
        assignment_letter_number: number
      });
      
      return response.data.is_valid;
    } catch (error) {
      return false;
    }
  };

  const toggleExpand = (deviceId) => {
    setExpandedDevices((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  const getDeviceKey = (device) => {
    const isChild = !!device.parent_id || device.is_child === true;
    return (isChild ? "child_" : "parent_") + device.id + "_" + (device.device_code || "code") + "_" + (device.nup_device || "");
  };

  const getStatusBadge = (status) => {
    const normalized = (status || "").toUpperCase();
    
    switch (normalized) {
      case "TERSEDIA":
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Tersedia</span>;
      case "DIPINJAM":
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Dipinjam</span>;
      case "MAINTENANCE":
        return <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Maintenance</span>;
      case "NONAKTIF":
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Nonaktif</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Tidak Diketahui</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Peminjaman Perangkat</h1>
        <p className="text-gray-600 text-sm sm:text-base">Gunakan scan QR atau pilih manual untuk meminjam perangkat</p>
        
        {/* Step Indicator */}
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {[
              { number: 1, title: 'Pilih Perangkat' },
              { number: 2, title: 'Data Peminjaman' },
              { number: 3, title: 'Konfirmasi' }
            ].map((item, index) => (
              <div key={item.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  step >= item.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step > item.number ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    item.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= item.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {item.title}
                </span>
                {index < 2 && (
                  <div className={`mx-4 w-12 h-1 rounded hidden sm:block ${
                    step > item.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Device Selection */}
      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Narasi Panduan Step 1 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Langkah 1: Pilih Perangkat</p>
              <p>Pilih perangkat yang ingin Anda pinjam. Gunakan <strong>Scan QR Code</strong> untuk memilih perangkat secara cepat dengan mengarahkan kamera ke QR code pada perangkat, atau gunakan <strong>pencarian manual</strong> di bawah untuk memilih dari daftar perangkat yang tersedia.</p>
            </div>
          </div>

          {/* QR Scanner Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code Perangkat</h2>
            <p className="text-sm text-gray-500 mb-4">
              Arahkan kamera ke QR code perangkat atau gunakan file gambar QR
            </p>
            
            {!isScanning ? (
              <button
                onClick={startQRScanner}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 sm:py-5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-3 text-sm sm:text-base"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Mulai Scan QR</span>
              </button>
            ) : (
              <div className="space-y-4">
                {/* Hint untuk pengguna mobile */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Tips untuk scan lebih baik:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Pastikan QR code dalam pencahayaan yang cukup</li>
                    <li>Jaga jarak 10-20 cm dari QR code</li>
                    <li>Gunakan tombol senter jika kondisi gelap</li>
                  </ul>
                </div>
                
                {/* QR Reader Container - responsive untuk mobile */}
                <div 
                  id="qr-reader" 
                  className="w-full mx-auto rounded-lg overflow-hidden"
                  style={{ maxWidth: '100%' }}
                ></div>
                
                <button
                  onClick={stopQRScanner}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Berhenti Scan</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Atau Pilih Manual</h2>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari perangkat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full">
                <select
                  value={stationFilter}
                  onChange={(e) => {
                    setStationFilter(e.target.value);
                    setRoomFilter(''); // Reset room when station changes to avoid invalid combos
                  }}
                  className="w-full sm:w-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                >
                  <option value="">Semua Stasiun</option>
                  {stations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>

                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="w-full sm:w-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                >
                  <option value="">Semua Ruangan</option>
                  {rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Device Grid dengan dukungan child */}
            <div className="space-y-3 sm:space-y-4 max-h-[28rem] overflow-y-auto">
              {filteredDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Tidak ada perangkat yang cocok dengan filter Anda.
                </div>
              ) : (
                filteredDevices.map((device) => {
                  const hasChildren = Array.isArray(device.children) && device.children.length > 0;
                  const expanded = expandedDevices[device.id] || false;
                  const status = (device.device_status || "").toUpperCase();
                
                  return (
                    <div
                      key={device.id}
                      className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                    >
                      {/* HEADER DEVICE */}
                      <div className="p-3 sm:p-4 flex items-center gap-3">
                        {/* Expand button for devices with children */}
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpand(device.id)}
                            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                          >
                            {expanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Scrollable Area (Image + Info) */}
                        <div className="flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          <div className="flex items-center gap-3 w-max pr-4">
                            {/* Device Image */}
                            <DeviceImage 
                              photos={device.photos_url} 
                              name={device.device_name} 
                              size="sm" 
                            />
                            
                            {/* Device Info */}
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                                {device.device_name}
                              </h3>
                              <p className="text-xs text-gray-500 whitespace-nowrap mt-0.5">
                                {device.device_code} • {device.nup_device}
                              </p>
                              {!hasChildren && device.device_type && (
                                <p className="text-xs text-gray-400 italic whitespace-nowrap mt-0.5">
                                  {device.device_type}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                          
                        {/* Jika tidak punya anak, tampilkan status + tombol */}
                        {!hasChildren && (
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            {status === "TERSEDIA" && (
                              <button
                                onClick={() => handleManualDeviceSelect(device)}
                                disabled={selectedDevices.some(d => getDeviceKey(d) === getDeviceKey(device))}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-1 px-3 rounded-lg text-xs"
                              >
                                {selectedDevices.some((d) => getDeviceKey(d) === getDeviceKey(device))
                                  ? "Terpilih"
                                  : "Pilih"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* CHILD DEVICES */}
                      {hasChildren && expanded && (
                        <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-4 py-2">
                          {device.children.map((child) => {
                            const childStatus = (child.device_status || "").toUpperCase();
                            const isSelected = selectedDevices.some(d => getDeviceKey(d) === getDeviceKey(child));
                            return (
                              <div
                                key={child.id}
                                className="flex items-center justify-between py-2 border-b last:border-none"
                              >
                                <div className="flex-1 min-w-0 pr-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                  <div className="w-max pr-4">
                                    <h4 className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                      {child.device_name}
                                    </h4>
                                    <p className="text-xs text-gray-500 whitespace-nowrap mt-0.5">
                                      {child.device_code} • {child.nup_device}
                                    </p>
                                  </div>
                                </div>
                            
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(childStatus)}
                                  {childStatus === "TERSEDIA" && (
                                    <button
                                      onClick={() => handleManualDeviceSelect({ ...child, parent_id: device.id })}
                                      disabled={isSelected}
                                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-1 px-3 rounded-lg text-xs"
                                    >
                                      {isSelected ? "Terpilih" : "Pilih"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Devices */}
          {selectedDevices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Perangkat Terpilih ({selectedDevices.length})
              </h2>
              
              <div className="space-y-3">
                {selectedDevices.map((device) => (
                  <div key={device.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    {/* Scrollable Area (Image + Info) */}
                    <div className="min-w-0 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <div className="flex items-center gap-3 w-max pr-4">
                        {/* Device Image */}
                        <DeviceImage 
                          photos={device.photos_url} 
                          name={device.device_name} 
                          size="xs" 
                        />
                        
                        {/* Device Info */}
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">{device.device_name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap mt-0.5">{device.device_code}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedDevice(device.__key)}
                      className="text-red-600 hover:text-red-800 p-1 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm sm:text-base"
              >
                Lanjut ke Data Peminjaman
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Form Data */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Narasi Panduan Step 2 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Langkah 2: Lengkapi Data Peminjaman</p>
              <p>Isi seluruh informasi peminjaman di bawah ini. Pastikan <strong>nomor surat tugas</strong>, <strong>tanggal</strong>, dan <strong>nama kegiatan</strong> sesuai dengan dokumen resmi Anda. Field yang ditandai tanda (*) wajib diisi.</p>
            </div>
          </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Data Peminjaman</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nama Pengguna *
              </label>
              <input
                type="text"
                value={formData.borrower_name}
                readOnly
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-700 cursor-not-allowed"
                placeholder="Nama terisi otomatis (Sistem)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Nama Kegiatan (sesuai surat tugas) *
              </label>
              <input
                type="text"
                value={formData.activity_name}
                onChange={handleInputChange('activity_name')}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                placeholder="Masukkan nama kegiatan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                No. Surat Tugas *
              </label>
              <input
                type="text"
                value={formData.assignment_letter_number}
                onChange={handleInputChange('assignment_letter_number')}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                placeholder="Masukkan nomor surat tugas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal Surat Tugas *
              </label>
              <input
                type="date"
                value={formData.assignment_letter_date}
                onChange={handleInputChange('assignment_letter_date')}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={formData.loan_start_date}
                onChange={handleInputChange('loan_start_date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Durasi Penggunaan (Hari) *
              </label>
              <input
                type="number"
                value={formData.usage_duration_days}
                onChange={handleInputChange('usage_duration_days')}
                min="1"
                max="365"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Kuasa Izin Peminjam Barang *
            </label>
            <select
              value={formData.pihak_1_id || ''}
              onChange={handleInputChange('pihak_1_id')}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl 
                        focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 
                        transition-all text-sm sm:text-base"
              required
            >
              <option value="">Pilih Kuasa Izin Peminjam Barang...</option>
              {employeeLoading ? (
                <option>Memuat data...</option>
              ) : (
                pihak1Employees
                  .filter((emp) => String(emp.id) !== String(formData.pihak_2_id))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nama} ({emp.jabatan})
                    </option>
                  ))
              )}
            </select>
            {pihak1Employees.length === 0 && !employeeLoading && (
              <p className="text-xs text-amber-600 mt-1">⚠️ Belum ada pegawai yang ditandai sebagai Kuasa Izin Peminjam Barang. Hubungi admin.</p>
            )}
          </div>
            
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Pihak 2 (Mengetahui) *
            </label>
            <select
              value={formData.pihak_2_id || ''}
              onChange={handleInputChange('pihak_2_id')}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl 
                        focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 
                        transition-all text-sm sm:text-base"
              required
            >
              <option value="">Pilih Pegawai...</option>
              {employeeLoading ? (
                <option>Memuat data...</option>
              ) : (
                employees
                  .filter((emp) => String(emp.id) !== String(formData.pihak_1_id))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nama} ({emp.jabatan})
                    </option>
                  ))
              )}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm sm:text-base"
            >
              Kembali
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm sm:text-base"
            >
              Lanjut ke Konfirmasi
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Narasi Panduan Step 3 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Langkah 3: Konfirmasi & Kirim</p>
              <p>Periksa kembali semua data di bawah ini sebelum mengajukan peminjaman. Setelah dikonfirmasi, <strong>peminjaman akan langsung aktif</strong> dan perangkat berubah status menjadi "Dipinjam".</p>
            </div>
          </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Konfirmasi Peminjaman</h2>
          
          {/* Summary */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <h3 className="font-medium text-gray-900 mb-3">Data Peminjaman</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="break-words">
                  <span className="text-gray-600">Nama Peminjam:</span>
                  <span className="ml-2 font-medium block sm:inline">{formData.borrower_name}</span>
                </div>
                <div className="break-words">
                  <span className="text-gray-600">Kegiatan:</span>
                  <span className="ml-2 font-medium block sm:inline">{formData.activity_name}</span>
                </div>
                <div className="md:col-span-2 break-words">
                  <span className="text-gray-600">No. Surat Tugas:</span>
                  <span className="ml-2 font-medium block sm:inline">{formData.assignment_letter_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tgl. Surat Tugas:</span>
                  <span className="ml-2 font-medium block sm:inline">
                    {new Date(formData.assignment_letter_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Tgl. Mulai:</span>
                  <span className="ml-2 font-medium block sm:inline">
                    {new Date(formData.loan_start_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Durasi:</span>
                  <span className="ml-2 font-medium block sm:inline">
                    {formData.usage_duration_days} hari
                  </span>
                </div>
              </div>
              {formData.purpose && (
                <div className="mt-3 break-words">
                  <span className="text-gray-600">Tujuan:</span>
                  <span className="ml-2 font-medium block sm:inline">{formData.purpose}</span>
                </div>
              )}
              {formData.monitoring_devices && (
                <div className="mt-3 break-words">
                  <span className="text-gray-600">Perangkat Monitoring:</span>
                  <span className="ml-2 font-medium block sm:inline">{formData.monitoring_devices}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <h3 className="font-medium text-gray-900 mb-3">Perangkat yang Dipinjam ({selectedDevices.length})</h3>
              <div className="space-y-2">
                {selectedDevices.map((device, index) => (
                  <div key={device.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-500 flex-shrink-0">#{index + 1}</span>
                    <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate block">{device.device_name}</span>
                      <span className="text-xs sm:text-sm text-gray-500 truncate block">({device.device_code})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Perhatian:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Pastikan data yang dimasukkan sudah benar</li>
                  <li>Perangkat harus dikembalikan sesuai tanggal yang ditentukan</li>
                  <li>Laporkan segera jika terjadi kerusakan pada perangkat</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
            <button
              onClick={() => setStep(2)}
              className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm sm:text-base"
            >
              Kembali
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={loading}
              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Konfirmasi Peminjaman</span>
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default BorrowPage;