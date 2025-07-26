import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    // Limpiar las clases del documento
    document.documentElement.className = '';
    document.body.removeAttribute('data-theme');
    vi.clearAllMocks();
  });

  it('debe inicializar con tema claro por defecto', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');
  });

  it('debe cambiar el tema correctamente', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('debe alternar entre temas', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Inicialmente debería ser claro
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    // Debería cambiar a oscuro
    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    // Debería volver a claro
    expect(result.current.theme).toBe('light');
  });

  it('debe cargar el tema desde localStorage', () => {
    // Establecer un tema en localStorage antes de renderizar
    localStorage.setItem('theme', 'dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('dark');
  });

  it('debe detectar preferencia del sistema cuando no hay tema guardado', () => {
    // Mock de matchMedia para simular preferencia de tema oscuro
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Cuando la preferencia del sistema es oscura, el tema debería ser oscuro
    expect(result.current.theme).toBe('dark');
  });

  it('debe actualizar las clases del documento', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.body.getAttribute('data-theme')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });

  it('debe persistir el tema en localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('debe lanzar error si se usa fuera del provider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });

  it('debe manejar temas inválidos en localStorage', () => {
    // Establecer un tema inválido en localStorage
    localStorage.setItem('theme', 'invalid-theme');

    // Mock de matchMedia para controlar la preferencia del sistema
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false, // Simular preferencia de tema claro
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Debería usar la preferencia del sistema
    expect(result.current.theme).toBe('light');
  });
});
