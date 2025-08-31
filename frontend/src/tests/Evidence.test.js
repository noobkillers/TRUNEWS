import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../components/AuthContext';
import Evidence from '../components/Evidence';

describe('Evidence', () => {
  const mockToken = 'mock-token';

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ token: mockToken }}>
        <Evidence />
      </AuthContext.Provider>
    );

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Submit Evidence')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type (image, video, document)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Latitude')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Longitude')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Source Confidence (0-1)')).toBeInTheDocument();
  });

  it('updates input fields', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Type (image, video, document)'), { target: { value: 'image' } });
    fireEvent.change(screen.getByPlaceholderText('Latitude'), { target: { value: '35.6895' } });
    fireEvent.change(screen.getByPlaceholderText('Longitude'), { target: { value: '139.6917' } });
    fireEvent.change(screen.getByPlaceholderText('Source Confidence (0-1)'), { target: { value: '0.9' } });

    expect(screen.getByPlaceholderText('Type (image, video, document)').value).toBe('image');
    expect(screen.getByPlaceholderText('Latitude').value).toBe('35.6895');
    expect(screen.getByPlaceholderText('Longitude').value).toBe('139.6917');
    expect(screen.getByPlaceholderText('Source Confidence (0-1)').value).toBe('0.9');
  });
});