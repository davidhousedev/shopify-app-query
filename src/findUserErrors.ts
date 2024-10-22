export type UserError = {
  field: string
  message: string
  code?: string
}

export default function findUserErrors(data: unknown): UserError[] | null {
  const queue = [data]

  while (queue.length > 0) {
    const node = queue.shift()

    if (typeof node !== 'object' || node === null) continue

    if (Array.isArray(node)) {
      queue.push(...node)
    } else {
      for (const [key, val] of Object.entries(node)) {
        if (key === 'userErrors' && val && val.length > 0) {
          return val
        }
        queue.push(val)
      }
    }
  }

  return null
}
