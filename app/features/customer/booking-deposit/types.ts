export type DepositPaymentMethod = 'vietqr' | 'card' | 'wallet'

export interface BookingDepositState {
  timeLeft: number
  selectedPaymentMethod: DepositPaymentMethod
  isProcessing: boolean
  isSuccess: boolean
  isModalOpen: boolean
}
