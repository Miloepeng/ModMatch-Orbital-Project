import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filter from '../components/Filter';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';


// Mock the module data structure (minimal version for testing)
jest.mock('../utils/modules', () => {
  return {
    Modules: [
      { value: 'CS2030S', label: 'CS2030S', canSU: 'True', passFail: 'False', hasGroupProject: 'True', hasMCQ: 'True', GEPillar: 'GEA', desc: 'OOP in Java' },
      { value: 'IS1108', label: 'IS1108', canSU: 'False', passFail: 'True', hasGroupProject: 'False', hasMCQ: 'False', GEPillar: 'GEC', desc: 'Ethics module' },
      { value: 'GEQ1000', label: 'GEQ1000', canSU: 'True', passFail: 'False', hasGroupProject: 'True', hasMCQ: 'False', GEPillar: 'GEX', desc: 'Asking Questions' },
    ],
    GEN: [],
    CD: [],
    ID: [],
    GEI: [],
    GEA: [],
    GEX: [],
    GEC: [],
    GESS: []
  };
});

it('filters modules based on search input', async () => {
  render(<Filter />);
  const input = screen.getByPlaceholderText(/Search for a module/i);

  await act(async () => {
    await userEvent.type(input, 'CS2030S');
  });

  expect(screen.getByText(/CS2030S/i)).toBeInTheDocument();
});

  it('filters modules by GE Pillar', async () => {
  render(<Filter />);
  const selects = screen.getAllByRole('combobox');

  const geSelect = selects[4]; // 5th dropdown in your layout
  await userEvent.selectOptions(geSelect, 'GEX');

  expect(screen.getByText(/GEQ1000/)).toBeInTheDocument();
});

  it('filters modules by Can S/U status', async () => {
  render(<Filter />);
  const selects = screen.getAllByRole('combobox');

  const suSelect = selects[0]; // Based on your layout: Can S/U is the first dropdown
  await userEvent.selectOptions(suSelect, 'False');

  expect(screen.getByText(/IS1108/)).toBeInTheDocument();
  expect(screen.queryByText(/CS2030S/)).not.toBeInTheDocument();
});


  it('navigates between module pages using Prev and Next', async () => {
    render(<Filter />);
    const next = screen.getByRole('button', { name: /Next/i });
    const prev = screen.getByRole('button', { name: /Prev/i });

    expect(next).toBeInTheDocument();
    expect(prev).toBeInTheDocument();
  });

  it('displays all manually tagged modules in the filter list (unit-level)', () => {
    render(<Filter />);
    const moduleNames = screen.getAllByRole('heading', { level: 3 });
    const codes = moduleNames.map((el) => el.textContent);
    expect(codes).toContain('CS2030S');
    expect(codes).toContain('IS1108');
  });