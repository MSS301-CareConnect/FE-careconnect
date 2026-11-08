import { describe, expect, it } from 'vitest'

import { pickAvatar } from './provider-avatar'

describe('pickAvatar', () => {
  it('picks the newest image and ignores files without a URL', () => {
    expect(
      pickAvatar([
        { mediaFileId: 'old', mediaFileType: 'IMAGE', displayOrder: 0, downloadUrl: 'old.png' },
        { mediaFileId: 'pdf', mediaFileType: 'DOCUMENT', displayOrder: 5, downloadUrl: 'a.pdf' } as never,
        { mediaFileId: 'new', mediaFileType: 'IMAGE', displayOrder: 1, downloadUrl: 'new.png' },
        { mediaFileId: 'broken', mediaFileType: 'IMAGE', displayOrder: 9 }
      ])?.mediaFileId
    ).toBe('new')
    expect(pickAvatar([])).toBeUndefined()
  })
})
