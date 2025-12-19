import { useState, useEffect } from 'react';
import { Eye, Search, ChevronLeft, ChevronRight, Filter, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import toast from 'react-hot-toast';

const ManagerEmployees = () => {
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

      const jabatanList = [...new Set(data.map(emp => emp.jabatan))];
      setJabatanOptions(jabatanList);

      applyFilters(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Gagal memuat data pegawai.');
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
  };

  const filteredCount = allEmployees.filter((emp) => {
    const matchSearch =
      emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJabatan = filterJabatan ? emp.jabatan === filterJabatan : true;
    return matchSearch && matchJabatan;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header - READ ONLY */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pegawai</h1>
          <p className="text-gray-600 mt-1">Lihat informasi seluruh data pegawai</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <p className="text-sm text-green-800 font-medium">📖 Mode Tampilan (Read-Only)</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pegawai</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {allEmployees.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jabatan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {jabatanOptions.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hasil Filter</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama atau NIP..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          {/* Filter Jabatan */}
          <div className="w-full lg:w-72">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Jabatan
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterJabatan}
                onChange={(e) => {
                  setFilterJabatan(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white transition-all"
              >
                <option value="">Semua Jabatan</option>
                {jabatanOptions.map((jab, i) => (
                  <option key={i} value={jab}>{jab}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          {(filterJabatan || searchTerm) && (
            <div className="flex items-end">
              <button
                onClick={handleFilterReset}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Reset Filter</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Memuat data pegawai...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <Users className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 font-medium">Tidak ada data pegawai</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filterJabatan
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Tidak ada data untuk ditampilkan'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nama Pegawai
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      NIP
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Jabatan
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {emp.nama?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {emp.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {emp.nip}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          {emp.jabatan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => navigate(`/manager/employees/${emp.id}/view`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {emp.nama?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {emp.nama}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          {emp.nip}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      {emp.jabatan}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/manager/employees/${emp.id}/view`)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm text-gray-700">
                  Menampilkan <span className="font-semibold">{((currentPage - 1) * 10) + 1}</span> - <span className="font-semibold">{Math.min(currentPage * 10, filteredCount)}</span> dari <span className="font-semibold">{filteredCount}</span> pegawai
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Previous</span>
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerEmployees;