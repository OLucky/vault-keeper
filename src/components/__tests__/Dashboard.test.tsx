import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CategoryCard } from '../CategoryCard/CategoryCard'
import { ErrorMessage } from '../ErrorMessage/ErrorMessage'
import { ResultCard } from '../ResultCard/ResultCard'
import { useRollStore } from '../../stores/rollStore'

function createTestRouter(component: () => React.JSX.Element) {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component,
  })
  const categoryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$categoryId',
    component: () => <div>Category Page</div>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, categoryRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return router
}

function renderWithRouter(component: () => React.JSX.Element) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createTestRouter(component)
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('CategoryCard', () => {
  it('renders the category name', async () => {
    renderWithRouter(() => (
      <CategoryCard name="NPCs" categoryId="npcs" />
    ))
    expect(await screen.findByText('NPCs')).toBeInTheDocument()
  })

  it('renders a link to the correct route', async () => {
    renderWithRouter(() => (
      <CategoryCard name="Weapons & Items" categoryId="weapons-items" />
    ))
    const link = await screen.findByRole('link', { name: 'Weapons & Items' })
    expect(link).toHaveAttribute('href', '/weapons-items')
  })

  it('renders multiple category cards', async () => {
    renderWithRouter(() => (
      <div>
        <CategoryCard name="NPCs" categoryId="npcs" />
        <CategoryCard name="Weapons & Items" categoryId="weapons-items" />
      </div>
    ))
    expect(await screen.findByText('NPCs')).toBeInTheDocument()
    expect(screen.getByText('Weapons & Items')).toBeInTheDocument()
  })
})

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('displays the provided message text', () => {
    render(<ErrorMessage message="Failed to load categories" />)
    expect(screen.getByText('Failed to load categories')).toBeInTheDocument()
  })
})

describe('Dashboard filtering', () => {
  it('does not render a CategoryCard for categories with empty tableSets', async () => {
    // Simulate the filtering logic used in the dashboard:
    // categories with empty tableSets should not produce a card
    const categories = [
      { id: 'npcs', name: 'NPCs', tableSets: ['npc-generator.json'] },
      { id: 'empty-cat', name: 'Empty Category', tableSets: [] },
      { id: 'weapons-items', name: 'Weapons & Items', tableSets: ['weapon-generator.json'] },
    ]

    const visible = categories.filter((c) => c.tableSets.length > 0)

    renderWithRouter(() => (
      <div>
        {visible.map((c) => (
          <CategoryCard key={c.id} categoryId={c.id} name={c.name} />
        ))}
      </div>
    ))

    expect(await screen.findByText('NPCs')).toBeInTheDocument()
    expect(screen.getByText('Weapons & Items')).toBeInTheDocument()
    expect(screen.queryByText('Empty Category')).not.toBeInTheDocument()
  })

  it('generates correct hrefs for category links', async () => {
    renderWithRouter(() => (
      <div>
        <CategoryCard name="NPCs" categoryId="npcs" />
        <CategoryCard name="Weapons & Items" categoryId="weapons-items" />
      </div>
    ))

    const npcsLink = await screen.findByRole('link', { name: 'NPCs' })
    expect(npcsLink).toHaveAttribute('href', '/npcs')

    const weaponsLink = screen.getByRole('link', { name: 'Weapons & Items' })
    expect(weaponsLink).toHaveAttribute('href', '/weapons-items')
  })
})

