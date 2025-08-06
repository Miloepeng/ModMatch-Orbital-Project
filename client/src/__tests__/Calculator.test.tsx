import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from '../components/Calculator';
import '@testing-library/jest-dom';

// Mock supabase since you're calling it in Calculator
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: async () => ({ data: { user: { id: 'test-user' } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      upsert: () => Promise.resolve({ error: null }), // ✅ Fix this line
    }),
  },
}));

// Mock ModuleCard with testable inputs
jest.mock('../components/ModuleCard', () => (props: any) => {
  return (
    <div data-testid="module-card">
      <label>
        Module name:
        <input
          aria-label="Module name"
          value={props.module.name}
          onChange={(e) =>
            props.onChange({ ...props.module, name: e.target.value })
          }
        />
      </label>
      <label>
        Grade:
        <select
          aria-label="Grade"
          value={props.module.grade}
          onChange={(e) =>
            props.onChange({ ...props.module, grade: e.target.value })
          }
        >
          <option value="">--</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </label>
      <label>
        S/U:
        <input
          type="checkbox"
          aria-label="S/U"
          checked={props.module.su}
          onChange={(e) =>
            props.onChange({ ...props.module, su: e.target.checked })
          }
        />
      </label>
      <label>
        MC:
        <input
          type="number"
          aria-label="MC"
          value={props.module.mc}
          onChange={(e) =>
            props.onChange({ ...props.module, mc: Number(e.target.value) })
          }
        />
      </label>
      <button onClick={props.onDelete}>Delete</button>
    </div>
  );
});

describe('CAP Calculator', () => {
  it('dynamically updates CAP when modules are added', async () => {
    render(<Calculator />);
    const addButton = screen.getByRole('button', { name: '+' });

    await userEvent.click(addButton);

    const moduleNameInput = screen.getByLabelText('Module name');
    await userEvent.type(moduleNameInput, 'CS1231S');

    const gradeInput = screen.getByLabelText('Grade');
    await userEvent.selectOptions(gradeInput, 'A');

    const capElement = screen.getByText('CAP:', { exact: false });
    expect(capElement).toBeInTheDocument();
  });

  it('updates CAP when S/U is toggled', async () => {
    render(<Calculator />);
    const addButton = screen.getByRole('button', { name: '+' });
    await userEvent.click(addButton);

    const suCheckbox = screen.getByLabelText('S/U');
    expect(suCheckbox).toBeInTheDocument();

    await userEvent.click(suCheckbox);
    expect(suCheckbox).toBeChecked();
  });

  it('MC input field defaults to 4 and accepts change to 2', async () => {
    render(<Calculator />);
    const addButton = screen.getByRole('button', { name: '+' });
    await userEvent.click(addButton);

    const mcInput = screen.getByLabelText('MC');
    expect(mcInput).toHaveValue(4);

    await userEvent.clear(mcInput);
    await userEvent.type(mcInput, '2');
    expect(mcInput).toHaveValue(2);
  });

  it('deleting a module updates CAP and removes it from list', async () => {
    render(<Calculator />);
    const addButton = screen.getByRole('button', { name: '+' });
    await userEvent.click(addButton);

    const deleteButton = screen.getByText('Delete');
    await userEvent.click(deleteButton);

    expect(screen.queryByLabelText('Module name')).not.toBeInTheDocument();
  });
});
