import { Eye, Edit2, Trash2, QrCode, ChevronDown, ChevronRight, ImageOff, MapPin, DoorOpen } from "lucide-react";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DevicePhoto = ({ photosUrl, name, size = "md" }) => {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: "w-8 h-8 min-w-[32px]",
    md: "w-10 h-10 min-w-[40px]",
  };

  const firstPhoto =
    Array.isArray(photosUrl) && photosUrl.length > 0 ? photosUrl[0] : null;

  if (!firstPhoto || imgError) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gray-100 flex items-center justify-center`}>
        <ImageOff className="w-4 h-4 text-gray-300" />
      </div>
    );
  }

  const photoSrc = firstPhoto.startsWith("http")
    ? firstPhoto
    : `${API_BASE}${firstPhoto}`;

  return (
    <img
      src={photoSrc}
      alt={name}
      className={`${sizeClasses[size]} rounded-lg object-cover border border-gray-200`}
      onError={() => setImgError(true)}
    />
  );
};

const ConditionBadge = ({ condition }) => {
  const c = condition?.toUpperCase();
  const styles = {
    BAIK: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    RUSAK: "bg-red-50 text-red-700 ring-red-600/20",
    MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
  const labels = { BAIK: "Baik", RUSAK: "Rusak", MAINTENANCE: "Maintenance" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${styles[c] || "bg-gray-50 text-gray-600 ring-gray-500/10"}`}>
      {labels[c] || condition || "-"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    TERSEDIA: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    DIPINJAM: "bg-blue-50 text-blue-700 ring-blue-600/20",
    MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-600/20",
    NONAKTIF: "bg-gray-100 text-gray-600 ring-gray-500/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${styles[status] || "bg-gray-50 text-gray-600 ring-gray-500/10"}`}>
      {status || "-"}
    </span>
  );
};

const ActionButtons = ({ onView, onEdit, onDelete, onQR }) => (
  <div className="flex items-center justify-end space-x-1">
    <button onClick={onQR} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition" title="QR Code">
      <QrCode className="w-4 h-4" />
    </button>
    <button onClick={onView} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition" title="Lihat">
      <Eye className="w-4 h-4" />
    </button>
    <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit">
      <Edit2 className="w-4 h-4" />
    </button>
    <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Hapus">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const DevicesRow = ({ device, navigate, onDelete, onGenerateQR }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Array.isArray(device.children) && device.children.length > 0;

  return (
    <>
      {/* PARENT ROW */}
      <tr className={`hover:bg-gray-50 transition-colors ${hasChildren ? "bg-slate-50/50" : ""}`}>
        {/* Perangkat — Photo + Name */}
        <td className="px-4 py-3">
          <div className="flex items-center space-x-3">
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-0.5 text-gray-400 hover:text-gray-700 transition"
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <DevicePhoto photosUrl={device.photos_url} name={device.device_name} />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {device.device_name}
              </div>
              {hasChildren ? (
                <div className="text-xs text-emerald-600 font-medium">
                  {device.children.length} perangkat anak
                </div>
              ) : (
                <div className="text-xs text-gray-400">{device.device_type || "-"}</div>
              )}
            </div>
          </div>
        </td>

        {!hasChildren ? (
          <>
            {/* Kode / NUP */}
            <td className="px-4 py-3">
              <div className="text-sm font-mono text-gray-900">{device.device_code}</div>
              <div className="text-xs text-gray-400">NUP: {device.nup_device}</div>
            </td>
            {/* Brand */}
            <td className="px-4 py-3 text-sm text-gray-700">
              {device.bmn_brand || device.sample_brand || "-"}
            </td>
            {/* Kondisi */}
            <td className="px-4 py-3">
              <ConditionBadge condition={device.device_condition} />
            </td>
            {/* Status */}
            <td className="px-4 py-3">
              <StatusBadge status={device.device_status} />
            </td>
            {/* Lokasi */}
            <td className="px-4 py-3">
              <div className="space-y-0.5">
                {device.device_station && (
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    {device.device_station}
                  </div>
                )}
                {device.device_room && (
                  <div className="flex items-center text-xs text-gray-600">
                    <DoorOpen className="w-3 h-3 mr-1 text-gray-400" />
                    {device.device_room}
                  </div>
                )}
                {!device.device_station && !device.device_room && (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </div>
            </td>
            {/* Aksi */}
            <td className="px-4 py-3">
              <ActionButtons
                onQR={() => onGenerateQR(device)}
                onView={() => navigate(`/admin/devices/${device.id}/view`)}
                onEdit={() => navigate(`/admin/devices/${device.id}/edit`)}
                onDelete={() => onDelete(device.id, false)}
              />
            </td>
          </>
        ) : (
          /* Collapsed parent — span empty cells */
          <td colSpan={6}></td>
        )}
      </tr>

      {/* CHILDREN ROWS */}
      {hasChildren && expanded && device.children.map((child) => (
        <tr key={child.id} className="hover:bg-blue-50/30 bg-slate-50 transition-colors border-l-2 border-emerald-300">
          {/* Perangkat — Photo + Name (indented) */}
          <td className="px-4 py-2.5">
            <div className="flex items-center space-x-3 ml-6">
              <DevicePhoto photosUrl={child.photos_url} name={child.device_name} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {child.device_name}
                </div>
                <div className="text-xs text-gray-400">{child.device_type || "-"}</div>
              </div>
            </div>
          </td>
          {/* Kode / NUP */}
          <td className="px-4 py-2.5">
            <div className="text-sm font-mono text-gray-700">{child.device_code}</div>
            <div className="text-xs text-gray-400">NUP: {child.nup_device}</div>
          </td>
          {/* Brand */}
          <td className="px-4 py-2.5 text-sm text-gray-600">
            {child.bmn_brand || child.sample_brand || "-"}
          </td>
          {/* Kondisi */}
          <td className="px-4 py-2.5">
            <ConditionBadge condition={child.device_condition} />
          </td>
          {/* Status */}
          <td className="px-4 py-2.5">
            <StatusBadge status={child.device_status} />
          </td>
          {/* Lokasi */}
          <td className="px-4 py-2.5">
            <div className="space-y-0.5">
              {child.device_station && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                  {child.device_station}
                </div>
              )}
              {child.device_room && (
                <div className="flex items-center text-xs text-gray-500">
                  <DoorOpen className="w-3 h-3 mr-1 text-gray-400" />
                  {child.device_room}
                </div>
              )}
              {!child.device_station && !child.device_room && (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          </td>
          {/* Aksi */}
          <td className="px-4 py-2.5">
            <ActionButtons
              onQR={() => onGenerateQR(child)}
              onView={() => navigate(`/admin/devices/${child.id}/view-child`)}
              onEdit={() => navigate(`/admin/devices/${child.id}/edit-child`)}
              onDelete={() => onDelete(child.id, true)}
            />
          </td>
        </tr>
      ))}
    </>
  );
};

export default DevicesRow;
