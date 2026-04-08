import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      heroTitle: 'Convert files instantly. Securely. Universally.',
      heroDescription: 'Convertly transforms documents, images, audio and video in seconds with trusted private processing.'
    }
  },
  es: {
    translation: {
      heroTitle: 'Convierte archivos al instante. Seguro. Universal.',
      heroDescription: 'Convertly transforma documentos, imágenes, audio y video en segundos con procesamiento privado.'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
