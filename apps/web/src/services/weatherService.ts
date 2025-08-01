interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  description: string;
  icon: string;
  timestamp: Date;
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
  agricultural: AgriculturalData;
}

interface WeatherForecast {
  date: Date;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  precipitation: number;
  precipitationChance: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface WeatherAlert {
  id: string;
  type: 'rain' | 'frost' | 'drought' | 'wind' | 'hail' | 'extreme_temp';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  recommendations: string[];
}

interface AgriculturalData {
  soilTemperature: number;
  evapotranspiration: number;
  growingDegreeDays: number;
  irrigationRecommendation: 'none' | 'light' | 'moderate' | 'heavy';
  plantingConditions: 'poor' | 'fair' | 'good' | 'excellent';
  harvestConditions: 'poor' | 'fair' | 'good' | 'excellent';
  pestRisk: 'low' | 'medium' | 'high';
  diseaseRisk: 'low' | 'medium' | 'high';
}

interface WeatherLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
}

class WeatherService {
  private readonly apiKey: string;
  private readonly currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  private readonly geocodingUrl = 'https://api.openweathermap.org/geo/1.0';

  constructor() {
    // En producción, esto debería venir de variables de entorno
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key';
    
    if (this.apiKey === 'demo_key') {
      console.warn('⚠️ Using demo weather API key. Please add VITE_OPENWEATHER_API_KEY to .env.local');
    }
  }

  // Obtener coordenadas por nombre de ciudad
  async getLocationCoordinates(cityName: string): Promise<WeatherLocation[]> {
    try {
      const response = await fetch(
        `${this.geocodingUrl}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const locations = await response.json();
      return locations.map((loc: any) => ({
        lat: loc.lat,
        lon: loc.lon,
        name: loc.name,
        country: loc.country,
        state: loc.state
      }));
    } catch (error) {
      console.error('Error fetching location coordinates:', error);
      throw error;
    }
  }

  // Obtener datos meteorológicos completos
  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Obtener clima actual y pronóstico usando las APIs gratuitas (v2.5)
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${this.currentWeatherUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`),
        fetch(`${this.forecastUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`)
      ]);
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();
      
