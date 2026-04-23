import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Edit, Eye } from "lucide-react";
import { getRoles, updateUserRole } from "../services/userService";
import toast from "react-hot-toast";

const UserTable = ({ users, onDelete, loading }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
      }
    };
    fetchRoles();
  }, []);

  const handleChangeRole = async (userId, roleId) => {
    try {
      await updateUserRole(userId, { role_ids: [parseInt(roleId)] });
      toast.success("Role berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal mengubah role");
    }
  };

  if (loading) return <p>Memuat data pengguna...</p>;
  if (users.length === 0) return <p>Tidak ada pengguna ditemukan.</p>;

  return (
    <div className="bg-white shadow-md rounded-xl overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Nama</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{u.first_name} {u.last_name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {/* Display current role name */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role_names?.[0] === 'superadmin'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role_names?.[0] === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : u.role_names?.[0] === 'manager' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {u.role_names?.[0] || 'No Role'}
                  </span>
                  {/* Select for changing role */}
                  <select
                    value={roles.find(r => r.name === u.role_names?.[0])?.id || ""}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    className="border rounded p-1 text-xs"
                  >
                    <option value="">Ubah</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="p-3 text-center space-x-2">
                <Link
                  to={`/admin/users/${u.uuid}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={18} />
                </Link>
                <Link
                  to={`/admin/users/edit/${u.uuid}`}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => onDelete(u.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;