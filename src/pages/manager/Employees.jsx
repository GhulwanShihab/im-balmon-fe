import { useState, useEffect } from 'react';
import { Eye, Search, ChevronLeft, ChevronRight, Filter, Users } from 'lucide-react';
import apiClient from '../../../services/api';

const ManagerEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterJabatan, currentPage]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employees/');
      const data = response.data || [];
      setAllEmployees(data);

      const jabatanList = [...new Set(data.map(emp => emp.jabatan))];
      setJabatanOptions(jabatanList);

      applyFilters(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Gagal memuat data pegawai.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (sourceData) => {
    const data = sourceData || allEmployees;

    const filtered = data.filter((emp) => {
      const matchSearch =
        emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchTerm.toLowerCase());
      const matchJabatan = filterJabatan ? emp.jabatan === filterJabatan : true;
      return matchSearch && matchJabatan;
    });

    const pageSize = 10;
    setTotalPages(Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    setEmployees(paginated);
  };

  const handleFilterReset = () => {
    setFilterJabatan('');
    setSearchTerm('');
    setCurrentPage(1);
    applyFilters();
  };

  const EmployeeDetailModal = ({ employee, isOpen, onClose }) => {
    if (!isOpen || !employee) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl font-semibold text-gray-900">Detail Pegawai</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <p className="text-sm text-gray-900 mt-1 font-semibold">{employee.nama}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">NIP</label>
                <p className="text-sm text-gray-900 mt-1">{employee.nip}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                <p className="text-sm text-gray-900 mt-1">{employee.jabatan}</p>
              </div>
              {employee.created_at && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(employee.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - READ ONLY */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pegawai</h1>
          <p className="text-gray-600 mt-1">Lihat informasi seluruh data pegawai</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <p className="text-sm text-green-800 font-medium">📖 Mode Tampilan (Read-Only)</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2 w-full md:w-1/2">
            <Search className="text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-1/3">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={filterJabatan}
              onChange={(e) => {
                setFilterJabatan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="">Semua Jabatan</option>
              {jabatanOptions.map((jab, i) => (
                <option key={i} value={jab}>{jab}</option>
              ))}
            </select>
            {(filterJabatan || searchTerm) && (
              <button
                onClick={handleFilterReset}
                className="text-sm text-green-600 hover:text-green-800 underline whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">NIP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jabatan</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{emp.nama}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{emp.nip}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{emp.jabatan}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors inline-flex items-center justify-center"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-gray-500 py-8">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Tidak ada data ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {employees.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
};

export default ManagerEmployees;