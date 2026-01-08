import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  Palette,
  User,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  MessageCircle,
  Upload,
  X,
  ChevronLeft,
  Cloud,
  HardDrive
} from 'lucide-react';
import useCardStore from '../store/cardStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const CardEditor = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const { 
    cards, 
    currentCard, 
    createCard, 
    updateCard, 
    setCurrentCard,
    templates 
  } = useCardStore();

  const [activeTab, setActiveTab] = useState('contact');
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    bio: '',
    photo: null,
    logo: null,
  });

  const [design, setDesign] = useState({
    template: 'modern',
    primaryColor: '#E91E63',
    secondaryColor: '#5C4033',
    backgroundColor: '#36454F',
    textColor: '#F5F1EF',
    fontFamily: 'Inter',
    borderRadius: '12px',
    shadow: 'medium',
    layout: 'vertical',
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [imageOrientation, setImageOrientation] = useState('vertical'); // 'horizontal' o 'vertical' - por defecto vertical para coincidir con layout

  useEffect(() => {
    // Verificar si hay un token válido
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;
          const twentyFourHours = 24 * 60 * 60;
          
          setIsAuthenticated(payload.exp && timeUntilExpiry > -twentyFourHours);
        } catch (error) {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    // Verificar cada vez que cambie el localStorage
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cardId) {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        setCurrentCard(cardId);
        setContactData(card.contactData);
        setDesign(card.design);
        // Sincronizar orientación con layout
        if (card.design?.layout) {
          setImageOrientation(card.design.layout);
        }
      }
    } else if (currentCard) {
      setContactData(currentCard.contactData);
      setDesign(currentCard.design);
      // Sincronizar orientación con layout
      if (currentCard.design?.layout) {
        setImageOrientation(currentCard.design.layout);
      }
    }
  }, [cardId, currentCard, cards, setCurrentCard]);

  const handleSave = async () => {
    if (!contactData.firstName || !contactData.lastName) {
      toast.error('Por favor completa al menos el nombre y apellido');
      return;
    }

    const cardData = {
      contactData,
      design,
    };

    // Guardar localmente
    let localCardId = null;
    if (currentCard) {
      updateCard(currentCard.id, cardData);
      localCardId = currentCard.id;
      toast.success('Tarjeta actualizada correctamente');
    } else {
      const newCard = createCard(cardData);
      localCardId = newCard.id;
      toast.success('Tarjeta creada correctamente');
      navigate(`/preview/${newCard.id}`);
    }

    // Guardar en la API
    const token = localStorage.getItem('token');
    if (token) {
      setSaving(true);
      try {
        // Preparar datos de la vcard completa
        const vcardData = {
          title: `${contactData.firstName} ${contactData.lastName} - ${contactData.company || 'Business Card'}`,
          description: `Business Card: ${contactData.jobTitle || ''} | ${contactData.email || ''} | ${contactData.phone || ''}`,
          // Incluir toda la información de contacto
          vcard_data: {
            // Usar el id local de la tarjeta para poder recuperarla públicamente
            id: localCardId,
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            company: contactData.company,
            jobTitle: contactData.jobTitle,
            email: contactData.email,
            phone: contactData.phone,
            website: contactData.website,
            address: contactData.address,
            linkedin: contactData.linkedin,
            twitter: contactData.twitter,
            instagram: contactData.instagram,
            facebook: contactData.facebook,
            whatsapp: contactData.whatsapp,
            bio: contactData.bio,
            design: design
          },
          // Si hay foto, convertirla a base64
          image_base64: contactData.photo || contactData.logo || null
        };

        // Extraer base64 si es una data URL
        if (vcardData.image_base64 && vcardData.image_base64.startsWith('data:')) {
          vcardData.image_base64 = vcardData.image_base64.split(',')[1];
        }

        // Si hay logo también, podemos enviarlo como imagen separada
        if (contactData.logo && contactData.logo !== vcardData.image_base64) {
          let logoBase64 = contactData.logo;
          if (logoBase64.startsWith('data:')) {
            logoBase64 = logoBase64.split(',')[1];
          }
          
          // Guardar el logo como imagen separada
          await axios.post(
            'https://startapp360.com/api/v1/userimage/',
            {
              title: `${contactData.company || contactData.firstName} Logo`,
              description: `Logo de empresa para ${contactData.firstName} ${contactData.lastName}`,
              image_base64: logoBase64
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Guardar la vcard completa
        const response = await axios.post(
          'https://startapp360.com/api/v1/userimage/',
          vcardData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        toast.success('VCard guardada en la nube exitosamente 🎉');
      } catch (error) {
        console.error('Error guardando en la API:', error.response?.data || error.message);
        // No mostrar error al usuario si falla la API, ya que se guardó localmente
        // toast.error('Error al guardar en la nube, pero se guardó localmente');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTemplateChange = (templateKey) => {
    const template = templates[templateKey];
    if (template) {
      setDesign(template.design);
      toast.success(`Plantilla "${template.name}" aplicada`);
    }
  };

  const handleImageUpload = (field, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setContactData(prev => ({
        ...prev,
        [field]: e.target.result,
        [`${field}Orientation`]: imageOrientation
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field) => {
    setContactData(prev => ({
      ...prev,
      [field]: null,
      [`${field}Orientation`]: null
    }));
  };

  const tabs = [
    { id: 'contact', name: 'Contacto', icon: User },
    { id: 'design', name: 'Diseño', icon: Palette },
    { id: 'preview', name: 'Vista Previa', icon: Eye },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-texto hover:text-fucsia-300 hover:bg-carbon-600 rounded-lg transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-texto">
              {currentCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
            </h1>
            <p className="text-chocolate-200">
              {currentCard ? 'Modifica los datos de tu tarjeta' : 'Crea tu tarjeta de visita digital'}
            </p>
            {!isAuthenticated && (
              <p className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  <a href="/auth" className="underline hover:text-yellow-300">Inicia sesión</a> para guardar tus tarjetas en la nube
                </span>
              </p>
            )}
            {isAuthenticated && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                <span>✓</span>
                <span>Autenticado - Tus tarjetas se guardarán en la nube automáticamente</span>
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="p-2 text-texto hover:text-turquesa-300 hover:bg-turquesa-500/20 rounded-lg transition-all hover:shadow-glow-turquesa"
            title="Vista previa"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all shine-effect disabled:opacity-50 disabled:cursor-not-allowed ${
              isAuthenticated
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-glow-fucsia'
                : 'bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white shadow-glow-fucsia'
            }`}
            title={isAuthenticated ? 'Guardar local y en la nube' : 'Guardar solo localmente (inicia sesión para guardar en la nube)'}
          >
            {isAuthenticated ? <Cloud size={18} /> : <HardDrive size={18} />}
            <Save size={18} />
            <span>
              {saving
                ? (isAuthenticated ? 'Guardando en nube...' : 'Guardando...')
                : (isAuthenticated ? 'Guardar en Nube' : 'Guardar Local')
              }
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="luxury-card rounded-lg shine-effect">
            <div className="flex border-b border-borde bg-gradient-to-r from-chocolate-600 to-carbon-600">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'text-fucsia-300 border-b-2 border-fucsia-500 bg-fucsia-500/20 shadow-glow-fucsia'
                        : 'text-texto hover:text-fucsia-300 hover:bg-carbon-600/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={contactData.firstName}
                          onChange={(e) => setContactData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          value={contactData.lastName}
                          onChange={(e) => setContactData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Información de la Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={contactData.company}
                          onChange={(e) => setContactData(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={contactData.jobTitle}
                          onChange={(e) => setContactData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="Tu cargo o título"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Información de Contacto</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Sitio Web
                        </label>
                        <input
                          type="url"
                          value={contactData.website}
                          onChange={(e) => setContactData(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="https://tuwebsite.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={contactData.address}
                          onChange={(e) => setContactData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="Tu dirección"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Redes Sociales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={contactData.linkedin}
                          onChange={(e) => setContactData(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="https://linkedin.com/in/tu-perfil"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={contactData.twitter}
                          onChange={(e) => setContactData(prev => ({ ...prev, twitter: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="https://twitter.com/tu-usuario"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={contactData.instagram}
                          onChange={(e) => setContactData(prev => ({ ...prev, instagram: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="https://instagram.com/tu-usuario"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={contactData.whatsapp}
                          onChange={(e) => setContactData(prev => ({ ...prev, whatsapp: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-chocolate-200 mb-2">
                      Biografía
                    </label>
                    <textarea
                      value={contactData.bio}
                      onChange={(e) => setContactData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>

                  {/* Images */}
                  <div>
                    {/* Orientation Selector */}
                    <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-carbon-600/30 rounded-lg border border-red-500/30">
                      <span className="text-sm text-texto font-medium">Orientación:</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setImageOrientation('horizontal');
                            setDesign(prev => ({ ...prev, layout: 'horizontal' }));
                          }}
                          className={`px-4 py-2 border-2 rounded transition-all flex flex-col items-center justify-center gap-1 ${
                            imageOrientation === 'horizontal'
                              ? 'border-red-500 bg-red-500/40 shadow-lg text-white'
                              : 'border-red-500/70 bg-transparent hover:border-red-500 hover:bg-red-500/20 text-texto'
                          }`}
                        >
                          <div className={`w-12 h-6 border-2 rounded ${
                            imageOrientation === 'horizontal'
                              ? 'border-white bg-white/30'
                              : 'border-red-500/50'
                          }`}></div>
                          <span className="text-xs font-medium">Horizontal</span>
                        </button>
                        <button
                          onClick={() => {
                            setImageOrientation('vertical');
                            setDesign(prev => ({ ...prev, layout: 'vertical' }));
                          }}
                          className={`px-4 py-2 border-2 rounded transition-all flex flex-col items-center justify-center gap-1 ${
                            imageOrientation === 'vertical'
                              ? 'border-red-500 bg-red-500/40 shadow-lg text-white'
                              : 'border-red-500/70 bg-transparent hover:border-red-500 hover:bg-red-500/20 text-texto'
                          }`}
                        >
                          <div className={`w-6 h-12 border-2 rounded ${
                            imageOrientation === 'vertical'
                              ? 'border-white bg-white/30'
                              : 'border-red-500/50'
                          }`}></div>
                          <span className="text-xs font-medium">Vertical</span>
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-texto mb-4">Imágenes</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Foto de Perfil
                        </label>
                        <div className="border-2 border-dashed border-borde rounded-lg p-4 text-center">
                          {contactData.photo ? (
                            <div className="relative">
                              <img
                                src={contactData.photo}
                                alt="Profile"
                                className={`mx-auto rounded-full object-cover ${
                                  contactData.photoOrientation === 'vertical' 
                                    ? 'w-16 h-24' 
                                    : 'w-24 h-16'
                                }`}
                                style={{
                                  transform: contactData.photoOrientation === 'vertical' 
                                    ? 'rotate(90deg)' 
                                    : 'none'
                                }}
                              />
                              <button
                                onClick={() => removeImage('photo')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="photo-upload"
                              className="block cursor-pointer hover:bg-carbon-600/30 transition-colors"
                            >
                              <div>
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => e.target.files[0] && handleImageUpload('photo', e.target.files[0])}
                                  className="hidden"
                                  id="photo-upload"
                                />
                                <span className="text-blue-600 hover:text-blue-700">
                                  Subir foto
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Logo de Empresa
                        </label>
                        <div className="border-2 border-dashed border-borde rounded-lg p-4 text-center">
                          {contactData.logo ? (
                            <div className="relative">
                              <img
                                src={contactData.logo}
                                alt="Logo"
                                className={`mx-auto object-contain ${
                                  contactData.logoOrientation === 'vertical' 
                                    ? 'w-16 h-24' 
                                    : 'w-24 h-16'
                                }`}
                                style={{
                                  transform: contactData.logoOrientation === 'vertical' 
                                    ? 'rotate(90deg)' 
                                    : 'none'
                                }}
                              />
                              <button
                                onClick={() => removeImage('logo')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="logo-upload"
                              className="block cursor-pointer hover:bg-carbon-600/30 transition-colors"
                            >
                              <div>
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => e.target.files[0] && handleImageUpload('logo', e.target.files[0])}
                                  className="hidden"
                                  id="logo-upload"
                                />
                                <span className="text-blue-600 hover:text-blue-700">
                                  Subir logo
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Design Tab */}
              {activeTab === 'design' && (
                <div className="space-y-6">
                  {/* Templates */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Plantillas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(templates).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => handleTemplateChange(key)}
                          className={`p-4 border-2 rounded-lg transition-colors ${
                            design.template === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-borde hover:border-borde'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-12 h-8 mx-auto mb-2 rounded bg-gradient-to-r from-fucsia-500 to-turquesa-500"></div>
                            <p className="text-sm font-medium text-texto">{template.name}</p>
                            <p className="text-xs text-texto">{template.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Colores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Color Principal
                        </label>
                        <input
                          type="color"
                          value={design.primaryColor}
                          onChange={(e) => setDesign(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-full h-10 border border-borde rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Color Secundario
                        </label>
                        <input
                          type="color"
                          value={design.secondaryColor}
                          onChange={(e) => setDesign(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-full h-10 border border-borde rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Color de Fondo
                        </label>
                        <input
                          type="color"
                          value={design.backgroundColor}
                          onChange={(e) => setDesign(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-full h-10 border border-borde rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Color de Texto
                        </label>
                        <input
                          type="color"
                          value={design.textColor}
                          onChange={(e) => setDesign(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-full h-10 border border-borde rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Tipografía</h3>
                    <div>
                      <label className="block text-sm font-medium text-chocolate-200 mb-2">
                        Fuente
                      </label>
                      <select
                        value={design.fontFamily}
                        onChange={(e) => setDesign(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>
                  </div>

                  {/* Layout */}
                  <div>
                    <h3 className="text-lg font-medium text-texto mb-4">Diseño</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Bordes Redondeados
                        </label>
                        <select
                          value={design.borderRadius}
                          onChange={(e) => setDesign(prev => ({ ...prev, borderRadius: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                        >
                          <option value="0px">Sin bordes</option>
                          <option value="4px">Pequeños</option>
                          <option value="8px">Medianos</option>
                          <option value="12px">Grandes</option>
                          <option value="20px">Muy grandes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-chocolate-200 mb-2">
                          Sombra
                        </label>
                        <select
                          value={design.shadow}
                          onChange={(e) => setDesign(prev => ({ ...prev, shadow: e.target.value }))}
                          className="w-full px-3 py-2 border border-borde rounded-lg focus:ring-2 focus:ring-fucsia-500 focus:border-transparent text-black"
                        >
                          <option value="none">Sin sombra</option>
                          <option value="light">Ligera</option>
                          <option value="medium">Media</option>
                          <option value="heavy">Fuerte</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="text-center py-8">
                  <p className="text-texto mb-4">
                    Vista previa de tu tarjeta digital
                  </p>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="bg-gradient-to-r from-fucsia-500 to-fucsia-600 hover:from-fucsia-600 hover:to-fucsia-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Ver Vista Previa Completa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="luxury-card rounded-lg p-6 veladura-turquesa">
            <h3 className="text-lg font-medium text-texto mb-4">Vista Previa</h3>
            <div 
              className={`mx-auto border rounded-lg relative overflow-hidden word-wrap ${
                design.layout === 'horizontal' 
                  ? 'w-full max-w-4xl p-8' 
                  : 'w-full max-w-sm p-6'
              }`}
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
                display: design.layout === 'horizontal' ? 'flex' : 'block',
                flexDirection: design.layout === 'horizontal' ? 'row' : 'column',
                gap: design.layout === 'horizontal' ? '2.5rem' : '0',
              }}
            >
              {/* Header */}
              <div className={`${design.layout === 'horizontal' ? 'flex-shrink-0 pr-8 min-w-0 max-w-[200px] flex flex-col justify-center' : 'text-center mb-6'}`}>
                {contactData.photo && (
                  <img
                    src={contactData.photo}
                    alt="Profile"
                    className={`${design.layout === 'horizontal' ? 'w-16 h-16' : 'w-20 h-20 mx-auto'} rounded-full object-cover ${design.layout === 'horizontal' ? 'mb-3' : 'mb-4'}`}
                  />
                )}
                <h2 className={`${design.layout === 'horizontal' ? 'text-base' : 'text-xl'} font-bold ${design.layout === 'horizontal' ? 'text-left' : 'text-center'} break-words overflow-wrap-anywhere mb-1.5`} style={{ color: design.primaryColor }}>
                  {contactData.firstName} {contactData.lastName}
                </h2>
                {contactData.jobTitle && (
                  <p className={`${design.layout === 'horizontal' ? 'text-xs' : 'text-sm'} opacity-80 ${design.layout === 'horizontal' ? 'text-left' : ''} break-words overflow-wrap-anywhere mb-1`}>{contactData.jobTitle}</p>
                )}
                {contactData.company && (
                  <p className={`${design.layout === 'horizontal' ? 'text-xs' : 'text-sm'} opacity-80 ${design.layout === 'horizontal' ? 'text-left' : ''} break-words overflow-wrap-anywhere`}>{contactData.company}</p>
                )}
              </div>

              {/* Contact Info */}
              <div className={`${design.layout === 'horizontal' ? 'flex-1 flex flex-col min-w-0 justify-center' : ''} ${design.layout === 'horizontal' ? '' : 'mb-6'}`}>
                {design.layout === 'horizontal' ? (
                  <div className="flex gap-8 min-w-0">
                    {/* Columna izquierda: Información de contacto */}
                    <div className="flex-1 space-y-2.5 min-w-0">
                      {contactData.email && (
                        <div className="flex items-start space-x-2.5 text-xs min-w-0">
                          <Mail size={16} className="flex-shrink-0 mt-0.5" />
                          <span className="break-words overflow-wrap-anywhere">{contactData.email}</span>
                        </div>
                      )}
                      {contactData.phone && (
                        <div className="flex items-start space-x-2.5 text-xs min-w-0">
                          <Phone size={16} className="flex-shrink-0 mt-0.5" />
                          <span className="break-words overflow-wrap-anywhere">{contactData.phone}</span>
                        </div>
                      )}
                      {contactData.website && (
                        <div className="flex items-start space-x-2.5 text-xs min-w-0">
                          <Globe size={16} className="flex-shrink-0 mt-0.5" />
                          <span className="break-words overflow-wrap-anywhere">{contactData.website}</span>
                        </div>
                      )}
                      {contactData.address && (
                        <div className="flex items-start space-x-2.5 text-xs min-w-0">
                          <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                          <span className="break-words overflow-wrap-anywhere">{contactData.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha: Redes sociales y biografía */}
                    <div className="flex-1 space-y-3 min-w-0 pl-4 flex flex-col">
                      {/* Social Media */}
                      {(contactData.linkedin || contactData.twitter || contactData.instagram || contactData.facebook || contactData.whatsapp) && (
                        <div className="flex flex-wrap gap-2.5">
                          {contactData.linkedin && <Linkedin size={18} />}
                          {contactData.twitter && <Twitter size={18} />}
                          {contactData.instagram && <Instagram size={18} />}
                          {contactData.facebook && <Facebook size={18} />}
                          {contactData.whatsapp && <MessageCircle size={18} />}
                        </div>
                      )}

                      {/* Bio */}
                      {contactData.bio && (
                        <div className="text-xs opacity-80 text-left break-words overflow-wrap-anywhere leading-relaxed">
                          {contactData.bio}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {contactData.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail size={16} />
                          <span className="break-words overflow-wrap-anywhere">{contactData.email}</span>
                        </div>
                      )}
                      {contactData.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone size={16} />
                          <span className="break-words overflow-wrap-anywhere">{contactData.phone}</span>
                        </div>
                      )}
                      {contactData.website && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe size={16} />
                          <span className="break-words overflow-wrap-anywhere">{contactData.website}</span>
                        </div>
                      )}
                      {contactData.address && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin size={16} />
                          <span className="break-words overflow-wrap-anywhere">{contactData.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Media */}
                    {(contactData.linkedin || contactData.twitter || contactData.instagram || contactData.facebook || contactData.whatsapp) && (
                      <div className="flex justify-center space-x-4 mt-4 mb-4">
                        {contactData.linkedin && <Linkedin size={20} />}
                        {contactData.twitter && <Twitter size={20} />}
                        {contactData.instagram && <Instagram size={20} />}
                        {contactData.facebook && <Facebook size={20} />}
                        {contactData.whatsapp && <MessageCircle size={20} />}
                      </div>
                    )}

                    {/* Bio */}
                    {contactData.bio && (
                      <div className="text-sm opacity-80 text-center border-t pt-4 break-words overflow-wrap-anywhere max-h-32 overflow-y-auto">
                        {contactData.bio}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Logo Watermark */}
              {contactData.logo && (
                <div className="absolute bottom-2 right-2 opacity-60">
                  <img
                    src={contactData.logo}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="luxury-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-borde bg-gradient-to-r from-chocolate-600 to-carbon-600">
              <h2 className="text-xl font-semibold text-texto">Vista Previa Completa</h2>
              <button
                onClick={() => setPreviewMode(false)}
                className="p-2 text-texto hover:text-texto transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className={`mx-auto ${design.layout === 'horizontal' ? 'max-w-6xl' : 'max-w-2xl'}`}>
                <div 
                  className={`luxury-card rounded-lg shadow-luxury mx-auto relative overflow-hidden word-wrap ${
                    design.layout === 'horizontal' ? 'w-full p-10' : 'w-full p-8'
                  }`}
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
                    display: design.layout === 'horizontal' ? 'flex' : 'block',
                    flexDirection: design.layout === 'horizontal' ? 'row' : 'column',
                    gap: design.layout === 'horizontal' ? '3rem' : '0',
                  }}
                >
                  {/* Header */}
                  <div className={`${design.layout === 'horizontal' ? 'flex-shrink-0 pr-10 min-w-0 max-w-[220px] flex flex-col justify-center' : 'text-center mb-8'}`}>
                    {contactData.photo && (
                      <img
                        src={contactData.photo}
                        alt={`${contactData.firstName} ${contactData.lastName}`}
                        className={`${design.layout === 'horizontal' ? 'w-24 h-24' : 'w-32 h-32 mx-auto'} rounded-full object-cover ${design.layout === 'horizontal' ? 'mb-4' : 'mb-6'} border-4 border-white shadow-lg`}
                      />
                    )}
                    <h1 
                      className={`${design.layout === 'horizontal' ? 'text-lg' : 'text-3xl'} font-bold mb-2 ${design.layout === 'horizontal' ? 'text-left' : ''} break-words overflow-wrap-anywhere`}
                      style={{ color: design.primaryColor }}
                    >
                      {contactData.firstName} {contactData.lastName}
                    </h1>
                    {contactData.jobTitle && (
                      <p className={`${design.layout === 'horizontal' ? 'text-sm' : 'text-lg'} opacity-80 mb-1 ${design.layout === 'horizontal' ? 'text-left' : ''} break-words overflow-wrap-anywhere`}>{contactData.jobTitle}</p>
                    )}
                    {contactData.company && (
                      <p className={`${design.layout === 'horizontal' ? 'text-sm' : 'text-lg'} font-semibold opacity-80 ${design.layout === 'horizontal' ? 'text-left' : ''} break-words overflow-wrap-anywhere`}>{contactData.company}</p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className={`${design.layout === 'horizontal' ? 'flex-1 flex flex-col min-w-0 justify-center' : ''} ${design.layout === 'horizontal' ? '' : 'mb-8'}`}>
                    {design.layout === 'horizontal' ? (
                      <div className="flex gap-10 min-w-0">
                        {/* Columna izquierda: Información de contacto */}
                        <div className="flex-1 space-y-3 min-w-0">
                          {contactData.email && (
                            <div className="flex items-start space-x-3 min-w-0">
                              <Mail size={18} className="flex-shrink-0 mt-0.5" />
                              <span className="break-words overflow-wrap-anywhere text-sm">{contactData.email}</span>
                            </div>
                          )}
                          
                          {contactData.phone && (
                            <div className="flex items-start space-x-3 min-w-0">
                              <Phone size={18} className="flex-shrink-0 mt-0.5" />
                              <span className="break-words overflow-wrap-anywhere text-sm">{contactData.phone}</span>
                            </div>
                          )}
                          
                          {contactData.website && (
                            <div className="flex items-start space-x-3 min-w-0">
                              <Globe size={18} className="flex-shrink-0 mt-0.5" />
                              <span className="break-words overflow-wrap-anywhere text-sm">{contactData.website}</span>
                            </div>
                          )}
                          
                          {contactData.address && (
                            <div className="flex items-start space-x-3 min-w-0">
                              <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                              <span className="break-words overflow-wrap-anywhere text-sm">{contactData.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Columna derecha: Redes sociales y biografía */}
                        <div className="flex-1 space-y-3 min-w-0 pl-4 flex flex-col">
                          {/* Social Media */}
                          {(contactData.linkedin || contactData.twitter || contactData.instagram || contactData.facebook || contactData.whatsapp) && (
                            <div>
                              <h3 className="text-base font-semibold mb-3 text-left">Redes Sociales</h3>
                              <div className="flex flex-wrap gap-3">
                                {contactData.linkedin && <Linkedin size={20} />}
                                {contactData.twitter && <Twitter size={20} />}
                                {contactData.instagram && <Instagram size={20} />}
                                {contactData.facebook && <Facebook size={20} />}
                                {contactData.whatsapp && <MessageCircle size={20} />}
                              </div>
                            </div>
                          )}

                          {/* Bio */}
                          {contactData.bio && (
                            <div className="text-left">
                              <p className="text-sm leading-relaxed opacity-80 break-words overflow-wrap-anywhere">{contactData.bio}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {contactData.email && (
                            <div className="flex items-center space-x-3 p-3">
                              <Mail size={20} />
                              <span className="break-words overflow-wrap-anywhere">{contactData.email}</span>
                            </div>
                          )}
                          
                          {contactData.phone && (
                            <div className="flex items-center space-x-3 p-3">
                              <Phone size={20} />
                              <span className="break-words overflow-wrap-anywhere">{contactData.phone}</span>
                            </div>
                          )}
                          
                          {contactData.website && (
                            <div className="flex items-center space-x-3 p-3">
                              <Globe size={20} />
                              <span className="break-words overflow-wrap-anywhere">{contactData.website}</span>
                            </div>
                          )}
                          
                          {contactData.address && (
                            <div className="flex items-center space-x-3 p-3">
                              <MapPin size={20} />
                              <span className="break-words overflow-wrap-anywhere">{contactData.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Social Media */}
                        {(contactData.linkedin || contactData.twitter || contactData.instagram || contactData.facebook || contactData.whatsapp) && (
                          <div className="mb-8 mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-center">Redes Sociales</h3>
                            <div className="flex justify-center space-x-4">
                              {contactData.linkedin && <Linkedin size={24} />}
                              {contactData.twitter && <Twitter size={24} />}
                              {contactData.instagram && <Instagram size={24} />}
                              {contactData.facebook && <Facebook size={24} />}
                              {contactData.whatsapp && <MessageCircle size={24} />}
                            </div>
                          </div>
                        )}

                        {/* Bio */}
                        {contactData.bio && (
                          <div className="text-center border-t pt-6">
                            <p className="text-lg leading-relaxed opacity-80 break-words overflow-wrap-anywhere max-h-48 overflow-y-auto">{contactData.bio}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardEditor; 