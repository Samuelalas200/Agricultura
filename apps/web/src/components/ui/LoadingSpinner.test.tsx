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

  it('debe aplicar el tamaño por defecto (md)', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('debe aplicar el tamaño grande', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('debe aplicar el tamaño pequeño', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('debe aplicar clases CSS personalizadas', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(customClass);
    expect(spinner).toHaveClass('loading-spinner'); // Clase base siempre presente
  });

  it('debe mantener las clases base independientemente de las props', () => {
    render(<LoadingSpinner size="lg" className="custom-class" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
    expect(spinner).toHaveClass('custom-class');
  });
});
