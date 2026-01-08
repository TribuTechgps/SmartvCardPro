import axios from 'axios';

// Configuración de la API
const API_BASE_URL = 'https://startapp360.com/api/v1';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar Basic Auth a todas las peticiones
    this.api.interceptors.request.use(
      (config) => {
        const { username, password } = this.getCredentials();
        if (username && password) {
          const token = btoa(`${username}:${password}`);
          config.headers.Authorization = `Basic ${token}`;
          console.log('🔐 Basic Auth agregado a la petición');
        } else {
          console.log('⚠️ No hay credenciales para Basic Auth');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('⚠️ Error 401 - No autorizado');
          this.clearCredentials();
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
        return Promise.reject(error);
      }
    );

    // Cargar credenciales del localStorage
    this.loadCredentials();
  }

  // Métodos para manejar las credenciales
  loadCredentials() {
    if (typeof window !== 'undefined') {
      this.username = localStorage.getItem('auth_username');
      this.password = localStorage.getItem('auth_password');
    }
  }

  setCredentials(username, password) {
    console.log('🔐 Guardando credenciales en localStorage');
    this.username = username;
    this.password = password;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_username', username);
      localStorage.setItem('auth_password', password);
      // También guardar el token JWT para compatibilidad
      localStorage.setItem('token', 'basic-auth-session');
    }
  }

  getCredentials() {
    return { username: this.username, password: this.password };
  }

  clearCredentials() {
    console.log('🗑️ Limpiando credenciales');
    this.username = null;
    this.password = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_username');
      localStorage.removeItem('auth_password');
      localStorage.removeItem('token');
    }
  }

  isAuthenticated() {
    const { username, password } = this.getCredentials();
    return !!(username && password);
  }

  // Métodos de autenticación
  async login(credentials) {
    try {
      console.log('🔐 Iniciando login con Basic Auth...');

      // Guardar las credenciales inmediatamente
      this.setCredentials(credentials.email, credentials.password);

      // Probar las credenciales haciendo una petición a un endpoint protegido
      try {
        await this.api.get('/user/');
        console.log('✅ Login exitoso, credenciales válidas');
        return {
          access: 'basic-auth-session',
          user: {
            email: credentials.email,
            username: credentials.email,
          }
        };
      } catch (authError) {
        console.error('❌ Credenciales inválidas:', authError);
        this.clearCredentials();
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.clearCredentials();
      throw error;
    }
  }

  async register(data) {
    try {
      const response = await this.api.post('/register/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data) {
    try {
      // Primero obtener el usuario por email
      const usersResponse = await this.api.get('/register/');
      const users = usersResponse.data;
      const user = users.find(u => u.email === data.email);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const payload = {
        email: user.email,
        username: user.username,
        password: data.password,
        password2: data.password2
      };

      const response = await this.api.put(`/register/${user.id}/`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Métodos para imágenes
  async getAllImages() {
    try {
      const response = await this.api.get('/userimage/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createImage(data) {
    try {
      const response = await this.api.post('/userimage/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteImage(id) {
    try {
      const response = await this.api.delete(`/userimage/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Métodos de utilidad
  getCurrentUser() {
    const { username } = this.getCredentials();
    if (!username) return null;

    return {
      email: username,
      username: username,
    };
  }

  getUserEmail() {
    const { username } = this.getCredentials();
    return username;
  }

  logout() {
    this.clearCredentials();
    window.location.href = '/auth';
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;
