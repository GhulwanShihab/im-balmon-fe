import { useState, useEffect } from "react";
import apiClient from "../../services/api";

const ConditionChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
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
      await apiClient.post(
        `/loans/condition-change/${selectedRequestId}/reject`,
        null,
        {
          params: { reason: rejectReason },
        }
      );
      alert("Berhasil menolak!");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRequestId(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Gagal menolak.");
    }
  };

  const filteredRequests =
    filterStatus === "ALL"
      ? requests
      : requests.filter((req) => req.status === filterStatus);

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      APPROVED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
    };
    return badges[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getConditionBadge = (condition) => {
    const badges = {
      BAIK: "bg-green-50 text-green-700 border-green-200",
      RUSAK: "bg-red-50 text-red-700 border-red-200",
      HILANG: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      badges[condition?.toUpperCase()] ||
      "bg-blue-50 text-blue-700 border-blue-200"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Permintaan Perubahan Kondisi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola permintaan perubahan kondisi perangkat
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-gray-500">Memuat data...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-500 font-medium">
                Tidak ada permintaan perubahan kondisi
              </p>
              <p className="text-sm text-gray-400">
                {filterStatus !== "ALL" && `dengan status ${filterStatus}`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {[
                        "Perangkat",
                        "User",
                        "Kondisi Lama",
                        "Kondisi Baru",
                        "Alasan",
                        "Status",
                        "Aksi",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
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
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(
                              req.old_condition
                            )}`}
                          >
                            {req.old_condition}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(
                              req.new_condition
                            )}`}
                          >
                            {req.new_condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-gray-700 truncate">
                            {req.reason || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {req.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="px-4 py-2 text-xs font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequestId(req.id);
                                    setShowRejectModal(true);
                                  }}
                                  className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                Selesai
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
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
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Condition Change */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          Kondisi Lama:
                        </span>
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(
                            req.old_condition
                          )}`}
                        >
                          {req.old_condition}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          Kondisi Baru:
                        </span>
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getConditionBadge(
                            req.new_condition
                          )}`}
                        >
                          {req.new_condition}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {req.reason && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">
                          Alasan:
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {req.reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {req.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(req.id)}
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL PENOLAKAN */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 space-y-5 animate-slideUp">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Alasan Penolakan
                </h2>
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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

export default ConditionChangeRequests;