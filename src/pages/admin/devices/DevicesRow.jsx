import { Eye, Edit2, Trash2, QrCode, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const DevicesRow = ({ device, navigate, onDelete, onGenerateQR }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Array.isArray(device.children) && device.children.length > 0;

  return (
    <>
      {/* ROW UTAMA */}
      <tr
        className={`hover:bg-gray-50 ${hasChildren ? "bg-gray-100" : ""}`}
      >
        <td className="px-4 py-4">
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 hover:text-gray-700 transition"
                title={expanded ? "Sembunyikan anak perangkat" : "Tampilkan anak perangkat"}
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {device.device_name}
              </div>
              {hasChildren ? (
                <div className="text-xs text-gray-500 italic">
                  {device.children.length} perangkat anak
                </div>
              ) : (
                <div className="text-sm text-gray-500">{device.device_type}</div>
              )}
            </div>
          </div>
        </td>

        {/* Kolom tambahan hanya jika TIDAK punya anak */}
        {!hasChildren && (
          <>
            <td className="px-4 py-4">
              <div className="text-sm text-gray-900">{device.device_code}</div>
              <div className="text-sm text-gray-500">{device.nup_device}</div>
            </td>
            <td className="px-4 py-4 text-sm text-gray-900">
              {device.bmn_brand || device.sample_brand}
            </td>
            <td className="px-4 py-4">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  device.device_condition === "baik"
                    ? "bg-green-100 text-green-800"
                    : device.device_condition === "rusak_ringan"
                    ? "bg-yellow-100 text-yellow-800"
                    : device.device_condition === "hilang"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {device.device_condition === "baik"
                  ? "Baik"
                  : device.device_condition === "rusak_ringan"
                  ? "Rusak Ringan"
                  : device.device_condition === "rusak_berat"
                  ? "Rusak Berat"
                  : device.device_condition === "hilang"
                  ? "Hilang"
                  : device.device_condition}
              </span>
            </td>
            <td className="px-4 py-4">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  device.device_status === "TERSEDIA"
                    ? "bg-green-100 text-green-800"
                    : device.device_status === "DIPINJAM"
                    ? "bg-blue-100 text-blue-800"
                    : device.device_status === "MAINTENANCE"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {device.device_status}
              </span>
            </td>
            <td className="px-4 py-4 text-sm text-gray-900">
              {device.device_room || "-"}
            </td>
            <td className="px-4 py-4 text-right">
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => onGenerateQR(device)}
                  className="p-1 text-purple-600 hover:text-purple-800"
                  title="Generate QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/admin/devices/${device.id}/view`)}
                  className="p-1 text-green-600 hover:text-green-800"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/admin/devices/${device.id}/edit`)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(device.id, false)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </>
        )}
      </tr>

      {/* ROW ANAK */}
      {hasChildren && expanded && (
        <tr className="transition-all duration-300 ease-in-out">
          <td colSpan="7" className="p-0 bg-gray-50">
            <div className="overflow-hidden transition-all duration-300 ease-in-out">
              <table className="min-w-full border-t border-gray-200">
                <tbody>
                  {device.children.map((child) => (
                    <tr
                      key={child.id}
                      className="hover:bg-gray-100 border-b last:border-none bg-gray-50"
                    >
                      <td className="px-10 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {child.device_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {child.device_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {child.device_code}
                        <div className="text-xs text-gray-500">{child.nup_device}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {child.bmn_brand || child.sample_brand}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            child.device_condition === "baik"
                              ? "bg-green-100 text-green-800"
                              : child.device_condition === "rusak_ringan"
                              ? "bg-yellow-100 text-yellow-800"
                              : child.device_condition === "hilang"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {child.device_condition}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            child.device_status === "TERSEDIA"
                              ? "bg-green-100 text-green-800"
                              : child.device_status === "DIPINJAM"
                              ? "bg-blue-100 text-blue-800"
                              : child.device_status === "MAINTENANCE"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {child.device_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {child.device_room || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onGenerateQR(child)}
                            className="p-1 text-purple-600 hover:text-purple-800"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/devices/${child.id}/view-child`)
                            }
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/devices/${child.id}/edit-child`)
                            }
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(child.id, true)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default DevicesRow;
