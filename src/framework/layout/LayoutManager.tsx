import React, { useEffect, useState } from 'react'
import type { RouteInfo, AppStore } from 'framework'
import { PageLayout } from './PageLayout'
import { moduleRegistry } from 'modules'
import { useAppStoreWriter } from 'framework/hooks/useAppStore'

/**
 * LayoutManger handles page layout. It's responsible for composing
 * the right Layout for a page when a route is mounted.
 */
export const LayoutManager: React.FC<{ routeInfo?: RouteInfo }> = ({ children, routeInfo }) => {
  const updateApplicationStore = useAppStoreWriter()
  const LayoutComponent = routeInfo && (routeInfo?.layout || PageLayout.DefaultLayout)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!mounted) {
      updateApplicationStore((previousState: AppStore) => ({
        ...previousState,
        moduleRegistry: moduleRegistry
      }))
      setMounted(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{!mounted ? null : LayoutComponent ? <LayoutComponent>{children}</LayoutComponent> : children}</>
}
