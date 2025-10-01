import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchFilters } from '../../src/components/SearchFilters';

// Mock fetch
global.fetch = jest.fn();

describe('SearchFilters Component', () => {
  const mockOnFiltersChange = jest.fn();

  const defaultFilters = {
    query: '',
    startDate: null,
  };

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: mockOnFiltersChange,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input field', () => {
    render(<SearchFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search by title, description, location/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onFiltersChange when user submits search form', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search by title, description, location/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(searchInput, 'beach house');
    await user.click(searchButton);

    expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
      ...defaultFilters,
      query: 'beach house'
    });
  });

  it('renders date picker', () => {
    render(<SearchFilters {...defaultProps} />);
    
    // Check for date picker button
    expect(screen.getByText(/select date/i)).toBeInTheDocument();
  });
});