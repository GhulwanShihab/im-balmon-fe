import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserById } from "./services/userService";
import toast from "react-hot-toast";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch {
        toast.error("Gagal memuat detail pengguna");
      }
    };
    fetchDetail();
  }, [id]);

  if (!user) return <p className="p-6">Memuat...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Detail Pengguna</h1>

      <div className="bg-white shadow-md rounded-xl p-4 space-y-2">
        <p><strong>Nama:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Status:</strong> {user.is_active ? "Aktif" : "Nonaktif"}</p>
        <p><strong>Dibuat:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>

      <Link
        to="/admin/users"
        className="inline-block mt-4 text-blue-600 hover:underline"
      >
        ← Kembali ke daftar
      </Link>
    </div>
  );
};

export default UserDetail;
