import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import {
  fetchChatQuota,
  fetchConversation,
  fetchConversations,
  removeConversation,
  renameConversation,
  sendPrompt
} from '../ai-chat-api'
import { AiChatWidget } from '../ai-chat-widget'

vi.mock('../ai-chat-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../ai-chat-api')>()),
  fetchChatQuota: vi.fn(),
  fetchConversations: vi.fn(),
  fetchConversation: vi.fn(),
  sendPrompt: vi.fn(),
  renameConversation: vi.fn(),
  removeConversation: vi.fn()
}))

const guestQuota = {
  guest: true,
  dailyPromptLimit: 3,
  remainingPrompts: 3,
  maxPromptLength: 500,
  imagesAllowed: false,
  maxImages: 0,
  maxImageSizeMb: 10,
  maxTotalImageSizeMb: 20
}
const userQuota = {
  ...guestQuota,
  guest: false,
  dailyPromptLimit: undefined,
  remainingPrompts: undefined,
  maxPromptLength: 2000,
  imagesAllowed: true,
  maxImages: 3
}
const conversation = {
  conversationId: 'conv-1',
  title: 'Chăm sóc sau mổ',
  createdAt: '2026-11-09T02:00:00Z',
  updatedAt: '2026-11-09T02:05:00Z',
  version: 4
}

function renderWidget() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/']}>
        <AiChatWidget />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

