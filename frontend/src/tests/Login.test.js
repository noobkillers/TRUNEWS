import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import Login from '../components/Login';

describe('Login', () => {
  const mockSetToken = jest.fn();
  const mockSetRole = jest.fn();
  const mockNavigate = jest.fn();

  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  const renderComponent = () =>
    render(
      <AuthContext.Provider value={{ setToken: mockSetToken, setRole: mockSetRole }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Role (contributor/editor)')).toBeInTheDocument();
  });

  it('updates input fields', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'testpass' } });
    fireEvent.change(screen.getByPlaceholderText('Role (contributor/editor)'), { target: { value: 'editor' } });

    expect(screen.getByPlaceholderText('Username').value).toBe('testuser');
    expect(screen.getByPlaceholderText('Password').value).toBe('testpass');
    expect(screen.getByPlaceholderText('Role (contributor/editor)').value).toBe('editor');
  });
});