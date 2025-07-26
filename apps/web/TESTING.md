# 🧪 Guía de Testing Automatizado - Campo360

## 📋 Descripción

Este documento describe el sistema de pruebas automatizadas implementado en Campo360 usando **Vitest** y **React Testing Library**. El sistema permite ejecutar pruebas unitarias, de integración y generar reportes de cobertura de código.

## 🛠️ Tecnologías Utilizadas

- **Vitest**: Framework de testing moderno y rápido para Vite
- **React Testing Library**: Librería para testing de componentes React
- **jsdom**: Ambiente de DOM simulado para Node.js
- **@testing-library/jest-dom**: Matchers adicionales para testing

## 📁 Estructura de Archivos

```
apps/web/
├── src/
│   ├── test/
│   │   └── setup.ts                 # Configuración global de tests
│   ├── components/
│   │   └── ui/
│   │       └── LoadingSpinner.test.tsx
│   ├── contexts/
│   │   └── ThemeContext.test.tsx
│   └── pages/
│       └── settings/
│           └── SettingsPage.test.tsx
├── vitest.config.ts               # Configuración de Vitest
└── package.json                   # Scripts de testing
```

## 🚀 Scripts Disponibles

```bash
# Ejecutar pruebas en modo watch (recomendado para desarrollo)
pnpm test

# Ejecutar todas las pruebas una sola vez
pnpm test:run

# Ejecutar pruebas con interfaz web
pnpm test:ui

# Ejecutar pruebas con reporte de cobertura
pnpm test:coverage

# Ejecutar una prueba específica
pnpm test:run ruta/al/archivo.test.tsx
```

## 📝 Convenciones de Naming

- **Archivos de test**: `ComponentName.test.tsx` o `functionName.test.ts`
- **Ubicación**: Junto al archivo que está siendo probado
- **Test suites**: Usar `describe()` para agrupar tests relacionados
- **Test cases**: Usar `it()` o `test()` con descripción clara

## 🧩 Tipos de Tests

### 1. Tests de Componentes UI

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('debe renderizar el spinner por defecto', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner');
  });
});
```

### 2. Tests de Contextos React

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

describe('ThemeContext', () => {
  it('debe cambiar el tema correctamente', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });
});
```

### 3. Tests de Páginas Completas

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import SettingsPage from '@/pages/settings/SettingsPage';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('SettingsPage', () => {
  it('debe renderizar la página correctamente', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });
});
```

## 🎯 Mejores Prácticas

### ✅ Recomendaciones

1. **Naming claro**: Los nombres de tests deben describir exactamente qué se está probando
2. **Tests independientes**: Cada test debe poder ejecutarse independientemente
3. **Arrange-Act-Assert**: Organizar tests en tres secciones claras
4. **Mocks mínimos**: Solo hacer mock de dependencias externas necesarias
5. **Test user behavior**: Probar comportamiento del usuario, no implementación

### ❌ Evitar

1. **Tests frágiles**: No testear detalles de implementación
2. **Tests dependientes**: No depender del orden de ejecución
3. **Mocks excesivos**: No hacer mock de todo
4. **Tests sin valor**: No escribir tests solo por cobertura

## 🔧 Configuración de Mocks

### Firebase Auth Mock
```typescript
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
}));
```

### React Router Mock
```typescript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
  };
});
```

## 📊 Reporte de Cobertura

Para generar un reporte de cobertura:

```bash
pnpm test:coverage
```

Esto generará:
- **Reporte en terminal**: Mostrará porcentajes por archivo
- **Reporte HTML**: En `coverage/index.html` para navegador
- **Reporte JSON**: En `coverage/coverage-final.json` para CI/CD

### Métricas de Cobertura

- **Statements**: Líneas de código ejecutadas
- **Branches**: Ramas condicionales cubiertas
- **Functions**: Funciones llamadas
- **Lines**: Líneas físicas de código

### Objetivo de Cobertura
- **Componentes UI**: 80%+ de cobertura
- **Lógica de negocio**: 90%+ de cobertura
- **Utilidades**: 95%+ de cobertura

## 🚀 Integración con CI/CD

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage
```

## 🐛 Debugging Tests

### Debugging en VS Code
1. Agregar breakpoints en el código de test
2. Usar "Debug Test" en el editor
3. Inspeccionar variables y estado

### Logging en Tests
```typescript
import { screen } from '@testing-library/react';

// Ver qué elementos están renderizados
screen.debug();

// Ver elemento específico
screen.debug(screen.getByTestId('my-element'));
```

### Test Queries útiles
```typescript
// Buscar por texto
screen.getByText('Submit');

// Buscar por rol
screen.getByRole('button');

// Buscar por test-id (recomendado)
screen.getByTestId('submit-button');

// Buscar por label
screen.getByLabelText('Email');

// Versiones que no fallan si no encuentra
screen.queryByText('Not found'); // retorna null
screen.findByText('Async text'); // retorna Promise
```

## 📚 Recursos Adicionales

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest-DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎉 Comandos Rápidos

```bash
# Setup inicial (ya configurado)
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom @vitest/ui

# Ejecutar tests específicos por patrón
pnpm test:run --grep "LoadingSpinner"

# Ejecutar tests en modo watch con UI
pnpm test:ui

# Ejecutar tests y mostrar solo fallos
pnpm test:run --reporter=verbose

# Ejecutar tests con timeout mayor
pnpm test:run --testTimeout=10000
```

---

*Documentación actualizada: Diciembre 2024*
*Sistema implementado para Campo360 - Sistema integral de gestión agrícola*
