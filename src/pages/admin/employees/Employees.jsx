import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import apiClient from '../../../services/api';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

      // Buat daftar jabatan unik untuk dropdown
      const jabatanList = [...new Set(data.map(emp => emp.jabatan))];
      setJabatanOptions(jabatanList);

      // Apply filter pertama kali
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

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus pegawai ini?')) {
      try {
        await apiClient.delete(`/employees/${id}`);
        fetchEmployees();
        alert('Pegawai berhasil dihapus.');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Gagal menghapus pegawai.');
      }
    }
  };

  const handleFilterReset = () => {
    setFilterJabatan('');
    setSearchTerm('');
    setCurrentPage(1);
    applyFilters();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pegawai</h1>
          <p className="text-gray-600 mt-1">Kelola seluruh data pegawai</p>
        </div>
        <button
          onClick={() => navigate('/admin/employees/add')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pegawai</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Jabatan</option>
            {jabatanOptions.map((jab, i) => (
              <option key={i} value={jab}>{jab}</option>
            ))}
          </select>
          {(filterJabatan || searchTerm) && (
            <button
              onClick={handleFilterReset}
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{emp.nama}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{emp.nip}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{emp.jabatan}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/admin/employees/${emp.id}/view`)}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/employees/${emp.id}/edit`)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-gray-500 py-6">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Employees;
