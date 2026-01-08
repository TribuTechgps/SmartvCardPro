import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Trash2, Download, Eye, X, Calendar, Tag, Loader } from 'lucide-react';
import apiService from '../lib/apiService';

const ImageGallery = ({ refreshTrigger }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchImages = async () => {
    if (!apiService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.getAllImages();

      // Filtrar solo las imágenes del usuario actual
      const userEmail = apiService.getUserEmail();
      const userImages = data.filter(img => img.user_email === userEmail);

      setImages(userImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente');
        apiService.clearCredentials();
        window.location.href = '/auth';
      } else {
        toast.error('Error al cargar las imágenes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleDelete = async (imageId, imageTitle) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${imageTitle}"?`)) {
      return;
    }

    if (!apiService.isAuthenticated()) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      await apiService.deleteImage(imageId);

      toast.success('Imagen eliminada correctamente');
      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const handleDownload = (imageUrl, imageTitle) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageTitle;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="luxury-card rounded-lg p-12 text-center shine-effect">
        <Loader className="w-12 h-12 text-fucsia-300 mx-auto mb-4 animate-spin" />
        <p className="text-chocolate-200">Cargando imágenes...</p>
      </div>
    );
  }

  return (
    <>
      <div className="luxury-card rounded-lg shine-effect">
        <div className="px-6 py-4 border-b border-borde bg-gradient-to-r from-chocolate-600 to-carbon-600">
          <h2 className="text-lg font-semibold text-texto">Mis Imágenes</h2>
          <p className="text-sm text-chocolate-200 mt-1">
            {images.length} {images.length === 1 ? 'imagen guardada' : 'imágenes guardadas'}
          </p>
        </div>

        {images.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-carbon-600/50 rounded-full flex items-center justify-center mb-4 shadow-luxury">
              <ImageIcon className="w-12 h-12 text-chocolate-300" />
            </div>
            <h3 className="text-lg font-medium text-texto mb-2">
              No tienes imágenes aún
            </h3>
            <p className="text-chocolate-200">
              Sube tu primera imagen para empezar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="luxury-card rounded-lg overflow-hidden hover:shadow-glow-fucsia transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-carbon-700">
                  <img
                    src={image.image}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon-800/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewImage(image)}
                        className="p-2 bg-turquesa-500/20 text-turquesa-300 rounded-lg hover:bg-turquesa-500/30 transition-colors"
                        title="Ver imagen"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownload(image.image, image.title)}
                        className="p-2 bg-fucsia-500/20 text-fucsia-300 rounded-lg hover:bg-fucsia-500/30 transition-colors"
                        title="Descargar"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id, image.title)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-texto font-semibold mb-1 truncate">
                    {image.title}
                  </h3>
                  <p className="text-sm text-chocolate-200 mb-3 line-clamp-2">
                    {image.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-chocolate-300">
                    <div className="flex items-center space-x-1">
                      <Tag size={14} />
                      <span>{image.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(image.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded ${image.is_public ? 'bg-turquesa-500/20 text-turquesa-300' : 'bg-carbon-600 text-chocolate-300'}`}>
                      {image.is_public ? 'Pública' : 'Privada'}
                    </span>
                    <span className="text-chocolate-300">
                      {(image.file_size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Vista Previa */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="luxury-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-chocolate-600 to-carbon-600 px-6 py-4 border-b border-borde z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-texto">{selectedImage.title}</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-chocolate-200 hover:text-texto hover:bg-carbon-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Image */}
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full h-auto"
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Descripción</h4>
                  <p className="text-texto">{selectedImage.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Categoría</h4>
                    <p className="text-texto">{selectedImage.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Tipo</h4>
                    <p className="text-texto">{selectedImage.image_type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Tamaño</h4>
                    <p className="text-texto">{(selectedImage.file_size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Visibilidad</h4>
                    <p className="text-texto">{selectedImage.is_public ? 'Pública' : 'Privada'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Creada</h4>
                    <p className="text-texto">
                      {new Date(selectedImage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-chocolate-200 mb-1">Actualizada</h4>
                    <p className="text-texto">
                      {new Date(selectedImage.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleDownload(selectedImage.image, selectedImage.title)}
                    className="flex-1 bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all"
                  >
                    <Download size={18} />
                    <span>Descargar</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedImage.id, selectedImage.title);
                      handleCloseModal();
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
