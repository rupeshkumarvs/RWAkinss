'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function useNavigation() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return {
    pathname,
    collapsed,
    isMobile,
    mobileOpen,
    setCollapsed,
    setMobileOpen,
    toggleCollapse: () => setCollapsed(v => !v),
    toggleMobile: () => setMobileOpen(v => !v),
    closeMobile: () => setMobileOpen(false),
  }
}
