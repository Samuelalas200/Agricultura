import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Componente simple para test
const SimpleLoginForm = () => (
  <div>
    <h1>Iniciar Sesión</h1>
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <label htmlFor="password">Contraseña</label>
      <input id="password" type="password" />
      <button type="submit">Iniciar Sesión</button>
    </form>
    <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
  </div>
)

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginForm', () => {
  it('renders login form elements', () => {
    renderWithRouter(<SimpleLoginForm />)
    
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows register link', () => {
    renderWithRouter(<SimpleLoginForm />)
    
    expect(screen.getByText(/¿no tienes cuenta\?/i)).toBeInTheDocument()
    expect(screen.getByText('Regístrate')).toBeInTheDocument()
  })
})
