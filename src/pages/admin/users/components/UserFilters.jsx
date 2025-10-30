const UserFilters = ({ filters, setFilters }) => {
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
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="border rounded-lg p-2"
        >
          <option value="">Semua</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;
