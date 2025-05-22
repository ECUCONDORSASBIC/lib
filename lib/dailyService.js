/**
 * Servicio para integración con Daily.co para videollamadas telemédicas
 * @module DailyService
 */

import axios from 'axios';

// Configuración base
const DAILY_API_URL = 'https://api.daily.co/v1';

/**
 * Clase que proporciona métodos para interactuar con la API de Daily.co
 */
class DailyService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DAILY_API_KEY || '';
    
    // Verificar si tenemos la API key
    if (!this.apiKey) {
      console.error('Error: API key de Daily no configurada. Compruebe las variables de entorno.');
    }
  }

  /**
   * Configura la API key de Daily.co
   * @param {string} key - API key de Daily
   */
  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Obtiene la configuración de cabeceras HTTP para las peticiones
   * @returns {Object} - Cabeceras HTTP configuradas
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Crea una nueva sala de videollamada
   * @param {Object} options - Opciones para la sala
   * @returns {Promise<Object>} - Información de la sala creada
   */
  async createRoom(options = {}) {
    try {
      // Opciones por defecto para la sala (enfocadas en telemedicina)
      const defaultOptions = {
        privacy: 'private',      // Sala privada para seguridad del paciente
        properties: {
          start_audio_off: true, // Iniciar con audio apagado
          start_video_off: false, // Iniciar con video encendido
          enable_chat: true,     // Habilitar chat
          enable_recording: false, // No habilitar grabación por defecto (temas de privacidad médica)
          enable_knocking: true,  // Permitir que pacientes "toquen" para entrar
          enable_screenshare: true, // Permitir compartir pantalla (para mostrar resultados)
          exp: Math.floor(Date.now()/1000) + 7200, // 2 horas de duración máxima
          eject_at_room_exp: true  // Expulsar participantes cuando expire la sala
        }
      };

      // Mezclar opciones por defecto con las proporcionadas
      const finalOptions = {
        ...defaultOptions,
        ...options,
        properties: {
          ...defaultOptions.properties,
          ...(options.properties || {})
        }
      };

      // Nombre de sala único basado en timestamp si no se proporciona
      if (!finalOptions.name) {
        finalOptions.name = `consultation-${Date.now()}`;
      }

      // Crear sala mediante la API de Daily
      const response = await axios.post(
        `${DAILY_API_URL}/rooms`, 
        finalOptions,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error al crear sala en Daily:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Error al crear sala de videollamada');
    }
  }

  /**
   * Obtiene información de una sala existente
   * @param {string} roomName - Nombre de la sala
   * @returns {Promise<Object>} - Información de la sala
   */
  async getRoom(roomName) {
    try {
      const response = await axios.get(
        `${DAILY_API_URL}/rooms/${roomName}`,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener información de sala:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Error al obtener información de la sala');
    }
  }

  /**
   * Crea un token de acceso para un participante
   * @param {string} roomName - Nombre de la sala
   * @param {Object} options - Opciones del token
   * @returns {Promise<Object>} - Token creado
   */
  async createToken(roomName, options = {}) {
    try {
      // Opciones por defecto para el token
      const defaultOptions = {
        exp: Math.floor(Date.now()/1000) + 3600, // 1 hora de validez
        is_owner: false // Por defecto no es propietario (el médico lo sería)
      };

      // Mezclar opciones por defecto con las proporcionadas
      const finalOptions = {
        ...defaultOptions,
        ...options
      };

      const response = await axios.post(
        `${DAILY_API_URL}/meeting-tokens`,
        {
          properties: finalOptions,
          room_name: roomName
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error al crear token de acceso:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Error al crear token de acceso');
    }
  }

  /**
   * Actualiza una sala existente
   * @param {string} roomName - Nombre de la sala
   * @param {Object} updates - Actualizaciones a aplicar 
   * @returns {Promise<Object>} - Información actualizada de la sala
   */
  async updateRoom(roomName, updates = {}) {
    try {
      const response = await axios.post(
        `${DAILY_API_URL}/rooms/${roomName}`,
        updates,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar sala:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Error al actualizar la sala');
    }
  }

  /**
   * Elimina una sala existente
   * @param {string} roomName - Nombre de la sala
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async deleteRoom(roomName) {
    try {
      const response = await axios.delete(
        `${DAILY_API_URL}/rooms/${roomName}`,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al eliminar sala:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Error al eliminar la sala');
    }
  }

  /**
   * Obtiene métricas y analíticas de uso
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Object>} - Datos de métricas
   */
  async getMetrics(options = {}) {
    try {
      // Opciones por defecto (último día)
      const defaultOptions = {
        timeframe: 'day'
      };

      const finalOptions = {
        ...defaultOptions,
        ...options
      };

      // Construir query params
      const queryParams = new URLSearchParams();
      Object.entries(finalOptions).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const response = await axios.get(
        `${DAILY_API_URL}/metrics?${queryParams.toString()}`,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Error al obtener métricas');
    }
  }
}

// Exportar una instancia única para usar en la aplicación
const dailyService = new DailyService();
export default dailyService;
