import { describe, it, expect } from 'vitest'
import { normalizeTerm, expandTerms, inferCategoryFromQuery } from '@/lib/searchUtils'

describe('normalizeTerm', () => {

    it('returns same word if it already has an alias', () => {
        expect(normalizeTerm('laptop')).toBe('laptop')
    })

    it('strips -s from plural word to find alias', () => {
        expect(normalizeTerm('laptops')).toBe('laptop')
    })

    it('strips -s from "keyboards" to get "keyboard"', () => {
        expect(normalizeTerm('keyboards')).toBe('keyboard')
    })

    it('returns original word if no alias found at all', () => {
        expect(normalizeTerm('bananaphone')).toBe('bananaphone')
    })

    it('returns original word for empty string', () => {
        expect(normalizeTerm('')).toBe('')
    })

})

// ─────────────────────────────────────────────────────
// GROUP 2: expandTerms
// What it does: ["laptop"] → ["laptop","laptops","notebook","notebooks","ultrabook"]
// Why test: search uses this to find products by many related words
// ─────────────────────────────────────────────────────
describe('expandTerms', () => {

    it('always includes the original term in result', () => {
        const result = expandTerms(['laptop'])
        expect(result).toContain('laptop')
    })

    it('expands "laptop" to include "notebook"', () => {
        const result = expandTerms(['laptop'])
        expect(result).toContain('notebook')
    })

    it('expands "laptop" to include "ultrabook"', () => {
        const result = expandTerms(['laptop'])
        expect(result).toContain('ultrabook')
    })
    it('normalizes "macbook" to alias key', () => {
        expect(normalizeTerm('macbook')).toBe('macbook') // needs alias entry
    })

    it('expands "macbook" to include "apple"', () => {
        const result = expandTerms(['macbook'])
        expect(result).toContain('apple')
    })

    it('expands "macbook" to include "laptop"', () => {
        const result = expandTerms(['macbook'])
        expect(result).toContain('laptop')
    })
    it('expands "macbook" to include "macbook pro"', () => {
        const result = expandTerms(['macbook'])
        expect(result).toContain('macbook pro')
    })

    it('expands "macbook" to include "macbook air"', () => {
        const result = expandTerms(['macbook'])
        expect(result).toContain('macbook air')
    })

    it('infers Laptop from "macbook"', () => {
        const result = inferCategoryFromQuery('macbook')
        expect(result).toEqual({ category: 'Laptop', subcategory: '' })
    })

    it('infers Laptop from "apple laptop"', () => {
        const result = inferCategoryFromQuery('apple laptop')
        expect(result).toEqual({ category: 'Laptop', subcategory: '' })
    })
    it('expands "gpu" to include "nvidia"', () => {

        const result = expandTerms(['gpu'])
        expect(result).toContain('nvidia')
    })

    it('expands "gpu" to include "rtx"', () => {
        const result = expandTerms(['gpu'])
        expect(result).toContain('rtx')
    })

    it('expands "ram" to include "memory"', () => {
        const result = expandTerms(['ram'])
        expect(result).toContain('memory')
    })

    it('expands "ram" to include "ddr"', () => {
        const result = expandTerms(['ram'])
        expect(result).toContain('ddr')
    })

    it('handles multiple terms at once', () => {
        const result = expandTerms(['laptop', 'gpu'])
        expect(result).toContain('notebook')   // from laptop
        expect(result).toContain('nvidia')     // from gpu
    })
    it('expands "stand" to include "laptop stand"', () => {
        expect(expandTerms(['stand'])).toContain('laptop stand')
    })

    it('expands "hub" to include "usb hub"', () => {
        expect(expandTerms(['hub'])).toContain('usb hub')
    })

    it('expands "cartridge" to include "toner"', () => {
        expect(expandTerms(['cartridge'])).toContain('toner')
    })

    it('expands "router" to include "wifi router"', () => {
        expect(expandTerms(['router'])).toContain('wifi router')
    })

    // Add to inferCategoryFromQuery describe block:
    it('infers Stand subcategory from "stand"', () => {
        expect(inferCategoryFromQuery('stand')).toEqual({ category: 'Accessories', subcategory: 'Stand' })
    })

    it('infers Hub subcategory from "usb hub"', () => {
        expect(inferCategoryFromQuery('usb hub')).toEqual({ category: 'Accessories', subcategory: 'Hub' })
    })

    it('infers Cartridge from "ink cartridge"', () => {
        expect(inferCategoryFromQuery('ink cartridge')).toEqual({ category: 'Accessories', subcategory: 'Cartridge' })
    })

    it('infers Cartridge from "toner"', () => {
        expect(inferCategoryFromQuery('toner')).toEqual({ category: 'Accessories', subcategory: 'Cartridge' })
    })

    it('infers WIFI Adapter from "dongle"', () => {
        expect(inferCategoryFromQuery('dongle')).toEqual({ category: 'Accessories', subcategory: 'WIFI Adapter' })
    })

    it('infers Router from "wifi router"', () => {
        expect(inferCategoryFromQuery('wifi router')).toEqual({ category: 'Accessories', subcategory: 'Router' })
    })

    it('returns array with no duplicates (Set removes them)', () => {
        const result = expandTerms(['laptop', 'laptops'])
        const unique = new Set(result)
        expect(result.length).toBe(unique.size)
    })

    it('handles unknown word (no aliases)', () => {
        const result = expandTerms(['xyz123'])
        expect(result).toContain('xyz123')
        expect(result.length).toBeGreaterThanOrEqual(1)
    })

})

