import { useState, useEffect } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';
import { weatherService, WeatherLocation } from '../../services/weatherService';

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (location: string, coordinates?: { lat: number; lon: number }) => void;
  className?: string;
}

export function LocationSelector({ currentLocation, onLocationChange, className = '' }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  // Ciudades predefinidas para El Salvador
  const predefinedLocations = [
    { name: 'San Salvador', country: 'SV', lat: 13.6929, lon: -89.2182 },
    { name: 'Santa Ana', country: 'SV', lat: 13.9942, lon: -89.5598 },
    { name: 'San Miguel', country: 'SV', lat: 13.4833, lon: -88.1833 },
    { name: 'Sonsonate', country: 'SV', lat: 13.7186, lon: -89.7244 },
    { name: 'Ahuachapán', country: 'SV', lat: 13.9211, lon: -89.8450 },
    { name: 'Usulután', country: 'SV', lat: 13.3500, lon: -88.4500 },
    { name: 'La Unión', country: 'SV', lat: 13.3369, lon: -87.8439 }
  ];

  useEffect(() => {
    if (searchTerm && searchTerm.length > 2) {
      searchLocations();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchLocations = async () => {
    try {
      setLoading(true);
      const results = await weatherService.getLocationCoordinates(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: WeatherLocation) => {
    const locationName = `${location.name}, ${location.country}`;
    setSelectedLocation(locationName);
    onLocationChange(locationName, { lat: location.lat, lon: location.lon });
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handlePredefinedLocationSelect = (location: any) => {
    const locationName = `${location.name}, El Salvador`;
    setSelectedLocation(locationName);
    onLocationChange(locationName, { lat: location.lat, lon: location.lon });
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en tu navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Usar reverse geocoding para obtener el nombre de la ubicación
          // Por simplicidad, usamos coordenadas directamente
          const locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setSelectedLocation(locationName);
          onLocationChange(locationName, { lat: latitude, lon: longitude });
          setIsOpen(false);
        } catch (error) {
          console.error('Error getting location name:', error);
          alert('Error al obtener la ubicación');
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        alert('Error al acceder a la ubicación. Verifica los permisos.');
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">{selectedLocation || 'Seleccionar ubicación'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Header con búsqueda */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Seleccionar Ubicación</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Opción de ubicación actual */}
            <div className="p-3 border-b border-gray-100">
              <button
                onClick={getCurrentLocation}
                className="w-full flex items-center space-x-3 text-left hover:bg-blue-50 rounded-lg p-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-600">Usar mi ubicación actual</p>
                  <p className="text-xs text-blue-500">Detectar automáticamente</p>
                </div>
              </button>
            </div>

            {/* Resultados de búsqueda */}
            {searchTerm && (
              <div className="border-b border-gray-100">
                {loading && (
                  <div className="p-4 text-center text-gray-500">
                    Buscando ubicaciones...
                  </div>
                )}
                
                {!loading && searchResults.length > 0 && (
                  <div>
                    <p className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                      Resultados de búsqueda
                    </p>
                    {searchResults.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full flex items-center justify-between text-left hover:bg-gray-50 px-3 py-2 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{location.name}</p>
                          <p className="text-xs text-gray-500">
                            {location.state && `${location.state}, `}{location.country}
                          </p>
                        </div>
                        {selectedLocation === `${location.name}, ${location.country}` && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {!loading && searchTerm.length > 2 && searchResults.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron ubicaciones
                  </div>
                )}
              </div>
            )}

            {/* Ubicaciones predefinidas */}
            {!searchTerm && (
              <div>
                <p className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  El Salvador - Ciudades principales
                </p>
                {predefinedLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handlePredefinedLocationSelect(location)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 px-3 py-2 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{location.name}</p>
                      <p className="text-xs text-gray-500">El Salvador</p>
                    </div>
                    {selectedLocation === `${location.name}, El Salvador` && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
