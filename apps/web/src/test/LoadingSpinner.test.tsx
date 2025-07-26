import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    renderWithRouter(<LoadingSpinner />)
    
    // El spinner debería estar en el documento usando selector de clase
    const spinnerElement = document.querySelector('.loading-spinner')
    expect(spinnerElement).toBeInTheDocument()
  })

  it('renders spinner with proper class', () => {
    renderWithRouter(<LoadingSpinner />)
    
    const spinnerElement = document.querySelector('.loading-spinner')
    expect(spinnerElement).toBeInTheDocument()
  })
})
