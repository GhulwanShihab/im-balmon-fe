import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, AlertTriangle, Clock } from "lucide-react";
import apiClient from "../../../services/api";
import toast from "react-hot-toast";

const ManagerConditionApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Gagal menolak perubahan kondisi");
    }
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'baik': { color: 'bg-green-100 text-green-800', label: 'Baik' },
      'rusak_ringan': { color: 'bg-yellow-100 text-yellow-800', label: 'Rusak Ringan' },
      'rusak_berat': { color: 'bg-red-100 text-red-800', label: 'Rusak Berat' },
      'hilang': { color: 'bg-gray-100 text-gray-800', label: 'Hilang' },
    };
    return badges[condition] || { color: 'bg-gray-100 text-gray-800', label: condition };
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu', icon: Clock },
      'APPROVED': { color: 'bg-green-100 text-green-800', label: 'Disetujui', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800', label: 'Ditolak', icon: XCircle },
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: AlertTriangle };
  };

  const DetailModal = ({ request, isOpen, onClose }) => {
    if (!isOpen || !request) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl font-semibold text-gray-900">Detail Permintaan Perubahan Kondisi</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Perangkat</label>
                <p className="text-sm text-gray-900 mt-1 font-semibold">{request.device_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diminta Oleh</label>
                <p className="text-sm text-gray-900 mt-1">{request.requested_by_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kondisi Lama</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(request.old_condition).color}`}>
                    {getConditionBadge(request.old_condition).label}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kondisi Baru</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(request.new_condition).color}`}>
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
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status).color}`}>
                    {React.createElement(getStatusBadge(request.status).icon, { className: "w-3 h-3" })}
                    {getStatusBadge(request.status).label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak
                </button>
                <button
                  onClick={() => {
                    handleApprove(request.id, request.device_name);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Persetujuan Perubahan Kondisi</h1>
        <p className="text-gray-600 mt-1">
          Setujui atau tolak permintaan perubahan kondisi perangkat
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <CheckCircle className="w-12 h-12 mb-2 text-gray-400" />
            <p>Tidak ada permintaan perubahan kondisi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {["Perangkat", "User", "Kondisi Lama", "Kondisi Baru", "Alasan", "Status", "Aksi"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => {
                  const StatusBadge = getStatusBadge(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-green-50 transition">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {req.device_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {req.requested_by_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(req.old_condition).color}`}>
                          {getConditionBadge(req.old_condition).label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadge(req.new_condition).color}`}>
                          {getConditionBadge(req.new_condition).label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={req.reason}>
                        {req.reason || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${StatusBadge.color}`}>
                          {React.createElement(StatusBadge.icon, { className: "w-3 h-3" })}
                          {StatusBadge.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id, req.device_name)}
                                className="px-3 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedRequestId(req.id);
                                  setShowRejectModal(true);
                                }}
                                className="px-3 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
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
        )}
      </div>

      {/* MODAL PENOLAKAN */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Alasan Penolakan</h2>
                <p className="text-sm text-gray-500">Jelaskan mengapa perubahan kondisi ditolak</p>
              </div>
            </div>
            <textarea
              className="w-full border rounded p-3 focus:ring-2 focus:ring-red-300 focus:border-transparent"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tuliskan alasan penolakan di sini..."
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Submit
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
    </div>
  );
};

export default ManagerConditionApprovals;