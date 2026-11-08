import type { Plugin } from 'vite'

export interface PaymentDemoOptions {
  target: string
  clientId?: string
  clientSecret?: string
}

export function paymentDemoPlugin(options: PaymentDemoOptions): Plugin
