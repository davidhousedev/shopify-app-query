import { describe, it, expect } from 'vitest'
import findUserErrors from './findUserErrors.js'

const USER_ERRORS = [{ field: 'foo', message: 'bar' }]

describe('findUserErrors', () => {
  it('returns null if the data is not an object', () => {
    expect(findUserErrors({ data: '' })).toBe(null)
    expect(findUserErrors({ data: 5 })).toBe(null)
    expect(findUserErrors({ data: USER_ERRORS })).toBe(null)
    expect(findUserErrors({ data: [5] })).toBe(null)
  })

  it('finds user errors at the top level', () => {
    expect(findUserErrors({ data: { userErrors: USER_ERRORS } })).toEqual(
      USER_ERRORS,
    )
  })

  it('ignores empty userErrors', () => {
    expect(findUserErrors({ data: { userErrors: [] } })).toBe(null)
    expect(findUserErrors({ data: { userErrors: null } })).toBe(null)
  })

  it('returns userErrors if the input contains it', () => {
    expect(findUserErrors({ userErrors: USER_ERRORS })).toEqual(USER_ERRORS)
  })

  it('returns userErrors if the input contains it within an array', () => {
    expect(
      findUserErrors([{ foo: 'bar' }, { userErrors: USER_ERRORS }]),
    ).toEqual(USER_ERRORS)
  })

  it('finds user errors in a nested array', () => {
    expect(
      findUserErrors({ data: { foo: [{ userErrors: USER_ERRORS }] } }),
    ).toEqual(USER_ERRORS)
  })

  it('finds user errors in a nested object', () => {
    expect(
      findUserErrors({ data: { foo: { bar: { userErrors: USER_ERRORS } } } }),
    ).toEqual(USER_ERRORS)
  })

  it('finds user errors in a complex object', () => {
    expect(
      findUserErrors({
        // data: {
        bar: [{ foo: 'foo' }],
        foo: {
          baz: [{ userErrors: USER_ERRORS }],
        },
        // },
      }),
    ).toEqual(USER_ERRORS)
  })

  it('works for real-world scenarios', () => {
    expect(
      findUserErrors({
        data: {
          discountAutomaticAppCreate: {
            automaticAppDiscount: null,
            userErrors: [
              {
                field: ['automaticAppDiscount', 'title'],
                message: 'must be unique',
              },
            ],
          },
        },
      }),
    ).toEqual([
      {
        field: ['automaticAppDiscount', 'title'],
        message: 'must be unique',
      },
    ])
  })
})
