import { useState } from "react";

const UserForm = ({ onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    email: initialData.email || "",
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
    password: "",
    is_active: initialData.is_active ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* First Name */}
      <div>
        <label className="block mb-1 font-medium">First Name</label>
        <input
          type="text"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block mb-1 font-medium">Last Name</label>
        <input
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Active status */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
        />
        <label>Active</label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Simpan
      </button>
    </form>
  );
};

export default UserForm;
