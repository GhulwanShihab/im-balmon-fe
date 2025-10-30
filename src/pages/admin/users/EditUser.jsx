import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "./services/userService";
import UserForm from "./components/UserForm";
import toast from "react-hot-toast";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch {
        toast.error("Gagal memuat data pengguna");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      // Jika password kosong, hapus field-nya agar tidak dikirim
      const dataToSend = { ...formData };
      if (!formData.password) delete dataToSend.password;

      await updateUser(id, dataToSend);
      toast.success("Pengguna berhasil diperbarui");
      navigate("/admin/users");
    } catch {
      toast.error("Gagal memperbarui pengguna");
    }
  };

  if (!user) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Pengguna</h1>
      <UserForm initialData={user} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditUser;
