import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, X } from 'lucide-react';

const QRCodeGenerator = ({ device, isOpen, onClose }) => {
  const [qrCodeDataURL, setQRCodeDataURL] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && device) {
      generateQRCode();
    }
  }, [isOpen, device]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Create QR code data - you can customize this format
      const qrData = JSON.stringify({
        device_name: device.device_name,
        device_code: device.device_code,
        device_id: device.id,
        nup_device: device.nup_device,
        device_type: device.device_type,
        device_room: device.device_room,
        timestamp: new Date().toISOString()
      });

      const dataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQRCodeDataURL(dataURL);
    } catch (error) {
      alert('Gagal membuat QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `QR_${device.device_name}_${device.device_code}.png`;
      link.href = qrCodeDataURL;
      link.click();
    }
  };

  const printQRCode = () => {
    if (qrCodeDataURL) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${device.device_name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                margin: 20px;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #000;
                padding: 20px;
                margin: 20px;
              }
              .device-info {
                margin-bottom: 15px;
              }
              .device-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .device-code {
                font-size: 14px;
                color: #666;
              }
              img {
                display: block;
                margin: 10px auto;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="device-info">
                <div class="device-name">${device.device_name}</div>
                <div class="device-code">${device.device_code}</div>
              </div>
              <img src="${qrCodeDataURL}" alt="QR Code" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">QR Code Perangkat</h2>
                <p className="text-sm text-gray-600">Scan untuk identifikasi perangkat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Informasi Perangkat</h3>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Nama:</span> {device.device_name}</div>
              <div><span className="font-medium">Kode:</span> {device.device_code}</div>
              <div><span className="font-medium">NUP:</span> {device.nup_device}</div>
              {device.device_room && (
                <div><span className="font-medium">Ruangan:</span> {device.device_room}</div>
              )}
            </div>
          </div>

          <div className="text-center">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : qrCodeDataURL ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img 
                    src={qrCodeDataURL} 
                    alt="QR Code" 
                    className="mx-auto"
                    style={{ width: '250px', height: '250px' }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  QR Code berisi informasi perangkat untuk scanning
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">QR Code tidak dapat dibuat</p>
              </div>
            )}
          </div>

          {qrCodeDataURL && (
            <div className="flex space-x-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={printQRCode}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;