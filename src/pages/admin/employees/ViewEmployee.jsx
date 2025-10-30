import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../../../services/api';

const ViewEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await apiClient.get(`/employees/${id}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal memuat data pegawai.');
    }
  };

  if (!employee) return <div className="text-center mt-20">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detail Pegawai</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Nama</h2>
          <p className="text-gray-700">{employee.nama}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">NIP</h2>
          <p className="text-gray-700">{employee.nip}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Jabatan</h2>
          <p className="text-gray-700">{employee.jabatan}</p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => navigate(`/admin/employees/${employee.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Pegawai
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
