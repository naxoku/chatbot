/**
 * Test Suite para LoadingIndicator
 * Verifica funcionalidad básica y renderizado correcto
 */

import { render, screen } from '@testing-library/react';
import LoadingIndicator from '../components/LoadingIndicator';

describe('LoadingIndicator', () => {
  test('renderiza correctamente con mensaje por defecto', () => {
    render(<LoadingIndicator />);
    
    const loadingText = screen.getByText('Cargando...');
    expect(loadingText).toBeInTheDocument();
  });

  test('renderiza con mensaje personalizado', () => {
    const customMessage = 'Procesando solicitud...';
    render(<LoadingIndicator message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('renderiza correctamente en modo oscuro', () => {
    render(<LoadingIndicator isDarkMode={true} />);
    
    const container = document.querySelector('div[class*="bg-blue-500/10"]');
    expect(container).toBeInTheDocument();
    
    const text = screen.getByText('Cargando...');
    expect(text).toHaveClass('text-gray-300');
  });

  test('renderiza correctamente en modo claro', () => {
    render(<LoadingIndicator isDarkMode={false} />);
    
    const container = document.querySelector('div[class*="bg-blue-50"]');
    expect(container).toBeInTheDocument();
    
    const text = screen.getByText('Cargando...');
    expect(text).toHaveClass('text-gray-700');
  });

  test('renderiza con diferentes tipos', () => {
    const { rerender } = render(<LoadingIndicator type="processing" />);
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    
    rerender(<LoadingIndicator type="saving" message="Guardando..." />);
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });

  test('incluye ícono de spinner', () => {
    render(<LoadingIndicator />);
    
    const spinner = document.querySelector('i[class*="fa-spinner"]');
    expect(spinner).toBeInTheDocument();
  });
});