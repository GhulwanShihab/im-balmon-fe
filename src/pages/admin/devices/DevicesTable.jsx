import DevicesRow from "./DevicesRow";

const DevicesTable = ({ loading, devices, navigate, onDelete, onGenerateQR }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {loading ? (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ) : devices.length === 0 ? (
      <div className="text-center text-gray-500 py-10">Tidak ada data perangkat.</div>
    ) : (
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
