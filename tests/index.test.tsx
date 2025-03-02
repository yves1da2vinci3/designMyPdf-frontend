import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple component to test
const HomePage = () => <div>you are going to be redirected to the login page...</div>;

describe('Index page', () => {
  it('has redirect message to login page', () => {
    render(<HomePage />);
    expect(
      screen.getByText('you are going to be redirected to the login page...'),
    ).toBeInTheDocument();
  });
});
