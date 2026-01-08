import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import apiService from '../lib/apiService';

const ImageUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('logo-ai');
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    if (!title.trim()) {
      toast.error('Por favor ingresa un título para la imagen');
      return;
    }

    if (!apiService.isAuthenticated()) {
      toast.error('Debes iniciar sesión para subir imágenes');
      window.location.href = '/auth';
      return;
    }

    setLoading(true);

    try {
      // Convertir imagen a base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];

        const payload = {
          title: title.trim(),
          description: description.trim() || 'AI Generated Logo',
          image_base64: base64String,
          image_type: selectedFile.type.split('/')[1],
          category: category,
          is_public: isPublic,
          tags: []
        };

        try {
          const response = await apiService.createImage(payload);

          toast.success('¡Imagen subida correctamente!');

          // Limpiar formulario
          setSelectedFile(null);
          setPreview(null);
          setTitle('');
          setDescription('');
          setCategory('logo-ai');
          setIsPublic(true);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          // Notificar éxito
          if (onUploadSuccess) {
            onUploadSuccess(response);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          if (error.response?.status === 401) {
            toast.error('Sesión expirada. Por favor inicia sesión nuevamente');
            apiService.clearCredentials();
            window.location.href = '/auth';
          } else {
            toast.error(error.response?.data?.message || 'Error al subir la imagen');
          }
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="luxury-card rounded-lg p-6 shine-effect">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-fucsia-500/20 rounded-lg shadow-glow-fucsia">
          <Upload className="w-6 h-6 text-fucsia-300" />
        </div>
        <h3 className="ml-3 text-xl font-semibold text-texto">Subir Nueva Imagen</h3>
      </div>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-chocolate-200 mb-2">
            Seleccionar Imagen
          </label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-borde rounded-lg cursor-pointer hover:border-fucsia-500 transition-colors bg-carbon-600/30"
            >
              <ImageIcon className="w-5 h-5 text-chocolate-200 mr-2" />
              <span className="text-chocolate-200">
                {selectedFile ? selectedFile.name : 'Haz clic para seleccionar'}
              </span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-chocolate-200 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Logo de mi empresa"
            className="w-full px-4 py-2 bg-carbon-600/50 border border-borde rounded-lg text-texto placeholder-chocolate-300 focus:outline-none focus:border-fucsia-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-chocolate-200 mb-2">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción de la imagen (opcional)"
            rows="3"
            className="w-full px-4 py-2 bg-carbon-600/50 border border-borde rounded-lg text-texto placeholder-chocolate-300 focus:outline-none focus:border-fucsia-500 transition-colors resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-chocolate-200 mb-2">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-carbon-600/50 border border-borde rounded-lg text-texto focus:outline-none focus:border-fucsia-500 transition-colors"
          >
            <option value="logo-ai">Logo AI</option>
            <option value="profile">Perfil</option>
            <option value="banner">Banner</option>
            <option value="product">Producto</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Public/Private */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-fucsia-500 bg-carbon-600 border-borde rounded focus:ring-fucsia-500"
          />
          <label htmlFor="is-public" className="ml-2 text-sm text-chocolate-200">
            Hacer imagen pública
          </label>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile || !title.trim()}
          className="w-full bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-glow-fucsia shine-effect disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span>Subir Imagen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
