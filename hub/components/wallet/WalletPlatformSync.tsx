// Built by vsrupeshkumar
// Bridge: watches wallet connection state and resets platform context to DEMO_STATE on disconnect.
'use client'

import { useEffect, useRef } from 'react'
import { useWallet } from '@/context/WalletContext'
import { useKubrykPlatform } from '@/context/KubrykPlatformContext'

export function WalletPlatformSync() {
  const { isAnyWalletConnected } = useWallet()
  const { resetToDemo } = useKubrykPlatform()
  const prevConnected = useRef(isAnyWalletConnected)

  useEffect(() => {
    // Trigger demo reset only on transition from connected → disconnected
    if (prevConnected.current && !isAnyWalletConnected) {
      resetToDemo()
    }
    prevConnected.current = isAnyWalletConnected
  }, [isAnyWalletConnected, resetToDemo])

  return null
}
