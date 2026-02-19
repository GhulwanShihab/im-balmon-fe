import DevicesRow from "./DevicesRow";
import { ImageOff } from "lucide-react";

const DevicesTable = ({ loading, devices, navigate, onDelete, onGenerateQR }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {loading ? (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    ) : devices.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ImageOff className="w-12 h-12 mb-3" />
        <p className="text-lg font-medium text-gray-500">Tidak ada data perangkat</p>
        <p className="text-sm text-gray-400">Perangkat yang ditambahkan akan muncul di sini</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Perangkat",
                "Kode / NUP",
                "Brand",
                "Kondisi",
                "Status",
                "Lokasi",
                "Aksi",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {devices.map((device) => (
              <DevicesRow
                key={device.id}
                device={device}
                navigate={navigate}
                onDelete={onDelete}
                onGenerateQR={onGenerateQR}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default DevicesTable;
