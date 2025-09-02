import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GlobalNews from '../components/GlobalNews';

describe('GlobalNews', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <GlobalNews />
      </BrowserRouter>
    );
    expect(screen.getByText('Global Verified News')).toBeInTheDocument();
    expect(screen.getByText('Displaying verified news stories from all regions.')).toBeInTheDocument();
  });
});