import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  ExternalLink,
  FileText,
  Video,
  Users
} from 'lucide-react';

export default function HelpPage() {
  const helpSections = [
    {
      title: 'Primeros pasos',
      description: 'Aprende los conceptos básicos de la plataforma',
      icon: Book,
      items: [
        'Configurar tu primera finca',
        'Crear usuarios y roles',
        'Navegación básica',
        'Configuración inicial'
      ]
    },
    {
      title: 'Gestión de inventario',
      description: 'Administra tu inventario de manera eficiente',
      icon: FileText,
      items: [
        'Agregar productos al inventario',
        'Registrar movimientos',
        'Gestionar compras',
        'Generar reportes'
      ]
    },
    {
      title: 'Tareas y cultivos',
      description: 'Organiza tu trabajo agrícola',
      icon: Users,
      items: [
        'Crear y asignar tareas',
        'Gestionar cultivos',
        'Programar actividades',
        'Seguimiento de progreso'
      ]
    }
  ];

  const faqItems = [
    {
      question: '¿Cómo puedo agregar un nuevo producto al inventario?',
      answer: 'Ve a la sección de Inventario y haz clic en "Nuevo item". Completa los campos requeridos como nombre, categoría, cantidad y precios.'
    },
    {
      question: '¿Puedo exportar mis datos?',
      answer: 'Sí, puedes exportar datos desde cada sección. En inventario puedes generar PDFs, y en configuración encontrarás opciones para exportar todos tus datos.'
    },
    {
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a Configuración > Seguridad. Allí encontrarás la opción para solicitar un cambio de contraseña que se enviará a tu correo electrónico.'
    },
    {
      question: '¿Qué tipos de movimientos de inventario puedo registrar?',
      answer: 'Puedes registrar tres tipos: Entrada (nueva mercancía), Salida (consumo o venta), y Ajuste (correcciones de inventario).'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-blue-600" />
          Centro de Ayuda
        </h1>
        <p className="mt-2 text-gray-600">
          Encuentra respuestas a tus preguntas y aprende a usar la plataforma
        </p>
      </div>

      {/* Secciones de ayuda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {helpSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Preguntas frecuentes */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {item.question}
              </h3>
              <p className="text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Videos tutoriales */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Videos Tutoriales
          </h2>
        </div>
        <p className="text-gray-700 mb-4">
          Aprende visualmente con nuestros tutoriales en video
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Introducción a la plataforma
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Conoce las principales funcionalidades en 5 minutos
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver video
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Gestión de inventario
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Aprende a administrar tu inventario eficientemente
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver video
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Chat en vivo
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Habla con nuestro equipo de soporte
          </p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
            Iniciar chat
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Correo electrónico
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Envíanos tus preguntas por email
          </p>
          <a 
            href="mailto:soporte@agricultura.com"
            className="w-full inline-block text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Enviar email
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Teléfono
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Llámanos de lunes a viernes
          </p>
          <a 
            href="tel:+1234567890"
            className="w-full inline-block text-center bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            +1 (234) 567-890
          </a>
        </div>
      </div>
    </div>
  );
}