async function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý AI' }))
  return screen.findByRole('dialog', { name: 'Trợ lý CareConnect' })
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('AiChatWidget', () => {
  it('lets a guest ask without images and counts the free prompts down', async () => {
    vi.mocked(fetchChatQuota).mockResolvedValue(guestQuota)
    vi.mocked(sendPrompt).mockResolvedValue({
      answer: 'Hãy cho người bệnh uống đủ nước.',
      remainingGuestPrompts: 2,
      createdAt: '2026-11-09T03:00:00Z'
    })
    renderWidget()
    const panel = await openPanel()

    expect(await within(panel).findByText('Còn 3/3 lượt hỏi miễn phí hôm nay.')).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'Chọn ảnh từ thư mục' })).not.toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'Lịch sử trò chuyện' })).not.toBeInTheDocument()

    fireEvent.change(within(panel).getByLabelText('Nhập câu hỏi…'), {
      target: { value: 'Chăm sóc người sốt thế nào?' }
    })
    fireEvent.click(within(panel).getByRole('button', { name: 'Gửi' }))

    expect(await within(panel).findByText('Hãy cho người bệnh uống đủ nước.')).toBeInTheDocument()
    expect(sendPrompt).toHaveBeenCalledWith('Chăm sóc người sốt thế nào?', undefined, [])
    expect(within(panel).getByText('Còn 2/3 lượt hỏi miễn phí hôm nay.')).toBeInTheDocument()
  })

  it('blocks an empty question on the client and locks the box when the guest limit is used up', async () => {
    vi.mocked(fetchChatQuota).mockResolvedValue({ ...guestQuota, remainingPrompts: 0 })
    renderWidget()
    const panel = await openPanel()

    expect(
      await within(panel).findByText('Bạn đã dùng hết lượt hỏi miễn phí hôm nay. Đăng nhập để hỏi tiếp.')
    ).toBeInTheDocument()
    expect(within(panel).getByLabelText('Nhập câu hỏi…')).toBeDisabled()
    expect(within(panel).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login?next=%2F')
  })

  it('keeps a signed-in conversation, continues it and lets the user rename and delete it', async () => {
    vi.mocked(fetchChatQuota).mockResolvedValue(userQuota)
    vi.mocked(sendPrompt).mockResolvedValue({
      conversationId: 'conv-1',
      conversationTitle: 'Chăm sóc sau mổ',
      answer: 'Giữ vết mổ khô và sạch.',
      createdAt: '2026-11-09T03:00:00Z'
    })
    vi.mocked(fetchConversation).mockResolvedValue({
      ...conversation,
      messages: [
        { chatMessageId: 'm1', messageRole: 'USER', content: 'Chăm sóc vết mổ?', createdAt: '2026-11-09T03:00:00Z' },
        {
          chatMessageId: 'm2',
          messageRole: 'ASSISTANT',
          content: 'Giữ vết mổ khô và sạch.',
          createdAt: '2026-11-09T03:00:01Z'
        }
      ]
    })
    vi.mocked(fetchConversations).mockResolvedValue([conversation])
    vi.mocked(renameConversation).mockResolvedValue({ ...conversation, title: 'Vết mổ', version: 5 })
    vi.mocked(removeConversation).mockResolvedValue()
    renderWidget()
    const panel = await openPanel()

    expect(await within(panel).findByRole('button', { name: 'Chọn ảnh từ thư mục' })).toBeInTheDocument()
    fireEvent.change(within(panel).getByLabelText('Nhập câu hỏi…'), { target: { value: 'Chăm sóc vết mổ?' } })
    fireEvent.keyDown(within(panel).getByLabelText('Nhập câu hỏi…'), { key: 'Enter' })
    expect(await within(panel).findByText('Giữ vết mổ khô và sạch.')).toBeInTheDocument()
    expect(sendPrompt).toHaveBeenCalledWith('Chăm sóc vết mổ?', undefined, [])

    fireEvent.change(within(panel).getByLabelText('Nhập câu hỏi…'), { target: { value: 'Bao lâu thay băng?' } })
    fireEvent.click(within(panel).getByRole('button', { name: 'Gửi' }))
    await waitFor(() => expect(sendPrompt).toHaveBeenLastCalledWith('Bao lâu thay băng?', 'conv-1', []))

    fireEvent.click(within(panel).getByRole('button', { name: 'Lịch sử trò chuyện' }))
    fireEvent.click(await within(panel).findByRole('button', { name: 'Đổi tên “Chăm sóc sau mổ”' }))
    fireEvent.change(within(panel).getByLabelText('Tên cuộc trò chuyện'), { target: { value: '  ' } })
    fireEvent.click(within(panel).getByRole('button', { name: 'Lưu' }))
    expect(within(panel).getByText('Nhập tên cuộc trò chuyện.')).toBeInTheDocument()
    fireEvent.change(within(panel).getByLabelText('Tên cuộc trò chuyện'), { target: { value: 'Vết mổ' } })
    fireEvent.click(within(panel).getByRole('button', { name: 'Lưu' }))
    await waitFor(() => expect(renameConversation).toHaveBeenCalledWith('conv-1', 'Vết mổ', 4))

    fireEvent.click(within(panel).getByRole('button', { name: 'Xóa “Chăm sóc sau mổ”' }))
    const confirm = await screen.findByRole('dialog', { name: 'Xóa cuộc trò chuyện?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Xóa' }))
    await waitFor(() => expect(removeConversation).toHaveBeenCalledWith('conv-1'))
  })

  it('checks images before sending', async () => {
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
    vi.mocked(fetchChatQuota).mockResolvedValue(userQuota)
    renderWidget()
    const panel = await openPanel()
    await within(panel).findByRole('button', { name: 'Chọn ảnh từ thư mục' })
    const input = panel.querySelector<HTMLInputElement>('input[type="file"]')!
    const pdf = new File(['%PDF'], 'scan.pdf', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [pdf] } })

    expect(within(panel).getByText('Chỉ nhận ảnh JPG, PNG hoặc WebP.')).toBeInTheDocument()
  })

  it('opens the folder picker and accepts images dragged in from a folder', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
    const pickerClick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    vi.mocked(fetchChatQuota).mockResolvedValue(userQuota)
    renderWidget()
    const panel = await openPanel()

    fireEvent.click(await within(panel).findByRole('button', { name: 'Chọn ảnh từ thư mục' }))
    expect(pickerClick).toHaveBeenCalledTimes(1)

    const form = within(panel).getByLabelText('Nhập câu hỏi…').closest('form')!
    const photo = new File([new Uint8Array(8)], 'vet-thuong.png', { type: 'image/png' })
    fireEvent.dragOver(form, { dataTransfer: { types: ['Files'], files: [photo] } })
    expect(within(panel).getByText('Thả ảnh vào đây để đính kèm')).toBeInTheDocument()
    fireEvent.drop(form, { dataTransfer: { types: ['Files'], files: [photo] } })

    expect(within(panel).getByRole('img', { name: 'Ảnh đính kèm 1' })).toBeInTheDocument()
    fireEvent.click(within(panel).getByRole('button', { name: 'Chọn thêm ảnh từ thư mục' }))
    expect(pickerClick).toHaveBeenCalledTimes(2)
    pickerClick.mockRestore()
  })

  it('tells a guest who drops an image to sign in', async () => {
    vi.mocked(fetchChatQuota).mockResolvedValue(guestQuota)
    renderWidget()
    const panel = await openPanel()
    const form = (await within(panel).findByLabelText('Nhập câu hỏi…')).closest('form')!
    const photo = new File([new Uint8Array(8)], 'anh.png', { type: 'image/png' })

    fireEvent.drop(form, { dataTransfer: { types: ['Files'], files: [photo] } })

    expect(within(panel).getAllByText('Đăng nhập để gửi ảnh cho trợ lý.').length).toBeGreaterThan(1)
    expect(within(panel).queryByRole('img', { name: 'Ảnh đính kèm 1' })).not.toBeInTheDocument()
  })
})
