import { useMutation } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'

import { validPassword } from '~/entities/identity/password-rules'

import { beginRegistration, resendOtp, verifyRegistration } from './registration-api'

export type RegistrationValidationKey =
  | 'auth.registration.invalidName'
  | 'auth.registration.invalidEmail'
  | 'auth.registration.invalidPhone'
  | 'auth.registration.passwordRules'
  | 'auth.registration.passwordMismatch'
  | 'auth.registration.invalidOtp'

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** State and requests of the two-step registration (details → emailed OTP); `?step=verify` opens the second step. */
export function useRegistrationFlow() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [validationError, setValidationError] = useState<RegistrationValidationKey | null>(null)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [resent, setResent] = useState(false)
  const [completed, setCompleted] = useState(false)
  const verifying = searchParams.get('step') === 'verify'

  const register = useMutation({
    mutationFn: beginRegistration,
    onSuccess: (result) => {
      setEmail(result.email)
      setPassword('')
      setConfirmPassword('')
      setValidationError(null)
      setResendSeconds(result.resendAfterSeconds)
      setSearchParams({ step: 'verify' })
    }
  })
  const verify = useMutation({
    mutationFn: verifyRegistration,
    onSuccess: () => {
      setOtpCode('')
      setCompleted(true)
    }
  })
  const resend = useMutation({
    mutationFn: resendOtp,
    onSuccess: (result) => {
      setResendSeconds(result.resendAfterSeconds)
      setResent(true)
      setValidationError(null)
    }
  })

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = fullName.trim()
    const address = email.trim()
    const phone = phoneNumber.trim()
    let error: RegistrationValidationKey | null = null
    if (!name || name.length > 255) error = 'auth.registration.invalidName'
    else if (!validEmail(address)) error = 'auth.registration.invalidEmail'
    else if (phone && !/^[0-9]{10,11}$/.test(phone)) error = 'auth.registration.invalidPhone'
    else if (!validPassword(password)) error = 'auth.registration.passwordRules'
    else if (password !== confirmPassword) error = 'auth.registration.passwordMismatch'
    setValidationError(error)
    if (error) return
    register.mutate({ fullName: name, email: address, password, ...(phone ? { phoneNumber: phone } : {}) })
  }

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let error: RegistrationValidationKey | null = null
    if (!validEmail(email.trim())) error = 'auth.registration.invalidEmail'
    else if (!/^[0-9]{6}$/.test(otpCode)) error = 'auth.registration.invalidOtp'
    setValidationError(error)
    if (error) return
    verify.mutate({ email: email.trim(), otpCode })
  }

  function handleResend() {
    if (!validEmail(email.trim())) {
      setValidationError('auth.registration.invalidEmail')
      return
    }
    setValidationError(null)
    setResent(false)
    resend.mutate({ email: email.trim() })
  }

  function goToStep(step: 'details' | 'verify') {
    setValidationError(null)
    setSearchParams(step === 'verify' ? { step: 'verify' } : {})
  }

  return {
    fields: { fullName, email, phoneNumber, password, confirmPassword, otpCode },
    set: { setFullName, setEmail, setPhoneNumber, setPassword, setConfirmPassword, setOtpCode },
    validationError,
    resendSeconds,
    resent,
    completed,
    verifying,
    register,
    verify,
    resend,
    handleRegister,
    handleVerify,
    handleResend,
    goToStep
  }
}
