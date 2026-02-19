import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, AlertTriangle, Clock, Package, ImageIcon } from "lucide-react";
import apiClient from "../../services/api";
import { getMediaUrl } from "../../config/api";
import toast from "react-hot-toast";

const ManagerConditionApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/loans/condition-change-requests");
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching condition change requests:", error);
      toast.error("Gagal memuat data permintaan perubahan kondisi.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, deviceName) => {
    if (!window.confirm(`Yakin menyetujui perubahan kondisi ${deviceName}?`)) return;

    try {
      await apiClient.post(`/loans/condition-change/${requestId}/approve`);
      toast.success("Perubahan kondisi berhasil disetujui");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Gagal menyetujui perubahan kondisi");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi!");
      return;
    }

    try {
      await apiClient.post(`/loans/condition-change/${selectedRequestId}/reject`, null, {
        params: { reason: rejectReason },
      });
      toast.success("Perubahan kondisi berhasil ditolak");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRequestId(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Gagal menolak perubahan kondisi");
    }
  };

  const filteredRequests = filterStatus === "ALL" 
    ? requests 
    : requests.filter((req) => req.status === filterStatus);

  const getConditionBadge = (condition) => {
    const badges = {
      'BAIK': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Baik' },
      'RUSAK': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rusak' },
      'MAINTENANCE': { color: 'bg-sky-100 text-sky-800 border-sky-200', label: 'Maintenance' },
    };
    return badges[condition?.toUpperCase()] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: condition || '-' };
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Menunggu', icon: Clock },
      'APPROVED': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Disetujui', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Ditolak', icon: XCircle },
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status, icon: AlertTriangle };
  };

  const DetailModal = ({ request, isOpen, onClose }) => {
    if (!isOpen || !request) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl font-semibold text-gray-900">Detail Permintaan Perubahan Kondisi</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Perangkat</label>
                <div className="mt-1 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-900 font-semibold">{request.device_name}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diminta Oleh</label>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600">
                      {request.requested_by_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{request.requested_by_name}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kondisi Lama</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(request.old_condition).color}`}>
                    {getConditionBadge(request.old_condition).label}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kondisi Baru</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(request.new_condition).color}`}>
                    {getConditionBadge(request.new_condition).label}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alasan Perubahan</label>
                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                  {request.reason || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Foto Bukti
                </label>
                {request.evidence_photo_url ? (
                  <img
                    src={getMediaUrl(request.evidence_photo_url)}
                    alt="Foto bukti"
                    className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setImageModalUrl(getMediaUrl(request.evidence_photo_url));
                      setShowImageModal(true);
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-400 mt-1">-</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Pengajuan</label>
                <p className="text-sm text-gray-900 mt-1">
                  {request.requested_at ? new Date(request.requested_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  {(() => {
                    const StatusBadge = getStatusBadge(request.status);
                    return (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${StatusBadge.color}`}>
                        <StatusBadge.icon className="w-3 h-3" />
                        {StatusBadge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Tutup
            </button>
            {request.status === 'PENDING' && (
              <>
                <button
                  onClick={() => {
                    setSelectedRequestId(request.id);
                    setShowRejectModal(true);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak
                </button>
                <button
                  onClick={() => {
                    handleApprove(request.id, request.device_name);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Setujui
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Persetujuan Perubahan Kondisi</h1>
          <p className="text-gray-600 mt-1">
            Setujui atau tolak permintaan perubahan kondisi perangkat
          </p>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {requests.filter((r) => r.status === "PENDING").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {requests.filter((r) => r.status === "APPROVED").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {requests.filter((r) => r.status === "REJECTED").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <CheckCircle className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 font-medium">
              Tidak ada permintaan perubahan kondisi
            </p>
            {filterStatus !== "ALL" && (
              <p className="text-sm text-gray-400">
                dengan status {filterStatus}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Perangkat", "User", "Kondisi Lama", "Kondisi Baru", "Alasan", "Foto Bukti", "Status", "Aksi"].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((req) => {
                    const StatusBadge = getStatusBadge(req.status);
                    return (
                      <tr key={req.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {req.device_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-purple-600">
                                {req.requested_by_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">
                              {req.requested_by_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(req.old_condition).color}`}>
                            {getConditionBadge(req.old_condition).label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(req.new_condition).color}`}>
                            {getConditionBadge(req.new_condition).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-gray-700 truncate" title={req.reason}>
                            {req.reason || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {req.evidence_photo_url ? (
                            <img
                              src={getMediaUrl(req.evidence_photo_url)}
                              alt="Foto bukti"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                setImageModalUrl(getMediaUrl(req.evidence_photo_url));
                                setShowImageModal(true);
                              }}
                            />
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${StatusBadge.color}`}>
                            <StatusBadge.icon className="w-3 h-3" />
                            {StatusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {req.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id, req.device_name)}
                                  className="px-4 py-2 text-xs font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequestId(req.id);
                                    setShowRejectModal(true);
                                  }}
                                  className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredRequests.map((req) => {
                const StatusBadge = getStatusBadge(req.status);
                return (
                  <div key={req.id} className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {req.device_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {req.requested_by_name}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${StatusBadge.color}`}>
                        <StatusBadge.icon className="w-3 h-3" />
                        {StatusBadge.label}
                      </span>
                    </div>

                    {/* Condition Change */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Kondisi Lama:</span>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(req.old_condition).color}`}>
                          {getConditionBadge(req.old_condition).label}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Kondisi Baru:</span>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(req.new_condition).color}`}>
                          {getConditionBadge(req.new_condition).label}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {req.reason && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">Alasan:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {req.reason}
                        </p>
                      </div>
                    )}

                    {/* Evidence Photo */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">Foto Bukti:</p>
                      {req.evidence_photo_url ? (
                        <img
                          src={getMediaUrl(req.evidence_photo_url)}
                          alt="Foto bukti"
                          className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setImageModalUrl(getMediaUrl(req.evidence_photo_url));
                            setShowImageModal(true);
                          }}
                        />
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>
                      {req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id, req.device_name)}
                            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequestId(req.id);
                              setShowRejectModal(true);
                            }}
                            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL PENOLAKAN */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 space-y-5 animate-slideUp">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Alasan Penolakan</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Berikan alasan penolakan permintaan ini
                </p>
              </div>
            </div>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Kondisi perangkat masih dalam keadaan baik berdasarkan inspeksi terakhir..."
            ></textarea>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequestId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rejectReason.trim()}
              >
                Submit Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        request={selectedRequest}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequest(null);
        }}
      />

      {/* IMAGE LIGHTBOX MODAL */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60] animate-fadeIn cursor-pointer"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] animate-slideUp">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              ✕
            </button>
            <img
              src={imageModalUrl}
              alt="Foto bukti (fullscreen)"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManagerConditionApprovals;