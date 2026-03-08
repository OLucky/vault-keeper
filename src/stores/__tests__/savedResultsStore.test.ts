import { describe, it, expect, beforeEach } from 'vitest'
import { useSavedResultsStore } from '../savedResultsStore'
import type { GeneratedResult } from '../../lib/types'

function makeResult(overrides: Partial<GeneratedResult> = {}): GeneratedResult {
  return {
    id: 'test-id',
    tableSetName: 'Test Table Set',
    categoryName: 'Test Category',
    fields: [
      {
        tableName: 'Test Table',
        entry: { title: 'Test Entry', description: 'A test entry' },
        tableIndex: 0,
      },
    ],
    ...overrides,
  }
}

describe('savedResultsStore', () => {
  beforeEach(() => {
    useSavedResultsStore.setState({ savedResults: [] })
  })

  describe('saveResult', () => {
    it('adds with timestamp and empty note', () => {
      const before = Date.now()
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')
      const after = Date.now()

      const { savedResults } = useSavedResultsStore.getState()
      expect(savedResults).toHaveLength(1)
      expect(savedResults[0].id).toBe('a')
      expect(savedResults[0].categoryId).toBe('cat-1')
      expect(savedResults[0].categoryName).toBe('Test Category')
      expect(savedResults[0].tableSetName).toBe('Test Table Set')
      expect(savedResults[0].fields).toHaveLength(1)
      expect(savedResults[0].note).toBe('')
      expect(savedResults[0].savedAt).toBeGreaterThanOrEqual(before)
      expect(savedResults[0].savedAt).toBeLessThanOrEqual(after)
    })

    it('is a no-op for duplicate ID', () => {
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-2')

      const { savedResults } = useSavedResultsStore.getState()
      expect(savedResults).toHaveLength(1)
      expect(savedResults[0].categoryId).toBe('cat-1')
    })
  })

  describe('removeResult', () => {
    it('removes by ID', () => {
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'b' }), 'cat-1')

      useSavedResultsStore.getState().removeResult('a')

      const { savedResults } = useSavedResultsStore.getState()
      expect(savedResults).toHaveLength(1)
      expect(savedResults[0].id).toBe('b')
    })

    it('leaves collection unchanged with non-existent ID', () => {
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')

      useSavedResultsStore.getState().removeResult('nonexistent')

      const { savedResults } = useSavedResultsStore.getState()
      expect(savedResults).toHaveLength(1)
      expect(savedResults[0].id).toBe('a')
    })
  })

  describe('updateNote', () => {
    it('updates the note text', () => {
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')

      useSavedResultsStore.getState().updateNote('a', 'My note')

      const { savedResults } = useSavedResultsStore.getState()
      expect(savedResults[0].note).toBe('My note')
    })

    it('is a no-op on non-existent ID', () => {
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')

      useSavedResultsStore.getState().updateNote('nonexistent', 'My note')

      const { savedResults } = useSavedResultsStore.getState()
      expect(savedResults).toHaveLength(1)
      expect(savedResults[0].note).toBe('')
    })
  })

  describe('isSaved', () => {
    it('returns true for saved result', () => {
      useSavedResultsStore.getState().saveResult(makeResult({ id: 'a' }), 'cat-1')

      expect(useSavedResultsStore.getState().isSaved('a')).toBe(true)
    })

    it('returns false for unsaved result', () => {
      expect(useSavedResultsStore.getState().isSaved('nonexistent')).toBe(false)
    })
  })
})