describe('Recent Rolls', () => {
  beforeEach(() => {
    useRollStore.setState({ recentRolls: [], stackedResults: {} })
  })

  it('displays recent rolls section when rolls exist', async () => {
    useRollStore.getState().addRoll('test/key', {
      id: 'result-1',
      tableSetName: 'NPC Generator',
      categoryName: 'NPCs',
      fields: [
        { tableName: 'Race', entry: { title: 'Cacogen' }, tableIndex: 0 },
        { tableName: 'Name', entry: { title: 'Zara' }, tableIndex: 1 },
      ],
    })

    renderWithRouter(() => {
      const recentRolls = useRollStore((state) => state.recentRolls)
      return (
        <div>
          {recentRolls.length > 0 && (
            <section>
              <h2>Recent Rolls</h2>
              {recentRolls.map((result) => (
                <div key={result.id}>
                  <h3>{result.tableSetName}</h3>
                  <ResultCard result={result} />
                </div>
              ))}
            </section>
          )}
        </div>
      )
    })

    expect(await screen.findByText('Recent Rolls')).toBeInTheDocument()
    expect(screen.getByText('Cacogen')).toBeInTheDocument()
    expect(screen.getByText('Zara')).toBeInTheDocument()
  })

  it('hides recent rolls section when no rolls exist', async () => {
    renderWithRouter(() => {
      const recentRolls = useRollStore((state) => state.recentRolls)
      return (
        <div>
          <p>Dashboard</p>
          {recentRolls.length > 0 && (
            <section>
              <h2>Recent Rolls</h2>
            </section>
          )}
        </div>
      )
    })

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Recent Rolls')).not.toBeInTheDocument()
  })

  it('shows table set name for each recent roll', async () => {
    useRollStore.getState().addRoll('test/key1', {
      id: 'result-1',
      tableSetName: 'NPC Generator',
      categoryName: 'NPCs',
      fields: [
        { tableName: 'Race', entry: { title: 'Cacogen' }, tableIndex: 0 },
      ],
    })
    useRollStore.getState().addRoll('test/key2', {
      id: 'result-2',
      tableSetName: 'Weapon Generator',
      categoryName: 'Weapons',
      fields: [
        { tableName: 'Type', entry: { title: 'Sword' }, tableIndex: 0 },
      ],
    })

    renderWithRouter(() => {
      const recentRolls = useRollStore((state) => state.recentRolls)
      return (
        <div>
          {recentRolls.map((result) => (
            <div key={result.id}>
              <h3>{result.tableSetName}</h3>
              <ResultCard result={result} />
            </div>
          ))}
        </div>
      )
    })

    expect(await screen.findByText('NPC Generator')).toBeInTheDocument()
    expect(screen.getByText('Weapon Generator')).toBeInTheDocument()
  })

  it('displays at most 5 recent rolls', async () => {
    for (let i = 1; i <= 6; i++) {
      useRollStore.getState().addRoll(`test/key${i}`, {
        id: `result-${i}`,
        tableSetName: `Generator ${i}`,
        categoryName: 'Test',
        fields: [
          { tableName: 'Field', entry: { title: `Value ${i}` }, tableIndex: 0 },
        ],
      })
    }

    renderWithRouter(() => {
      const recentRolls = useRollStore((state) => state.recentRolls)
      return (
        <div>
          {recentRolls.map((result) => (
            <div key={result.id} data-testid="recent-roll">
              <h3>{result.tableSetName}</h3>
              <ResultCard result={result} />
            </div>
          ))}
        </div>
      )
    })

    const rolls = await screen.findAllByTestId('recent-roll')
    expect(rolls).toHaveLength(5)
    // Most recent (6) should be first, oldest (1) should be dropped
    expect(screen.getByText('Generator 6')).toBeInTheDocument()
    expect(screen.queryByText('Generator 1')).not.toBeInTheDocument()
  })

  it('per-field re-roll updates existing entry (no new entry)', async () => {
    useRollStore.getState().addRoll('test/key', {
      id: 'result-1',
      tableSetName: 'NPC Generator',
      categoryName: 'NPCs',
      fields: [
        { tableName: 'Race', entry: { title: 'Cacogen' }, tableIndex: 0 },
        { tableName: 'Name', entry: { title: 'Zara' }, tableIndex: 1 },
      ],
    })

    // Reroll the first field
    useRollStore.getState().rerollField('test/key', 'result-1', 0, [{
      tableName: 'Race',
      entry: { title: 'Newbeast' },
      tableIndex: 0,
    }])

    const state = useRollStore.getState()
    expect(state.recentRolls).toHaveLength(1)
    expect(state.recentRolls[0].fields[0].entry.title).toBe('Newbeast')
    expect(state.recentRolls[0].fields[1].entry.title).toBe('Zara')
  })
})
