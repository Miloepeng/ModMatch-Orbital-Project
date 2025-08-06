import React from 'react';
import { render, screen } from '@testing-library/react';
import Search from '../pages/Search';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

// Mock fetch for /similarities.json
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        modules: ['CS2040S', 'CS2103T', 'CS2102', 'CS3243', 'CS1231S'],
        similarities: [
          [['CS2103T', 0.9], ['CS2102', 0.8], ['CS3243', 0.7]], // for CS2040S
          [['CS2040S', 0.9]],
          [['CS2040S', 0.8]],
          [['CS2040S', 0.7]],
          [['CS2103T', 0.6]],
        ],
      }),
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => '',
    } as Response)
  ) as jest.Mock;
});

// Mock Supabase auth + fetch
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                modules_json: [
                  { name: 'CS2040S', grade: 'A' },
                  { name: 'CS1231S', grade: 'B+' },
                ],
              },
              error: null
            }),
        }),
      }),
    }),
  },
}));

describe('Module Recommender in Search page', () => {
  it('retrieves top 3 performing modules from user history', async () => {
    render(<Search />);

    const cards = await screen.findAllByText(
      (_, el) => Boolean(el?.textContent?.includes('because you did well in')),
      {},
      { timeout: 3000 }
    );
    expect(cards.length).toBeGreaterThan(0);
  });

  it('excludes already-taken modules from recommendations', async () => {
    render(<Search />);

    const cards = await screen.findAllByText(
      (_, el) => Boolean(el?.textContent?.includes('because you did well in')),
      {},
      { timeout: 3000 }
    );

    const takenModules = ['CS2040S', 'CS1231S'];
    takenModules.forEach((mod) => {
      const match = cards.find((card) => card.textContent?.includes(mod));
      expect(match).toBeUndefined();
    });
  });

  it('respects cosine similarity sorting (first available match)', async () => {
    render(<Search />);

    const cards = await screen.findAllByText(
      (_, el) => Boolean(el?.textContent?.includes('because you did well in')),
      {},
      { timeout: 3000 }
    );

    const expected = ['CS2103T', 'CS2102'];
    expected.forEach((mod, i) => {
      expect(cards[i]?.textContent).toContain(mod);
    });
  });
});



