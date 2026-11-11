import { describe, expect, it } from 'vitest'

import { crc16, findVietQrBank, vietQrPayload } from './viet-qr'

describe('viet-qr', () => {
  it('uses CRC-16/CCITT-FALSE', () => {
    expect(crc16('123456789')).toBe('29B1')
  })

  it('finds a bank from a typed name, alias or diacritics', () => {
    expect(findVietQrBank('vietcombank')?.bin).toBe('970436')
    expect(findVietQrBank('Ngân hàng Ngoại thương'.replace('Ngân hàng ', ''))?.bin).toBe('970436')
    expect(findVietQrBank('TP Bank')?.bin).toBe('970423')
    expect(findVietQrBank('Ngân hàng lạ')).toBeUndefined()
  })

  it('builds a VietQR transfer payload with a valid checksum', () => {
    const payload = vietQrPayload({
      bin: '970436',
      accountNumber: '0123 456 789',
      amount: 90000,
      purpose: 'CareConnect rút tiền 6283b310'
    })
    expect(payload).toBe(
      '000201010212' +
        '38540010A00000072701240006970436011001234567890208QRIBFTTA' +
        '5303704540590000' +
        '5802VN' +
        '62290825CARECONNECT RUT TIEN 6283' +
        '6304' +
        crc16(payload.slice(0, -4))
    )
  })
})
