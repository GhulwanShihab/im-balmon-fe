import { Package, ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../config/api';

/**
 * DeviceImage Component
 * Menampilkan gambar perangkat dengan fallback icon
 * 
 * @param {Object} props
 * @param {string[]} props.photos - Array URL foto perangkat
 * @param {string} props.name - Nama perangkat (untuk alt text)
 * @param {'xs' | 'sm' | 'md' | 'lg'} props.size - Ukuran gambar
 * @param {string} props.className - Class tambahan
 */
const DeviceImage = ({ 
  photos = [], 
  name = 'Device', 
  size = 'md',
  className = '' 
}) => {
  const hasPhoto = photos && photos.length > 0 && photos[0];
  
  // Size configurations - responsive
  const sizeConfig = {
    xs: {
      container: 'w-10 h-10 sm:w-12 sm:h-12',
      icon: 'w-4 h-4 sm:w-5 sm:h-5',
      rounded: 'rounded-lg'
    },
    sm: {
      container: 'w-12 h-12 sm:w-14 sm:h-14',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      rounded: 'rounded-lg'
    },
    md: {
      container: 'w-14 h-14 sm:w-16 sm:h-16',
      icon: 'w-6 h-6 sm:w-7 sm:h-7',
      rounded: 'rounded-xl'
    },
    lg: {
      container: 'w-16 h-16 sm:w-20 sm:h-20',
      icon: 'w-7 h-7 sm:w-8 sm:h-8',
      rounded: 'rounded-xl'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  if (hasPhoto) {
    // Use getMediaUrl to construct full URL from relative path
    const imageUrl = getMediaUrl(photos[0]);
    
    return (
      <div 
        className={`${config.container} ${config.rounded} overflow-hidden flex-shrink-0 bg-gray-100 ${className}`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            // Fallback jika gambar gagal load
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('fallback-active');
          }}
        />
        {/* Fallback icon jika image error */}
        <div className="fallback-icon hidden w-full h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
          <Package className={`${config.icon} text-blue-500`} />
        </div>
      </div>
    );
  }

  // Placeholder jika tidak ada foto
  return (
    <div 
      className={`${config.container} ${config.rounded} flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
    >
      <Package className={`${config.icon} text-gray-400`} />
    </div>
  );
};

export default DeviceImage;