      return this.parseWeatherDataFromV25(currentData, forecastData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Retornar datos mock en caso de error para desarrollo
      return this.getMockWeatherData();
    }
  }

  // Obtener clima por nombre de ciudad
  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    const locations = await this.getLocationCoordinates(cityName);
    if (locations.length === 0) {
      throw new Error(`No se encontró la ubicación: ${cityName}`);
    }
    
    const location = locations[0];
    return this.getWeatherData(location.lat, location.lon);
  }

  // Parsear datos de las APIs v2.5 (gratuitas)
  private parseWeatherDataFromV25(currentData: any, forecastData: any): WeatherData {
    const current = currentData;
    const forecastList = forecastData.list || [];
    
    // Agrupar el pronóstico por días (cada 3 horas -> días)
    const dailyForecast = this.groupForecastByDays(forecastList);

    return {
      location: `${current.name}, ${current.sys.country}`,
      temperature: Math.round(current.main.temp),
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // Convertir m/s a km/h
      windDirection: current.wind.deg || 0,
      pressure: current.main.pressure,
      visibility: (current.visibility || 10000) / 1000, // Convertir a km
      uvIndex: 5, // Valor estimado para v2.5 (no disponible en free tier)
      cloudCover: current.clouds.all,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      timestamp: new Date(current.dt * 1000),
      forecast: dailyForecast.slice(0, 7), // Próximos 7 días
      alerts: this.generateMockAlerts(current), // Generar alertas basadas en condiciones
      agricultural: this.calculateAgriculturalDataV25(current, dailyForecast)
    };
  }

  // Agrupar pronóstico de 3 horas en días
  private groupForecastByDays(forecastList: any[]): WeatherForecast[] {
    const dailyData: { [key: string]: any[] } = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = [];
      }
      dailyData[dayKey].push(item);
    });

    return Object.entries(dailyData).map(([dateStr, dayItems]) => {
      const temps = dayItems.map(item => item.main.temp);
      const humidities = dayItems.map(item => item.main.humidity);
      const winds = dayItems.map(item => item.wind.speed);
      const precipitations = dayItems.map(item => (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0));
      
      // Encontrar el item del mediodía para descripción e icono
      const noonItem = dayItems.find(item => {
        const hour = new Date(item.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }) || dayItems[0];

      return {
        date: new Date(dateStr),
        maxTemp: Math.round(Math.max(...temps)),
        minTemp: Math.round(Math.min(...temps)),
        humidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
        precipitation: precipitations.reduce((a, b) => a + b, 0),
        precipitationChance: Math.round((noonItem.pop || 0) * 100),
        windSpeed: Math.round((winds.reduce((a, b) => a + b, 0) / winds.length) * 3.6),
        description: noonItem.weather[0].description,
        icon: noonItem.weather[0].icon
      };
    });
  }

  // Parsear día de pronóstico
  private parseForecastDay(day: any): WeatherForecast {
    return {
      date: new Date(day.dt * 1000),
      maxTemp: Math.round(day.temp.max),
      minTemp: Math.round(day.temp.min),
      humidity: day.humidity,
      precipitation: day.rain?.['1h'] || day.snow?.['1h'] || 0,
      precipitationChance: Math.round((day.pop || 0) * 100),
      windSpeed: Math.round(day.wind_speed * 3.6),
      description: day.weather[0].description,
      icon: day.weather[0].icon
    };
  }

  // Parsear alertas meteorológicas
  private parseAlert(alert: any): WeatherAlert {
    const type = this.categorizeAlertType(alert.event);
    const severity = this.categorizeAlertSeverity(alert.tags);

    return {
      id: alert.sender_name + alert.start,
      type,
      severity,
      title: alert.event,
      description: alert.description,
      startTime: new Date(alert.start * 1000),
      endTime: new Date(alert.end * 1000),
      recommendations: this.getRecommendationsForAlert(type, severity)
    };
  }

  // Calcular datos agrícolas
  // Generar alertas basadas en condiciones actuales (para APIs v2.5)
  private generateMockAlerts(current: any): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed * 3.6; // Convertir a km/h
    const description = current.weather[0].main.toLowerCase();

    // Alerta de temperatura extrema
    if (temp > 35) {
      alerts.push({
        type: 'extreme_temperature',
        severity: temp > 40 ? 'extreme' : 'high',
        title: 'Alerta de Calor Extremo',
        description: `Temperatura muy alta: ${Math.round(temp)}°C`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // +8 horas
        recommendations: [
          'Evitar trabajos de campo durante las horas más calurosas',
          'Aumentar la frecuencia de riego',
          'Proteger cultivos sensibles con mallas sombreadoras'
        ]
      });
    }

    if (temp < 5) {
      alerts.push({
        type: 'frost',
        severity: temp < 0 ? 'extreme' : 'high',
        title: 'Riesgo de Heladas',
        description: `Temperatura muy baja: ${Math.round(temp)}°C`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        recommendations: [
          'Proteger cultivos sensibles a las heladas',
          'Considerar sistemas de calefacción en invernaderos',
          'Cosechar productos maduros antes de la helada'
        ]
      });
    }

    // Alerta de viento fuerte
    if (windSpeed > 40) {
      alerts.push({
        type: 'wind',
        severity: windSpeed > 60 ? 'extreme' : 'high',
        title: 'Vientos Fuertes',
        description: `Velocidad del viento: ${Math.round(windSpeed)} km/h`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        recommendations: [
          'Asegurar estructuras temporales',
          'Evitar aplicaciones de pesticidas',
          'Proteger cultivos altos con tutores'
        ]
      });
    }

    // Alerta de lluvia (si está en la descripción)
    if (description.includes('rain') || description.includes('storm')) {
      alerts.push({
        type: 'rain',
        severity: description.includes('heavy') ? 'high' : 'medium',
        title: 'Precipitaciones Esperadas',
        description: `Condiciones: ${current.weather[0].description}`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        recommendations: [
          'Suspender trabajos de campo si hay lluvia intensa',
          'Verificar drenaje en cultivos sensibles',
          'Proteger equipos y maquinaria'
        ]
      });
    }

    return alerts;
  }

  // Calcular datos agrícolas adaptado para APIs v2.5
  private calculateAgriculturalDataV25(current: any, forecast: WeatherForecast[]): AgriculturalData {
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed; // Ya en m/s
    
    // Cálculos simplificados para datos agrícolas
    const soilTemperature = Math.round(temp - 2); // Aproximación
    const evapotranspiration = this.calculateEvapotranspiration(temp, humidity, windSpeed);
    const growingDegreeDays = Math.max(0, temp - 10); // Base 10°C
    
    return {
      soilTemperature,
      evapotranspiration,
      growingDegreeDays,
      irrigationRecommendation: this.getIrrigationRecommendation(temp, humidity, evapotranspiration),
      plantingConditions: this.getPlantingConditions(temp, humidity, windSpeed * 3.6), // Convertir a km/h
      harvestConditions: this.getHarvestConditionsV25(current, forecast),
      pestRisk: this.getPestRisk(temp, humidity),
      diseaseRisk: this.getDiseaseRisk(temp, humidity)
    };
  }

  // Condiciones de cosecha adaptadas para v2.5
  private getHarvestConditionsV25(current: any, forecast: WeatherForecast[]): 'poor' | 'fair' | 'good' | 'excellent' {
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const description = current.weather[0].main.toLowerCase();
    
    // Evaluar próximos días para decidir condiciones de cosecha
    const nextDays = forecast.slice(0, 3);
    const rainExpected = nextDays.some(day => day.precipitation > 5);
    const tempStable = nextDays.every(day => day.maxTemp > 15 && day.maxTemp < 35);
    
    if (description.includes('rain') || rainExpected) return 'poor';
    if (temp < 10 || temp > 35 || humidity > 85) return 'fair';
    if (tempStable && humidity < 70) return 'excellent';
    return 'good';
  }

  // Calcular evapotranspiración (ET0 simplificada)
  private calculateEvapotranspiration(temp: number, humidity: number, windSpeed: number): number {
    // Fórmula simplificada de Penman-Monteith
    const delta = 4098 * (0.6108 * Math.exp(17.27 * temp / (temp + 237.3))) / Math.pow(temp + 237.3, 2);
    const gamma = 0.665; // Constante psicrométrica aproximada
    const u2 = windSpeed * 0.748; // Convertir a m/s a 2m de altura
    
    const et0 = (0.408 * delta * (temp) + gamma * 900 / (temp + 273) * u2 * (0.01 * (100 - humidity))) / 
                (delta + gamma * (1 + 0.34 * u2));
    
    return Math.round(et0 * 10) / 10; // Redondear a 1 decimal
  }

  // Recomendaciones de riego
  private getIrrigationRecommendation(temp: number, humidity: number, et0: number): 'none' | 'light' | 'moderate' | 'heavy' {
    // Considerar temperatura y humedad además de ET0
    let adjustedET0 = et0;
    
    // Ajustar por temperatura extrema
    if (temp > 35) adjustedET0 += 1;
    if (temp < 10) adjustedET0 -= 1;
    
    // Ajustar por humedad
    if (humidity < 30) adjustedET0 += 0.5;
    if (humidity > 90) adjustedET0 -= 0.5;
    
    if (adjustedET0 < 2) return 'none';
    if (adjustedET0 < 4) return 'light';
    if (adjustedET0 < 6) return 'moderate';
    return 'heavy';
  }

  // Condiciones de siembra
  private getPlantingConditions(temp: number, humidity: number, windSpeed: number): 'poor' | 'fair' | 'good' | 'excellent' {
    let score = 0;
    
    // Temperatura ideal entre 15-25°C
    if (temp >= 15 && temp <= 25) score += 3;
    else if (temp >= 10 && temp <= 30) score += 2;
    else if (temp >= 5 && temp <= 35) score += 1;
    
    // Humedad ideal entre 60-80%
    if (humidity >= 60 && humidity <= 80) score += 2;
    else if (humidity >= 50 && humidity <= 90) score += 1;
    
    // Viento bajo ideal
    if (windSpeed < 10) score += 1;
    
    if (score >= 5) return 'excellent';
    if (score >= 4) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }

  // Condiciones de cosecha
  private getHarvestConditions(current: any, forecast: any[]): 'poor' | 'fair' | 'good' | 'excellent' {
    const nextThreeDays = forecast.slice(0, 3);
    const avgPrecipitation = nextThreeDays.reduce((sum, day) => sum + (day.pop || 0), 0) / 3;
    const avgHumidity = nextThreeDays.reduce((sum, day) => sum + day.humidity, 0) / 3;
    
    let score = 0;
    
    // Poca lluvia es mejor para cosecha
    if (avgPrecipitation < 0.1) score += 3;
    else if (avgPrecipitation < 0.3) score += 2;
    else if (avgPrecipitation < 0.5) score += 1;
    
    // Humedad moderada
    if (avgHumidity < 70) score += 2;
    else if (avgHumidity < 85) score += 1;
    
    // Viento moderado ayuda al secado
    if (current.wind_speed > 2 && current.wind_speed < 8) score += 1;
    
    if (score >= 5) return 'excellent';
    if (score >= 4) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }

  // Riesgo de plagas
  private getPestRisk(temp: number, humidity: number): 'low' | 'medium' | 'high' {
    // Las plagas prosperan con calor y humedad
    if (temp > 25 && humidity > 70) return 'high';
    if (temp > 20 && humidity > 60) return 'medium';
    return 'low';
  }

  // Riesgo de enfermedades
  private getDiseaseRisk(temp: number, humidity: number): 'low' | 'medium' | 'high' {
    // Los hongos prosperan con humedad alta
    if (humidity > 85) return 'high';
    if (humidity > 70 && temp > 15) return 'medium';
    return 'low';
  }

  // Categorizar tipos de alerta
  private categorizeAlertType(event: string): WeatherAlert['type'] {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('rain') || eventLower.includes('storm')) return 'rain';
    if (eventLower.includes('frost') || eventLower.includes('freeze')) return 'frost';
    if (eventLower.includes('drought')) return 'drought';
    if (eventLower.includes('wind')) return 'wind';
    if (eventLower.includes('hail')) return 'hail';
    if (eventLower.includes('heat') || eventLower.includes('cold')) return 'extreme_temp';
    return 'rain'; // default
  }

  // Categorizar severidad de alerta
  private categorizeAlertSeverity(tags: string[]): WeatherAlert['severity'] {
    if (!tags) return 'medium';
    const tagsStr = tags.join(' ').toLowerCase();
    if (tagsStr.includes('extreme') || tagsStr.includes('severe')) return 'extreme';
    if (tagsStr.includes('moderate')) return 'medium';
    if (tagsStr.includes('minor')) return 'low';
    return 'medium';
  }

  // Recomendaciones por tipo de alerta
  private getRecommendationsForAlert(type: WeatherAlert['type'], severity: WeatherAlert['severity']): string[] {
    const baseRecommendations: Record<string, string[]> = {
      rain: [
        'Proteger cultivos sensibles al exceso de agua',
        'Revisar sistemas de drenaje',
        'Posponer aplicaciones de fertilizantes'
      ],
      frost: [
        'Activar sistemas de protección antiheladas',
        'Cubrir cultivos sensibles',
        'Regar preventivamente si es posible'
      ],
      drought: [
        'Incrementar frecuencia de riego',
        'Aplicar mulch para conservar humedad',
        'Priorizar cultivos más valiosos'
      ],
      wind: [
        'Asegurar estructuras y equipos',
        'Proteger cultivos altos con tutores',
        'Posponer aplicaciones de pesticidas'
      ],
      hail: [
        'Instalar mallas antigranizo si es posible',
        'Proteger equipos y vehículos',
        'Revisar seguros agrícolas'
      ],
      extreme_temp: [
        'Ajustar horarios de trabajo',
        'Proteger cultivos sensibles',
        'Monitorear estado de los trabajadores'
      ]
    };

    const recommendations = baseRecommendations[type] || ['Mantener vigilancia de las condiciones'];
    
    // Agregar recomendaciones adicionales basadas en severidad
    if (severity === 'extreme' || severity === 'high') {
      recommendations.push('Considerar evacuación temporal de personal', 'Activar protocolos de emergencia');
    }
    
    return recommendations;
  }

  // Datos mock para desarrollo
  private getMockWeatherData(): WeatherData {
    return {
      location: 'San Salvador, El Salvador',
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      windDirection: 180,
      pressure: 1013,
      visibility: 10,
      uvIndex: 8,
      cloudCover: 30,
      description: 'Parcialmente nublado',
      icon: '02d',
      timestamp: new Date(),
      forecast: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          maxTemp: 30,
          minTemp: 22,
          humidity: 70,
          precipitation: 0.2,
          precipitationChance: 20,
          windSpeed: 15,
          description: 'Lluvia ligera',
          icon: '10d'
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          maxTemp: 32,
          minTemp: 24,
          humidity: 60,
          precipitation: 0,
          precipitationChance: 5,
          windSpeed: 10,
          description: 'Soleado',
          icon: '01d'
        }
      ],
      alerts: [
        {
          id: 'mock-alert-1',
          type: 'rain',
          severity: 'medium',
          title: 'Lluvia moderada esperada',
          description: 'Se esperan lluvias moderadas en las próximas 48 horas',
          startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
          recommendations: [
            'Proteger cultivos sensibles al exceso de agua',
            'Revisar sistemas de drenaje'
          ]
        }
      ],
      agricultural: {
        soilTemperature: 26,
        evapotranspiration: 4.2,
        growingDegreeDays: 18,
        irrigationRecommendation: 'moderate',
        plantingConditions: 'good',
        harvestConditions: 'fair',
        pestRisk: 'medium',
        diseaseRisk: 'medium'
      }
    };
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, WeatherForecast, WeatherAlert, AgriculturalData, WeatherLocation };
