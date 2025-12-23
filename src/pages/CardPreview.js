import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, 
  Copy, 
  Download, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  MessageCircle,
  ArrowLeft,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import useCardStore from '../store/cardStore';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import axios from 'axios';

const CardPreview = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { cards } = useCardStore();
  const cardRef = useRef(null);
  
  const [card, setCard] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      setLoading(true);
      
      // Primero buscar en el store local (por id local o apiId)
      let foundCard = cards.find(
        (c) => c.id === cardId || (c.apiId && c.apiId.toString() === cardId?.toString())
      );
      
      if (foundCard) {
        setCard(foundCard);
        setLoading(false);
        return;
      }

      // Si no se encuentra en el store, intentar leer directamente de localStorage
      try {
        const storedData = localStorage.getItem('digital-cards-storage');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          const state = parsed.state || parsed;
          if (state.cards && Array.isArray(state.cards)) {
            foundCard = state.cards.find(
              (c) => c.id === cardId || (c.apiId && c.apiId.toString() === cardId?.toString())
            );
            if (foundCard) {
              setCard(foundCard);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }

      // Si aún no se encuentra, intentar buscar en la API usando el id local (vcard_data.id)
      try {
        const token = localStorage.getItem('token');
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined;

        // Obtener todas las vcards del usuario y buscar por vcard_data.id === cardId
        const response = await axios.get(
          'https://startapp360.com/api/v1/userimage/',
          headers ? { headers } : undefined
        );

        const list = Array.isArray(response.data) ? response.data : [];
        const apiCard = list.find(
          (item) => item.vcard_data && item.vcard_data.id === cardId
        );

        if (apiCard && apiCard.vcard_data) {
          // Convertir el formato de la API al formato esperado
          const convertedCard = {
            id: apiCard.vcard_data.id || cardId,
            apiId: apiCard.id,
            contactData: {
              firstName: apiCard.vcard_data.firstName || '',
              lastName: apiCard.vcard_data.lastName || '',
              company: apiCard.vcard_data.company || '',
              jobTitle: apiCard.vcard_data.jobTitle || '',
              email: apiCard.vcard_data.email || '',
              phone: apiCard.vcard_data.phone || '',
              website: apiCard.vcard_data.website || '',
              address: apiCard.vcard_data.address || '',
              linkedin: apiCard.vcard_data.linkedin || '',
              twitter: apiCard.vcard_data.twitter || '',
              instagram: apiCard.vcard_data.instagram || '',
              facebook: apiCard.vcard_data.facebook || '',
              whatsapp: apiCard.vcard_data.whatsapp || '',
              bio: apiCard.vcard_data.bio || '',
              photo: apiCard.image_base64 ? `data:image/png;base64,${apiCard.image_base64}` : null,
              logo: null,
            },
            design: apiCard.vcard_data.design || {
              template: 'modern',
              primaryColor: '#E91E63',
              secondaryColor: '#5C4033',
              backgroundColor: '#36454F',
              textColor: '#F5F1EF',
              fontFamily: 'Inter',
              borderRadius: '12px',
              shadow: 'medium',
              layout: 'vertical',
            },
            createdAt: apiCard.created_at || new Date().toISOString(),
            updatedAt: apiCard.updated_at || new Date().toISOString(),
          };

          setCard(convertedCard);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching from API:', error);
      }

      // Si no se encontró en ningún lugar
      setLoading(false);
    };

    loadCard();
  }, [cardId, cards]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card?.contactData?.firstName} ${card?.contactData?.lastName} - Tarjeta Digital`,
          text: `Mira la tarjeta de visita digital de ${card?.contactData?.firstName} ${card?.contactData?.lastName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      toast.loading('Generando imagen...', { id: 'download' });
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Alta resolución
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `${card.contactData.firstName}_${card.contactData.lastName}_tarjeta.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Tarjeta descargada correctamente', { id: 'download' });
    } catch (error) {
      console.error('Error al descargar:', error);
      toast.error('Error al descargar la tarjeta', { id: 'download' });
    }
  };

  const handleContact = (type, value) => {
    switch (type) {
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'website':
        window.open(value, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${value.replace(/\D/g, '')}`);
        break;
      case 'linkedin':
      case 'twitter':
      case 'instagram':
      case 'facebook':
        window.open(value, '_blank');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fucsia-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
          <h2 className="text-xl font-semibold text-texto mb-2">Cargando tarjeta...</h2>
          <p className="text-chocolate-200">Buscando información de la tarjeta</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-texto mb-2">Tarjeta no encontrada</h2>
          <p className="text-chocolate-200 mb-4">La tarjeta que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const { contactData, design } = card;

  return (
    <div className="min-h-screen bg-gradient-luxury">
      {/* Header */}
      <div className="luxury-card shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-chocolate-200 hover:text-texto transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 text-chocolate-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Mostrar QR"
              >
                <QrCode size={20} />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 text-chocolate-200 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Copiar enlace"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-chocolate-200 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Compartir"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-chocolate-200 hover:text-fucsia-300 hover:bg-fucsia-500/20 rounded-lg transition-all hover:shadow-glow-fucsia"
                title="Descargar"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Card */}
          <div className="lg:col-span-2">
            <div 
              ref={cardRef}
              className="luxury-card rounded-lg shadow-lg p-8 relative overflow-hidden"
              style={{
                background: design.backgroundColor.includes('gradient') 
                  ? design.backgroundColor 
                  : design.backgroundColor,
                backgroundColor: design.backgroundColor.includes('gradient') 
                  ? undefined 
                  : design.backgroundColor,
                color: design.textColor,
                borderRadius: design.borderRadius,
                fontFamily: design.fontFamily,
                boxShadow: design.shadow === 'none' ? 'none' :
                           design.shadow === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' :
                           design.shadow === 'medium' ? '0 4px 6px rgba(0,0,0,0.1)' :
                           '0 10px 25px rgba(0,0,0,0.15)',
              }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                {contactData.photo && (
                  <img
                    src={contactData.photo}
                    alt={`${contactData.firstName} ${contactData.lastName}`}
                    className="w-32 h-32 mx-auto rounded-full object-cover mb-6 border-4 border-white shadow-lg"
                  />
                )}
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: design.primaryColor }}
                >
                  {contactData.firstName} {contactData.lastName}
                </h1>
                {contactData.jobTitle && (
                  <p className="text-lg opacity-80 mb-1">{contactData.jobTitle}</p>
                )}
                {contactData.company && (
                  <p className="text-lg font-semibold opacity-80">{contactData.company}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-8">
                {contactData.email && (
                  <button
                    onClick={() => handleContact('email', contactData.email)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-luxury transition-colors"
                  >
                    <Mail size={20} />
                    <span>{contactData.email}</span>
                  </button>
                )}
                
                {contactData.phone && (
                  <button
                    onClick={() => handleContact('phone', contactData.phone)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-luxury transition-colors"
                  >
                    <Phone size={20} />
                    <span>{contactData.phone}</span>
                  </button>
                )}
                
                {contactData.website && (
                  <button
                    onClick={() => handleContact('website', contactData.website)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-luxury transition-colors"
                  >
                    <Globe size={20} />
                    <span>{contactData.website}</span>
                  </button>
                )}
                
                {contactData.address && (
                  <div className="flex items-center space-x-3 p-3">
                    <MapPin size={20} />
                    <span>{contactData.address}</span>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(contactData.linkedin || contactData.twitter || contactData.instagram || contactData.facebook || contactData.whatsapp) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-center">Redes Sociales</h3>
                  <div className="flex justify-center space-x-4">
                    {contactData.linkedin && (
                      <button
                        onClick={() => handleContact('linkedin', contactData.linkedin)}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin size={20} />
                      </button>
                    )}
                    {contactData.twitter && (
                      <button
                        onClick={() => handleContact('twitter', contactData.twitter)}
                        className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                        title="Twitter"
                      >
                        <Twitter size={20} />
                      </button>
                    )}
                    {contactData.instagram && (
                      <button
                        onClick={() => handleContact('instagram', contactData.instagram)}
                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
                        title="Instagram"
                      >
                        <Instagram size={20} />
                      </button>
                    )}
                    {contactData.facebook && (
                      <button
                        onClick={() => handleContact('facebook', contactData.facebook)}
                        className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors"
                        title="Facebook"
                      >
                        <Facebook size={20} />
                      </button>
                    )}
                    {contactData.whatsapp && (
                      <button
                        onClick={() => handleContact('whatsapp', contactData.whatsapp)}
                        className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {contactData.bio && (
                <div className="text-center border-t pt-6">
                  <p className="text-lg leading-relaxed opacity-80 break-words overflow-wrap-anywhere max-h-48 overflow-y-auto">{contactData.bio}</p>
                </div>
              )}

              {/* Logo Watermark */}
              {contactData.logo && (
                <div className="absolute bottom-4 right-4 opacity-60">
                  <img
                    src={contactData.logo}
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            {showQR && (
              <div className="luxury-card rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-texto mb-4">Código QR</h3>
                <div className="text-center">
                  <QRCodeSVG
                    value={`${window.location.origin}/preview/${cardId}`}
                    size={200}
                    level="M"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                  <p className="text-sm text-chocolate-200 mt-3">
                    Escanea para compartir esta tarjeta
                  </p>
                </div>
              </div>
            )}

             {/* Quick Actions */}
             <div className="luxury-card rounded-lg shadow-sm border border-gray-200 p-6">
               <h3 className="text-lg font-medium text-texto mb-4">Acciones Rápidas</h3>
               <div className="space-y-3">
                 {contactData.email && (
                   <button
                     onClick={() => handleContact('email', contactData.email)}
                     className="w-full bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                   >
                     <Mail size={18} />
                     <span>Enviar Email</span>
                   </button>
                 )}
                 
                 {contactData.whatsapp && (
                   <button
                     onClick={() => handleContact('whatsapp', contactData.whatsapp)}
                     className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                   >
                     <MessageCircle size={18} />
                     <span>WhatsApp</span>
                   </button>
                 )}
               </div>
             </div>

            {/* Share Options */}
            <div className="luxury-card rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-texto mb-4">Compartir</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Copy size={18} />
                  <span>Copiar Enlace</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreview; 