import { render, screen } from '@/test-utils';
import Welcome from './Welcome';

describe('Welcome component', () => {
  it('has correct transactional.dev link', () => {
    render(<Welcome />);
    expect(screen.getByText('this one')).toHaveAttribute('href', 'https://transactional.dev/');
  });
});
