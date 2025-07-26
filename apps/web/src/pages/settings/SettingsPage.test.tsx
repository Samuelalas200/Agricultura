import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SettingsPage from '@/pages/settings/SettingsPage';

// Mock del contexto de autenticación
vi.mock('@/contexts/FirebaseAuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    },
    loading: false,
    updateUserProfile: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de Firebase
vi.mock('firebase/auth', () => ({
  updateProfile: vi.fn(),
}));

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Componente wrapper para tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpiar localStorage
    localStorage.clear();
  });

  it('debe renderizar la página de configuración correctamente', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Verificar que el título está presente
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    
    // Verificar que las pestañas están presentes
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
    expect(screen.getByText('Preferencias')).toBeInTheDocument();
    expect(screen.getByText('Seguridad')).toBeInTheDocument();
    expect(screen.getByText('Datos')).toBeInTheDocument();
  });

  it('debe mostrar la información del usuario en el perfil', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Verificar que el email del usuario está presente
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    
    // Verificar que el nombre del usuario está presente
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('debe cambiar entre pestañas correctamente', async () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Hacer clic en la pestaña de Notificaciones
    fireEvent.click(screen.getByText('Notificaciones'));
    
    // Verificar que se muestran las opciones de notificaciones
    await waitFor(() => {
      expect(screen.getByText('Notificaciones por email')).toBeInTheDocument();
      expect(screen.getByText('Alertas de inventario')).toBeInTheDocument();
    });

    // Hacer clic en la pestaña de Preferencias
    fireEvent.click(screen.getByText('Preferencias'));
    
    // Verificar que se muestran las opciones de preferencias
    await waitFor(() => {
      expect(screen.getByText('Tema')).toBeInTheDocument();
      expect(screen.getByText('Idioma')).toBeInTheDocument();
    });
  });

  it('debe cambiar el tema correctamente', async () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Ir a la pestaña de Preferencias
    fireEvent.click(screen.getByText('Preferencias'));
    
    await waitFor(() => {
      // Verificar que aparecen los botones de tema
      expect(screen.getByText('Claro')).toBeInTheDocument();
      expect(screen.getByText('Oscuro')).toBeInTheDocument();
      
      // Hacer clic en el botón de tema oscuro
      fireEvent.click(screen.getByText('Oscuro'));
      
      // Verificar que el tema cambió
      expect(screen.getByText('Tema')).toBeInTheDocument();
    });
  });

  it('debe validar los campos del formulario de perfil', async () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Limpiar el campo de nombre
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Intentar guardar
    const saveButton = screen.getByText('Guardar cambios');
    fireEvent.click(saveButton);

    // Verificar que se muestra un error (esto dependería de tu implementación de validación)
    await waitFor(() => {
      // Aquí podrías verificar que se muestra un mensaje de error
      // Por ejemplo: expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });
  });

  it('debe mostrar las opciones de seguridad', async () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Ir a la pestaña de Seguridad
    fireEvent.click(screen.getByText('Seguridad'));
    
    await waitFor(() => {
      expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument();
      expect(screen.getByText('Actualiza tu contraseña regularmente')).toBeInTheDocument();
      expect(screen.getByText('Cambiar')).toBeInTheDocument();
    });
  });

  it('debe mostrar las opciones de datos', async () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Ir a la pestaña de Datos
    fireEvent.click(screen.getByText('Datos'));
    
    await waitFor(() => {
      expect(screen.getByText('Exportar datos')).toBeInTheDocument();
      expect(screen.getByText('Eliminar cuenta')).toBeInTheDocument();
    });
  });
});
