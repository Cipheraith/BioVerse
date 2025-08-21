import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from './pages/AboutPage';

describe('AboutPage', () => {
  it('renders the main heading', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );
    const headingElement = screen.getByText(/About BioVerse/i);
    expect(headingElement).toBeInTheDocument();
  });
});
