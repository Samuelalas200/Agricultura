import { describe, it, expect } from 'vitest'

describe('Basic utility tests', () => {
  it('performs basic math operations', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 3).toBe(9)
  })

  it('validates string operations', () => {
    const testString = 'Campo360'
    expect(testString.toLowerCase()).toBe('campo360')
    expect(testString.length).toBe(8)
    expect(testString.includes('Campo')).toBe(true)
  })

  it('validates array operations', () => {
    const crops = ['maíz', 'trigo', 'soja']
    expect(crops.length).toBe(3)
    expect(crops.includes('maíz')).toBe(true)
    expect(crops[0]).toBe('maíz')
  })
})
