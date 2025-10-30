// 📁 pages/admin/users/pendingusers.jsx
import { useEffect, useState } from "react";
import { getPendingUsers, approveUser, rejectUser } from "./services/userService";
import toast from "react-hot-toast";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const data = await getPendingUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat pengguna pending");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Setujui pengguna ini?")) return;
    try {
      await approveUser(id);
      toast.success("Pengguna disetujui ✅");
      fetchPendingUsers();
    } catch (err) {
      toast.error("Gagal menyetujui pengguna");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Tolak pengguna ini?")) return;
    try {
      await rejectUser(id);
      toast.success("Pengguna ditolak ❌");
      fetchPendingUsers();
    } catch (err) {
      toast.error("Gagal menolak pengguna");
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Menunggu Persetujuan</h1>

      {loading ? (
        <p>Memuat pengguna...</p>
      ) : (
        <table className="w-full border-collapse border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Nama</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Tanggal Registrasi</th>
              <th className="border p-2 text-center w-48">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border p-2">{u.first_name} {u.last_name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Tidak ada pengguna pending.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingUsers;
