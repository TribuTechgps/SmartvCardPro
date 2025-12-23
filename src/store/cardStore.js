import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useCardStore = create(
  persist(
    (set, get) => ({
      // Estado de las tarjetas
      cards: [],
      currentCard: null,
      
      // Datos de contacto por defecto
      defaultContactData: {
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
      },

      // Configuración de diseño por defecto
      defaultDesign: {
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

      // Acciones
      createCard: (cardData = {}) => {
        const newCard = {
          id: uuidv4(),
          // ID de la tarjeta en la API (para compartir públicamente)
          apiId: cardData.apiId || null,
          contactData: { ...get().defaultContactData, ...cardData.contactData },
          design: { ...get().defaultDesign, ...cardData.design },
          qrCode: null,
          emailSignature: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...cardData,
        };
        
        set((state) => ({
          cards: [...state.cards, newCard],
          currentCard: newCard,
        }));
        
        return newCard;
      },

      updateCard: (cardId, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : card
          ),
          currentCard: state.currentCard?.id === cardId
            ? { ...state.currentCard, ...updates, updatedAt: new Date().toISOString() }
            : state.currentCard,
        }));
      },

      deleteCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
          currentCard: state.currentCard?.id === cardId ? null : state.currentCard,
        }));
      },

      setCurrentCard: (cardId) => {
        const card = get().cards.find((c) => c.id === cardId);
        set({ currentCard: card || null });
      },

      updateContactData: (cardId, contactData) => {
        get().updateCard(cardId, { contactData });
      },

      updateDesign: (cardId, design) => {
        get().updateCard(cardId, { design });
      },

      updateQRCode: (cardId, qrCode) => {
        get().updateCard(cardId, { qrCode });
      },

      updateEmailSignature: (cardId, emailSignature) => {
        get().updateCard(cardId, { emailSignature });
      },

      // Plantillas predefinidas
      templates: {
        modern: {
          name: 'Moderno',
          description: 'Diseño limpio y profesional',
          design: {
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
        },
        classic: {
          name: 'Clásico',
          description: 'Estilo tradicional y elegante',
          design: {
            template: 'classic',
            primaryColor: '#5C4033',
            secondaryColor: '#778793',
            backgroundColor: '#E8DED9',
            textColor: '#251914',
            fontFamily: 'Georgia',
            borderRadius: '4px',
            shadow: 'light',
            layout: 'horizontal',
          },
        },
        creative: {
          name: 'Creativo',
          description: 'Diseño moderno y llamativo',
          design: {
            template: 'creative',
            primaryColor: '#E91E63',
            secondaryColor: '#00BCD4',
            backgroundColor: '#F5F1EF',
            textColor: '#251914',
            fontFamily: 'Poppins',
            borderRadius: '20px',
            shadow: 'heavy',
            layout: 'vertical',
          },
        },
        minimal: {
          name: 'Minimalista',
          description: 'Diseño simple y elegante',
          design: {
            template: 'minimal',
            primaryColor: '#000000',
            secondaryColor: '#6B7280',
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            fontFamily: 'Helvetica',
            borderRadius: '0px',
            shadow: 'none',
            layout: 'vertical',
          },
        },
        dark: {
          name: 'Oscuro',
          description: 'Tema oscuro moderno',
          design: {
            template: 'dark',
            primaryColor: '#10B981',
            secondaryColor: '#6B7280',
            backgroundColor: '#1F2937',
            textColor: '#F9FAFB',
            fontFamily: 'Inter',
            borderRadius: '16px',
            shadow: 'heavy',
            layout: 'vertical',
          },
        },
        gradient: {
          name: 'Gradiente',
          description: 'Diseño con gradientes vibrantes',
          design: {
            template: 'gradient',
            primaryColor: '#E91E63',
            secondaryColor: '#00BCD4',
            backgroundColor: 'linear-gradient(135deg, #5C4033 0%, #36454F 100%)',
            textColor: '#F5F1EF',
            fontFamily: 'Poppins',
            borderRadius: '24px',
            shadow: 'heavy',
            layout: 'vertical',
          },
        },
        corporate: {
          name: 'Corporativo',
          description: 'Profesional para empresas',
          design: {
            template: 'corporate',
            primaryColor: '#00BCD4',
            secondaryColor: '#5C4033',
            backgroundColor: '#F5F1EF',
            textColor: '#251914',
            fontFamily: 'Roboto',
            borderRadius: '8px',
            shadow: 'medium',
            layout: 'horizontal',
          },
        },
        elegant: {
          name: 'Elegante',
          description: 'Lujo y sofisticación',
          design: {
            template: 'elegant',
            primaryColor: '#E91E63',
            secondaryColor: '#00BCD4',
            backgroundColor: '#D1BDB3',
            textColor: '#251914',
            fontFamily: 'Georgia',
            borderRadius: '12px',
            shadow: 'light',
            layout: 'vertical',
          },
        },
        tech: {
          name: 'Tecnológico',
          description: 'Futurista y digital',
          design: {
            template: 'tech',
            primaryColor: '#00D4FF',
            secondaryColor: '#1F2937',
            backgroundColor: '#0F172A',
            textColor: '#E2E8F0',
            fontFamily: 'Inter',
            borderRadius: '0px',
            shadow: 'none',
            layout: 'vertical',
          },
        },
        nature: {
          name: 'Natural',
          description: 'Inspirado en la naturaleza',
          design: {
            template: 'nature',
            primaryColor: '#059669',
            secondaryColor: '#10B981',
            backgroundColor: '#F0FDF4',
            textColor: '#064E3B',
            fontFamily: 'Inter',
            borderRadius: '16px',
            shadow: 'light',
            layout: 'vertical',
          },
        },
        vibrant: {
          name: 'Vibrante',
          description: 'Colores llamativos y energéticos',
          design: {
            template: 'vibrant',
            primaryColor: '#F59E0B',
            secondaryColor: '#EF4444',
            backgroundColor: '#FEF3C7',
            textColor: '#92400E',
            fontFamily: 'Poppins',
            borderRadius: '20px',
            shadow: 'medium',
            layout: 'vertical',
          },
        },
        luxury: {
          name: 'Lujo',
          description: 'Oro y elegancia premium',
          design: {
            template: 'luxury',
            primaryColor: '#E91E63',
            secondaryColor: '#5C4033',
            backgroundColor: 'linear-gradient(135deg, #5C4033 0%, #36454F 100%)',
            textColor: '#F5F1EF',
            fontFamily: 'Georgia',
            borderRadius: '8px',
            shadow: 'heavy',
            layout: 'horizontal',
          },
        },
        neon: {
          name: 'Neón',
          description: 'Efectos neón y cyberpunk',
          design: {
            template: 'neon',
            primaryColor: '#00FF88',
            secondaryColor: '#FF0080',
            backgroundColor: '#0A0A0A',
            textColor: '#FFFFFF',
            fontFamily: 'Inter',
            borderRadius: '12px',
            shadow: 'none',
            layout: 'vertical',
          },
        },
        pastel: {
          name: 'Pastel',
          description: 'Colores suaves y delicados',
          design: {
            template: 'pastel',
            primaryColor: '#A78BFA',
            secondaryColor: '#F472B6',
            backgroundColor: '#FDF2F8',
            textColor: '#581C87',
            fontFamily: 'Inter',
            borderRadius: '16px',
            shadow: 'light',
            layout: 'vertical',
          },
        },
        monochrome: {
          name: 'Monocromo',
          description: 'Blanco y negro clásico',
          design: {
            template: 'monochrome',
            primaryColor: '#000000',
            secondaryColor: '#6B7280',
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            fontFamily: 'Helvetica',
            borderRadius: '0px',
            shadow: 'none',
            layout: 'vertical',
          },
        },
        ocean: {
          name: 'Océano',
          description: 'Azules profundos del mar',
          design: {
            template: 'ocean',
            primaryColor: '#0EA5E9',
            secondaryColor: '#0284C7',
            backgroundColor: '#F0F9FF',
            textColor: '#0C4A6E',
            fontFamily: 'Inter',
            borderRadius: '12px',
            shadow: 'medium',
            layout: 'vertical',
          },
        },
      },

      // Configuración global
      settings: {
        autoSave: true,
        defaultTemplate: 'modern',
        qrCodeStyle: 'default',
        emailSignatureTemplate: 'standard',
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
    }),
    {
      name: 'digital-cards-storage',
      partialize: (state) => ({
        cards: state.cards,
        settings: state.settings,
      }),
    }
  )
);

export default useCardStore; 