import { describe, expect, it } from 'vitest'

import { PROJECT } from './project'

describe('project configuration', () => {
  it('keeps downloads inside the Pinoria directory', () => {
    expect(PROJECT.downloadDirectory).toBe('Pinoria')
  })

  it('limits the initial host scope to Pinterest properties', () => {
    expect(PROJECT.supportedHosts).toEqual(['pinterest.com', 'pinimg.com'])
  })
})
