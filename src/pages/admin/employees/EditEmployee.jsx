import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import apiClient from '../../../services/api';
import toast from 'react-hot-toast';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', nip: '', jabatan: '' });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await apiClient.get(`/employees/${id}`);
      setForm(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal memuat data pegawai');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/employees/${id}`, form);
      toast.success('Pegawai berhasil diperbarui');
      navigate('/admin/employees');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal memperbarui pegawai');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
        <h1 className="text-2xl font-bold">Edit Pegawai</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">NIP</label>
          <input
            type="text"
            value={form.nip}
            onChange={(e) => setForm({ ...form, nip: e.target.value })}
            required
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jabatan</label>
          <input
            type="text"
            value={form.jabatan}
            onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
            required
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
