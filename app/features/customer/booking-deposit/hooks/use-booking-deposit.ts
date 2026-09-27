import { useEffect, useState } from 'react'
import type { DepositPaymentMethod } from '../types'

const INITIAL_SECONDS = 14 * 60 + 59

export const useBookingDeposit = () => {
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<DepositPaymentMethod>('vietqr')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formattedTime = () => {
    if (timeLeft <= 0) return '00:00'
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handlePayDeposit = () => {
    if (isProcessing || isSuccess) return

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      setIsModalOpen(true)
    }, 1200)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return {
    timeLeft,
    formattedTime: formattedTime(),
    isExpired: timeLeft <= 0,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isProcessing,
    isSuccess,
    isModalOpen,
    handlePayDeposit,
    closeModal
  }
}
