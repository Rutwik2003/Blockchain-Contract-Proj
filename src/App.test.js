import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Welcome to Charity DAO heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Welcome to Charity DAO/i);
  expect(headingElement).toBeInTheDocument();
});