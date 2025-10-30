import { useState, useEffect } from "react";
import apiClient from "../../services/api";

const ConditionChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

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
      alert("Gagal memuat data permintaan perubahan kondisi.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm("Yakin menyetujui perubahan kondisi ini?")) return;

    try {
      await apiClient.post(`/loans/condition-change/${requestId}/approve`);
      alert("Berhasil disetujui");
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Gagal approve");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert("Alasan wajib diisi!");

    try {
      await apiClient.post(`/loans/condition-change/${selectedRequestId}/reject`, null, {
        params: { reason: rejectReason },
      });
      alert("Berhasil menolak!");
      setShowRejectModal(false);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Gagal menolak.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-700">Permintaan Perubahan Kondisi</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Tidak ada permintaan perubahan kondisi.</div>
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
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {req.device_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {req.requested_by_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.old_condition}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {req.new_condition}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.reason || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${
                            req.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : req.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-3 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRequestId(req.id);
                                setShowRejectModal(true);
                              }}
                              className="px-3 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PENOLAKAN */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Alasan Penolakan</h2>
            <textarea
              className="w-full border rounded p-2 focus:ring focus:ring-red-300"
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tuliskan alasan..."
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionChangeRequests;
