import { render, screen, fireEvent } from '@testing-library/react';
import AnamnesisLink from '../../app/components/AnamnesisLink';

// Mock del router de Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AnamnesisLink', () => {
  const patientId = 'test-patient-id';

  it('renderiza correctamente con datos completos', () => {
    render(<AnamnesisLink patientId={patientId} hasData={true} isComplete={true} />);
    
    expect(screen.getByText('Anamnesis')).toBeInTheDocument();
    expect(screen.getByText('Anamnesis completa')).toBeInTheDocument();
    expect(screen.getByText('Completa')).toBeInTheDocument();
  });

  it('renderiza correctamente con datos incompletos', () => {
    render(<AnamnesisLink patientId={patientId} hasData={true} isComplete={false} />);
    
    expect(screen.getByText('Anamnesis')).toBeInTheDocument();
    expect(screen.getByText('Anamnesis incompleta')).toBeInTheDocument();
    expect(screen.getByText('Incompleta')).toBeInTheDocument();
  });

  it('renderiza correctamente sin datos', () => {
    render(<AnamnesisLink patientId={patientId} hasData={false} isComplete={false} />);
    
    expect(screen.getByText('Anamnesis')).toBeInTheDocument();
    expect(screen.getByText('Aún no has completado tu anamnesis')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('cambia el estilo al pasar el mouse por encima', () => {
    render(<AnamnesisLink patientId={patientId} hasData={true} isComplete={true} />);
    
    const link = screen.getByRole('link');
    
    // Verifica que inicialmente no tenga la clase de hover
    expect(link.className).not.toContain('ring-2 ring-blue-400');
    
    // Simula el evento hover
    fireEvent.mouseEnter(link);
    
    // Verifica que ahora tenga la clase de hover
    expect(link.className).toContain('ring-2 ring-blue-400');
    
    // Simula el evento de salida del hover
    fireEvent.mouseLeave(link);
    
    // Verifica que ya no tenga la clase de hover
    expect(link.className).not.toContain('ring-2 ring-blue-400');
  });

  it('tiene el href correcto con el ID del paciente', () => {
    render(<AnamnesisLink patientId={patientId} hasData={true} isComplete={true} />);
    
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe(`/dashboard/paciente/${patientId}/anamnesis`);
  });
});
