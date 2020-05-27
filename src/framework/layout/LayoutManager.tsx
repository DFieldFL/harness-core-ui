import React, { useEffect, useState } from 'react'
import type { Route, AppStore } from 'framework'
import { PageLayout } from './PageLayout'
import { navRegistry } from 'framework/registry'
import { useAppStoreWriter } from 'framework/hooks/useAppStore'

/**
 * LayoutManger handles page layout. It's responsible for composing
 * the right Layout for a page when a route is mounted.
 */
export const LayoutManager: React.FC<{ route?: Route }> = ({ children, route }) => {
  const updateApplicationStore = useAppStoreWriter()
  const LayoutComponent = route && ((route?.layout || PageLayout.DefaultLayout) as React.ElementType)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!mounted) {
      updateApplicationStore((previousState: AppStore) => ({
        ...previousState,
        navRegistry: navRegistry
      }))
      setMounted(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{!mounted ? null : LayoutComponent ? <LayoutComponent>{children}</LayoutComponent> : children}</>
}
