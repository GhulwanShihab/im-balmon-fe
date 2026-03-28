import { Search } from "lucide-react";

const DevicesFilters = ({ searchTerm, setSearchTerm, filters, setFilters }) => (
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={filters.device_condition}
          onChange={(e) =>
            setFilters({ ...filters, device_condition: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Kondisi</option>
          <option value="BAIK">Baik</option>
          <option value="RUSAK">Rusak</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        <select
          value={filters.device_status}
          onChange={(e) =>
            setFilters({ ...filters, device_status: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="TERSEDIA">Tersedia</option>
          <option value="DIPINJAM">Dipinjam</option>
        </select>
      </div>
    </div>
  </div>
);

export default DevicesFilters;
