import { useState, useEffect, useCallback } from 'react';
import { weatherService, WeatherData, WeatherAlert } from '../services/weatherService';

interface UseWeatherNotificationsProps {
  location: string;
  coordinates?: { lat: number; lon: number };
  refreshInterval?: number; // en minutos
  enableNotifications?: boolean;
}

interface WeatherNotificationSettings {
  enablePushNotifications: boolean;
  enableCriticalAlerts: boolean;
  enableDailyForecast: boolean;
  notificationTime: string; // HH:MM format
  severityThreshold: 'low' | 'medium' | 'high' | 'extreme';
}

export function useWeatherNotifications({
  location,
  coordinates,
  refreshInterval = 30,
  enableNotifications = true
}: UseWeatherNotificationsProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<WeatherAlert[]>([]);
  const [settings, setSettings] = useState<WeatherNotificationSettings>({
    enablePushNotifications: true,
    enableCriticalAlerts: true,
    enableDailyForecast: false,
    notificationTime: '07:00',
    severityThreshold: 'medium'
  });

  // Cargar configuraciones del localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('weatherNotificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading weather notification settings:', error);
      }
    }
  }, []);

  // Guardar configuraciones en localStorage
  const updateSettings = useCallback((newSettings: Partial<WeatherNotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('weatherNotificationSettings', JSON.stringify(updatedSettings));
  }, [settings]);

  // Función para cargar datos meteorológicos
  const loadWeatherData = useCallback(async () => {
    if (!enableNotifications) return;

    try {
      setLoading(true);
      setError(null);
      
      let data: WeatherData;
      if (coordinates) {
        data = await weatherService.getWeatherData(coordinates.lat, coordinates.lon);
      } else {
        data = await weatherService.getWeatherByCity(location);
      }
      
      setWeather(data);
      setLastUpdate(new Date());
      
      // Procesar alertas para notificaciones
      if (data.alerts) {
        processWeatherAlerts(data.alerts);
      }
      
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError('No se pudo cargar la información meteorológica');
    } finally {
      setLoading(false);
    }
  }, [location, coordinates, enableNotifications]);

  // Procesar alertas meteorológicas para notificaciones
  const processWeatherAlerts = useCallback((alerts: WeatherAlert[]) => {
    if (!settings.enableCriticalAlerts) return;

    const severityOrder = { low: 1, medium: 2, high: 3, extreme: 4 };
    const threshold = severityOrder[settings.severityThreshold];

    const criticalAlerts = alerts.filter(alert => 
      severityOrder[alert.severity] >= threshold
    );

    if (criticalAlerts.length > 0) {
      setNotifications(prev => {
        // Evitar duplicados basados en ID
        const newAlerts = criticalAlerts.filter(alert => 
          !prev.some(existing => existing.id === alert.id)
        );
        return [...prev, ...newAlerts];
      });

      // Enviar notificaciones push si están habilitadas
      if (settings.enablePushNotifications && 'Notification' in window) {
        criticalAlerts.forEach(alert => {
          sendPushNotification(alert);
        });
      }
    }
  }, [settings]);

  // Enviar notificación push
  const sendPushNotification = useCallback((alert: WeatherAlert) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(`Alerta Meteorológica: ${alert.title}`, {
        body: alert.description,
        icon: '/icons/weather-alert.png',
        badge: '/icons/badge.png',
        tag: alert.id,
        requireInteraction: alert.severity === 'extreme',
        data: {
          type: 'weather-alert',
          alertId: alert.id,
          severity: alert.severity
        }
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto cerrar después de 10 segundos para alertas no críticas
      if (alert.severity !== 'extreme') {
        setTimeout(() => notification.close(), 10000);
      }
    }
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Marcar notificación como leída
  const markNotificationAsRead = useCallback((alertId: string) => {
    setNotifications(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Configurar intervalos de actualización
  useEffect(() => {
    if (!enableNotifications) return;

    // Cargar datos inicialmente
    loadWeatherData();

    // Configurar intervalo de actualización
    const interval = setInterval(loadWeatherData, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadWeatherData, refreshInterval, enableNotifications]);

  // Configurar notificación diaria
  useEffect(() => {
    if (!settings.enableDailyForecast || !enableNotifications) return;

    const scheduleDailyNotification = () => {
      const now = new Date();
      const [hours, minutes] = settings.notificationTime.split(':').map(Number);
      
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);
      
      // Si ya pasó la hora de hoy, programar para mañana
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
      
      const timeUntilNotification = notificationTime.getTime() - now.getTime();
      
      const timeout = setTimeout(() => {
        if (weather && settings.enablePushNotifications) {
          sendDailyForecastNotification();
        }
        // Programar para el día siguiente
        scheduleDailyNotification();
      }, timeUntilNotification);

      return timeout;
    };

    const timeout = scheduleDailyNotification();
    return () => clearTimeout(timeout);
  }, [settings.enableDailyForecast, settings.notificationTime, settings.enablePushNotifications, weather, enableNotifications]);

  // Enviar notificación diaria del pronóstico
  const sendDailyForecastNotification = useCallback(() => {
    if (!weather || Notification.permission !== 'granted') return;

    const today = weather.forecast?.[0];
    if (!today) return;

    const notification = new Notification('Pronóstico Diario - Campo360', {
      body: `Hoy: ${today.description}. Max: ${today.maxTemp}°C, Min: ${today.minTemp}°C. Lluvia: ${today.precipitationChance}%`,
      icon: '/icons/weather-forecast.png',
      badge: '/icons/badge.png',
      tag: 'daily-forecast',
      data: {
        type: 'daily-forecast',
        date: today.date
      }
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 15000);
  }, [weather]);

  // Función para forzar actualización
  const forceRefresh = useCallback(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  // Verificar si los datos están desactualizados
  const isDataStale = useCallback(() => {
    if (!lastUpdate) return true;
    const staleThreshold = refreshInterval * 60 * 1000 * 1.5; // 1.5x el intervalo de actualización
    return (Date.now() - lastUpdate.getTime()) > staleThreshold;
  }, [lastUpdate, refreshInterval]);

  return {
    // Datos meteorológicos
    weather,
    loading,
    error,
    lastUpdate,
    isDataStale: isDataStale(),
    
    // Notificaciones
    notifications,
    unreadCount: notifications.length,
    
    // Configuraciones
    settings,
    updateSettings,
    
    // Acciones
    forceRefresh,
    requestNotificationPermission,
    markNotificationAsRead,
    clearAllNotifications
  };
}
