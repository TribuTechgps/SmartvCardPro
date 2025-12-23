import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Copy, 
  Share2, 
  QrCode,
  ChevronLeft,
  Smartphone,
  Upload,
  X
} from 'lucide-react';
import useCardStore from '../store/cardStore';
import toast from 'react-hot-toast';

const QRGenerator = () => {
  const navigate = useNavigate();
  const { cards, currentCard, setCurrentCard } = useCardStore();
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [qrConfig, setQrConfig] = useState({
    size: 256,
    level: 'M',
    includeMargin: true,
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    logo: null,
    logoSize: 64,
  });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (currentCard) {
      setSelectedCard(currentCard);
      const idForUrl = currentCard.apiId ?? currentCard.id;
      setPreviewUrl(`${window.location.origin}/preview/${idForUrl}`);
    }
  }, [currentCard]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setCurrentCard(card.id);
    const idForUrl = card.apiId ?? card.id;
    setPreviewUrl(`${window.location.origin}/preview/${idForUrl}`);
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = qrConfig.size;
      canvas.height = qrConfig.size;
      ctx.fillStyle = qrConfig.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `qr-${selectedCard?.contactData?.firstName || 'card'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Tarjeta Digital',
          text: 'Mira mi tarjeta de visita digital',
          url: previewUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setQrConfig(prev => ({ ...prev, logo: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setQrConfig(prev => ({ ...prev, logo: null }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-chocolate-200 hover:text-texto hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-texto">Generador de QR</h1>
            <p className="text-chocolate-200">
              Crea códigos QR personalizados para tus tarjetas digitales
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Card Selection */}
          <div className="luxury-card rounded-lg shadow-sm border border-borde p-6">
            <h2 className="text-lg font-medium text-texto mb-4">Seleccionar Tarjeta</h2>
            {cards.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-chocolate-200 mb-4">No tienes tarjetas creadas</p>
                <button
                  onClick={() => navigate('/editor')}
                  className="bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Crear Primera Tarjeta
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardSelect(card)}
                    className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                      selectedCard?.id === card.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-borde hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {card.contactData.firstName?.[0] || card.contactData.lastName?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-texto">
                          {card.contactData.firstName} {card.contactData.lastName}
                        </h3>
                        <p className="text-sm text-chocolate-200">
                          {card.contactData.jobTitle} {card.contactData.company && `en ${card.contactData.company}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QR Configuration */}
          {selectedCard && (
            <div className="luxury-card rounded-lg shadow-sm border border-borde p-6">
              <h2 className="text-lg font-medium text-texto mb-4">Configuración del QR</h2>
              
              {/* Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño: {qrConfig.size}px
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={qrConfig.size}
                  onChange={(e) => setQrConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Error Correction Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Corrección de Errores
                </label>
                <select
                  value={qrConfig.level}
                  onChange={(e) => setQrConfig(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="L">Bajo (7%)</option>
                  <option value="M">Medio (15%)</option>
                  <option value="Q">Alto (25%)</option>
                  <option value="H">Máximo (30%)</option>
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de Fondo
                  </label>
                  <input
                    type="color"
                    value={qrConfig.bgColor}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color del QR
                  </label>
                  <input
                    type="color"
                    value={qrConfig.fgColor}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo en el Centro
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {qrConfig.logo ? (
                    <div className="relative">
                      <img
                        src={qrConfig.logo}
                        alt="Logo"
                        className="w-16 h-16 mx-auto object-contain"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Agregar logo
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Size */}
              {qrConfig.logo && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño del Logo: {qrConfig.logoSize}px
                  </label>
                  <input
                    type="range"
                    min="32"
                    max="128"
                    step="8"
                    value={qrConfig.logoSize}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={qrConfig.includeMargin}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, includeMargin: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Incluir margen</span>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedCard && (
            <div className="luxury-card rounded-lg shadow-sm border border-borde p-6">
              <h2 className="text-lg font-medium text-texto mb-4">Acciones</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download size={18} />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Copy size={18} />
                  <span>Copiar Link</span>
                </button>
                <button
                  onClick={handleShare}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="luxury-card rounded-lg shadow-sm border border-borde p-6">
            <h2 className="text-lg font-medium text-texto mb-4">Vista Previa</h2>
            
            {selectedCard ? (
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-8 mb-4">
                  <QRCodeSVG
                    id="qr-code"
                    value={previewUrl}
                    size={qrConfig.size}
                    level={qrConfig.level}
                    includeMargin={qrConfig.includeMargin}
                    bgColor={qrConfig.bgColor}
                    fgColor={qrConfig.fgColor}
                    imageSettings={qrConfig.logo ? {
                      src: qrConfig.logo,
                      x: undefined,
                      y: undefined,
                      height: qrConfig.logoSize,
                      width: qrConfig.logoSize,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                
                <div className="text-sm text-chocolate-200">
                  <p className="mb-2">Enlace incluido en el QR:</p>
                  <p className="break-all bg-gray-100 p-2 rounded text-xs">
                    {previewUrl}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-chocolate-200">
                  Selecciona una tarjeta para generar el código QR
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator; 