import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { FileDropZone } from './file-drop-zone'
import { ViewableImage } from './image-viewer'

beforeEach(async () => {
  await setAppLanguage('vi', false)
})

const certificateAlt = 'Chứng chỉ'
const backAlt = 'Mặt sau'
const uploadLabel = 'Tải tệp lên'
const gallery = [
  { src: 'https://cdn.example.com/front.png', alt: 'Mặt trước' },
  { src: 'https://cdn.example.com/back.png', alt: 'Mặt sau' }
]

describe('ViewableImage and ImageViewer', () => {
  it('opens the viewer on click, zooms with buttons and keys, and resets', () => {
    render(<ViewableImage alt={certificateAlt} src='https://cdn.example.com/cert.png' />)

    fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh Chứng chỉ' }))
    const viewer = screen.getByRole('dialog', { name: 'Xem ảnh: Chứng chỉ' })
    expect(screen.getByRole('button', { name: 'Về kích thước gốc' })).toHaveTextContent('100%')

    fireEvent.click(screen.getByRole('button', { name: 'Phóng to' }))
    fireEvent.click(screen.getByRole('button', { name: 'Phóng to' }))
    expect(screen.getByRole('button', { name: 'Về kích thước gốc' })).toHaveTextContent('150%')
    fireEvent.keyDown(viewer, { key: '-' })
    expect(screen.getByRole('button', { name: 'Về kích thước gốc' })).toHaveTextContent('125%')
    fireEvent.keyDown(viewer, { key: '0' })
    expect(screen.getByRole('button', { name: 'Về kích thước gốc' })).toHaveTextContent('100%')
    expect(screen.getByRole('link', { name: 'Mở ảnh gốc ở thẻ mới' })).toHaveAttribute(
      'href',
      'https://cdn.example.com/cert.png'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Đóng trình xem ảnh' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('steps through a gallery with the arrow keys and starts each image unzoomed', () => {
    render(<ViewableImage alt={backAlt} gallery={gallery} index={1} src={gallery[1].src} />)

    fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh Mặt sau' }))
    const viewer = screen.getByRole('dialog')
    expect(viewer).toHaveTextContent('2 / 2')
    fireEvent.keyDown(viewer, { key: '+' })
    fireEvent.keyDown(viewer, { key: 'ArrowRight' })
    expect(screen.getByRole('dialog', { name: 'Xem ảnh: Mặt trước' })).toHaveTextContent('1 / 2')
    expect(screen.getByRole('button', { name: 'Về kích thước gốc' })).toHaveTextContent('100%')
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh trước' }))
    expect(screen.getByRole('dialog', { name: 'Xem ảnh: Mặt sau' })).toBeInTheDocument()
  })
})

describe('FileDropZone', () => {
  it('opens the file picker from the zone and reports picked or dropped files', () => {
    const onFiles = vi.fn()
    const onRemove = vi.fn()
    const file = new File(['x'], 'giay-phep.pdf', { type: 'application/pdf' })
    render(
      <FileDropZone accept='.pdf' files={[file]} label={uploadLabel} multiple onFiles={onFiles} onRemove={onRemove} />
    )

    const input = screen.getByLabelText('Tải tệp lên')
    const click = vi.spyOn(input, 'click')
    fireEvent.click(screen.getByRole('button', { name: /Bấm để chọn tệp/ }))
    expect(click).toHaveBeenCalled()

    fireEvent.change(input, { target: { files: [file] } })
    expect(onFiles).toHaveBeenCalledWith([file])
    fireEvent.drop(screen.getByRole('button', { name: /Bấm để chọn tệp/ }), { dataTransfer: { files: [file] } })
    expect(onFiles).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ giay-phep.pdf' }))
    expect(onRemove).toHaveBeenCalledWith(file)
  })
})