// ─────────────────────────────────────────────────────
// GROUP 3: inferCategoryFromQuery
// What it does: user types "gaming laptop" → returns { category: "Laptop", subcategory: "Gaming" }
// Why test: wrong inference = wrong products shown = bad UX
// ─────────────────────────────────────────────────────
describe('inferCategoryFromQuery', () => {

    it('infers Laptop category from "laptop"', () => {
        const result = inferCategoryFromQuery('laptop')
        expect(result).toEqual({ category: 'Laptop', subcategory: '' })
    })

    it('infers Laptop category from "laptops" (plural)', () => {
        const result = inferCategoryFromQuery('laptops')
        expect(result).toEqual({ category: 'Laptop', subcategory: '' })
    })

    it('infers Gaming subcategory from "gaming laptop"', () => {
        const result = inferCategoryFromQuery('gaming laptop')
        expect(result).toEqual({ category: 'Laptop', subcategory: 'Gaming' })
    })

    it('infers Gaming subcategory from "gaming laptops" (plural)', () => {
        const result = inferCategoryFromQuery('gaming laptops')
        expect(result).toEqual({ category: 'Laptop', subcategory: 'Gaming' })
    })

    it('infers Mouse subcategory from "mouse"', () => {
        const result = inferCategoryFromQuery('mouse')
        expect(result).toEqual({ category: 'Accessories', subcategory: 'Mouse' })
    })

    it('infers Keyboard subcategory from "keyboard"', () => {
        const result = inferCategoryFromQuery('keyboard')
        expect(result).toEqual({ category: 'Accessories', subcategory: 'Keyboard' })
    })

    it('infers Desktop from "desktop"', () => {
        const result = inferCategoryFromQuery('desktop')
        expect(result).toEqual({ category: 'Desktop', subcategory: '' })
    })

    it('infers Refurbished subcategory from "refurbished laptop"', () => {
        const result = inferCategoryFromQuery('refurbished laptop')
        expect(result).toEqual({ category: 'Laptop', subcategory: 'Refurbished' })
    })

    it('returns null for unknown query', () => {
        const result = inferCategoryFromQuery('zebra printer')
        expect(result).toBeNull()
    })

    it('returns null for empty string', () => {
        const result = inferCategoryFromQuery('')
        expect(result).toBeNull()
    })

    it('is case-insensitive (trims and lowercases internally)', () => {
        const result = inferCategoryFromQuery('  Gaming Laptop  ')
        expect(result).toEqual({ category: 'Laptop', subcategory: 'Gaming' })
    })

})