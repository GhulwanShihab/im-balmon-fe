import UserForm from "./components/UserForm";
import { createUser } from "./services/userService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createUser(formData);
      toast.success("Pengguna berhasil dibuat");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Gagal menambahkan pengguna");
      console.error("Error creating user:", error.response?.data);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tambah Pengguna</h1>
      <UserForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddUser;
