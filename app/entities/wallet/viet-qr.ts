import { foldText } from '~/shared/lib/fold-text'

export interface VietQrBank {
  /** NAPAS bank identification number used by VietQR. */
  bin: string
  /** Name stored on the withdrawal and shown to people. */
  name: string
  /** Other spellings a typed bank name may use (matched without case or diacritics). */
  aliases: readonly string[]
}

// shortcut: the common NAPAS member banks only; add a bank here when a withdrawal names one that is missing.
export const VIET_QR_BANKS: readonly VietQrBank[] = [
  { bin: '970436', name: 'Vietcombank', aliases: ['VCB', 'Ngoại thương'] },
  { bin: '970415', name: 'VietinBank', aliases: ['ICB', 'Công thương'] },
  { bin: '970418', name: 'BIDV', aliases: ['Đầu tư và Phát triển'] },
  { bin: '970405', name: 'Agribank', aliases: ['VBA', 'Nông nghiệp'] },
  { bin: '970407', name: 'Techcombank', aliases: ['TCB', 'Kỹ thương'] },
  { bin: '970422', name: 'MB Bank', aliases: ['MB', 'MBBank', 'Quân đội'] },
  { bin: '970416', name: 'ACB', aliases: ['Á Châu'] },
  { bin: '970432', name: 'VPBank', aliases: ['VP Bank', 'Việt Nam Thịnh Vượng'] },
  { bin: '970423', name: 'TPBank', aliases: ['TP Bank', 'Tiên Phong'] },
  { bin: '970403', name: 'Sacombank', aliases: ['STB', 'Sài Gòn Thương Tín'] },
  { bin: '970441', name: 'VIB', aliases: ['Quốc tế'] },
  { bin: '970437', name: 'HDBank', aliases: ['HD Bank'] },
  { bin: '970443', name: 'SHB', aliases: ['Sài Gòn - Hà Nội'] },
  { bin: '970440', name: 'SeABank', aliases: ['SeA Bank', 'Đông Nam Á'] },
  { bin: '970448', name: 'OCB', aliases: ['Phương Đông'] },
  { bin: '970426', name: 'MSB', aliases: ['Maritime Bank', 'Hàng Hải'] },
  { bin: '970431', name: 'Eximbank', aliases: ['EIB'] },
  { bin: '970449', name: 'LPBank', aliases: ['LienVietPostBank', 'Lộc Phát'] },
  { bin: '970428', name: 'Nam A Bank', aliases: ['NamABank', 'Nam Á'] },
  { bin: '970409', name: 'Bac A Bank', aliases: ['BacABank', 'Bắc Á'] },
  { bin: '970419', name: 'NCB', aliases: ['Quốc Dân'] },
  { bin: '970425', name: 'ABBANK', aliases: ['An Bình'] },
  { bin: '970412', name: 'PVcomBank', aliases: ['PVCB'] },
  { bin: '970454', name: 'BVBank', aliases: ['Viet Capital', 'Bản Việt'] },
  { bin: '970452', name: 'KienlongBank', aliases: ['Kiên Long'] }
]

function key(value: string) {
  return foldText(value).replace(/[^a-z0-9]/g, '')
}

/** The bank a stored bank name refers to, or undefined when the name matches none of the list. */
export function findVietQrBank(bankName: string): VietQrBank | undefined {
  const wanted = key(bankName)
  if (!wanted) return undefined
  return VIET_QR_BANKS.find((bank) => [bank.name, ...bank.aliases].some((name) => key(name) === wanted))
}

function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

/** CRC-16/CCITT-FALSE (poly 0x1021, start 0xFFFF), as EMVCo QR requires. */
export function crc16(text: string) {
  let crc = 0xffff
  for (let index = 0; index < text.length; index += 1) {
    crc ^= text.charCodeAt(index) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * VietQR (NAPAS 247 EMVCo) payload for a transfer to one account with a fixed amount and note, built in the browser so
 * the requester's account never leaves CareConnect. Any Vietnamese banking app reads it.
 */
export function vietQrPayload({
  bin,
  accountNumber,
  amount,
  purpose
}: {
  bin: string
  accountNumber: string
  amount: number
  purpose: string
}) {
  const beneficiary = field('00', bin) + field('01', accountNumber.replace(/\s/g, ''))
  const merchant = field('00', 'A000000727') + field('01', beneficiary) + field('02', 'QRIBFTTA')
  // Bank apps expect plain ASCII in the note and cut it at 25 characters.
  const note = foldText(purpose)
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, 25)
  const body =
    field('00', '01') +
    field('01', '12') +
    field('38', merchant) +
    field('53', '704') +
    field('54', String(Math.round(amount))) +
    field('58', 'VN') +
    field('62', field('08', note)) +
    '6304'
  return body + crc16(body)
}
