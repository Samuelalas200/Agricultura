import { useState } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Save,
  Camera,
  Mail,
  Phone,
  Globe,
  Moon,
  Sun,
  Key,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { updateProfile } from 'firebase/auth';
import { toast } from '../../components/ui/Toaster';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
  });
  const [settings, setSettings] = useState({
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    inventoryAlerts: localStorage.getItem('inventoryAlerts') !== 'false',
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'es',
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'preferences', label: 'Preferencias', icon: Palette },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'data', label: 'Datos', icon: Database },
  ];

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      await updateProfile(currentUser, {
        displayName: formData.displayName,
      });
      toast.success('Perfil actualizado', 'Los cambios se han guardado correctamente');
    } catch (error) {
      toast.error('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleSaveSettings = (key: string, value: any) => {
    localStorage.setItem(key, value.toString());
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Configuración guardada', 'Los cambios se han aplicado');
  };

  const handlePasswordReset = () => {
    toast.info('Cambio de contraseña', 'Se ha enviado un enlace a tu correo electrónico');
  };

  const handleExportData = () => {
    toast.success('Exportación iniciada', 'Recibirás un email con tus datos en breve');
  };

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      toast.error('Eliminación pendiente', 'Tu solicitud está siendo procesada');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu cuenta y preferencias de la aplicación
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Información del Perfil</h2>
                
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Foto de perfil</h3>
                    <p className="text-sm text-gray-500">Sube una imagen para personalizar tu perfil</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">Notificaciones por email</h3>
                        <p className="text-sm text-gray-500">Recibe notificaciones importantes por correo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSaveSettings('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">Alertas de inventario</h3>
                        <p className="text-sm text-gray-500">Notificaciones cuando el stock esté bajo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.inventoryAlerts}
                        onChange={(e) => handleSaveSettings('inventoryAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Preferencias</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSaveSettings('theme', 'light')}
                        className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                          settings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        <span>Claro</span>
                      </button>
                      <button
                        onClick={() => handleSaveSettings('theme', 'dark')}
                        className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                          settings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        <span>Oscuro</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <select
                        value={settings.language}
                        onChange={(e) => handleSaveSettings('language', e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">Cambiar contraseña</h3>
                          <p className="text-sm text-gray-500">Actualiza tu contraseña regularmente</p>
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordReset}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Gestión de Datos</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Download className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">Exportar datos</h3>
                          <p className="text-sm text-gray-500">Descarga una copia de toda tu información</p>
                        </div>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Exportar
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <div>
                          <h3 className="font-medium text-red-900">Eliminar cuenta</h3>
                          <p className="text-sm text-red-700">Elimina permanentemente tu cuenta y todos los datos</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
