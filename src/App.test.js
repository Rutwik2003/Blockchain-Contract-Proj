import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Blockchain Transaction Logger heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Blockchain Transaction Logger/i);
  expect(headingElement).toBeInTheDocument();
});