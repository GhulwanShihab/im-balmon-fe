import { useEffect, useState } from "react";
import { getRoles } from "../services/userService";

const UserFilters = ({ filters, setFilters }) => {
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

  return (
    <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl shadow-md">
      <div>
        <label className="block text-sm font-medium">Cari</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border rounded-lg p-2"
          placeholder="Nama / Email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Role</label>
        <select
          value={filters.role_id || ""}
          onChange={(e) => setFilters({ ...filters, role_id: e.target.value ? parseInt(e.target.value) : "" })}
          className="border rounded-lg p-2"
        >
          <option value="">Semua Role</option>
          {roles
            .filter((role) => role.name !== 'superadmin')
            .map((role) => (
            <option key={role.id} value={role.id}>
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          value={filters.is_active ?? ""}
          onChange={(e) => setFilters({ ...filters, is_active: e.target.value === "" ? "" : e.target.value === "true" })}
          className="border rounded-lg p-2"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;