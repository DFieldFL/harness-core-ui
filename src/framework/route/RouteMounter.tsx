import { Text } from '@wings-software/uikit'
import type { Route } from 'framework'
import { buildLoginUrlFrom401Response } from 'framework/utils/framework-utils'
import SessionToken from 'framework/utils/SessionToken'
import React, { Suspense, useEffect, useState } from 'react'
import i18n from './RouteMounter.i18n'
import css from './RouteMounter.module.scss'
import { useAppStoreWriter } from 'framework/hooks/useAppStore'
import { useParams } from 'react-router-dom'
import queryString from 'query-string'
import type { RouteParams } from 'framework/types/RouteParams'

const Loading = <Text className={css.loading}>{i18n.loading}</Text>
let activeRoute: Route
let activeRouteParams: RouteParams

interface RouteMounterProps {
  route: Route
  onEnter?: (route: Route) => void
  onExit?: (route: Route) => void
}

export const RouteMounter: React.FC<RouteMounterProps> = ({ route, onEnter, onExit }) => {
  const [mounted, setMounted] = useState(false)
  const { title, component: page, pageId } = route
  const PageComponent = page as React.ElementType
  const updateApplicationState = useAppStoreWriter()
  const params = useParams()
  const query = queryString.parse(window.location.href.split('?')[1])

  activeRouteParams = { params, query }

  useEffect(() => {
    // TODO: Add accountName into title
    document.title = `Harness | ${title}`
    document.body.setAttribute('page-id', pageId)

    onEnter?.(route)
    activeRoute = route

    if (!mounted) {
      if (route.authenticated !== false && !SessionToken.isAuthenticated()) {
        window.location.href = buildLoginUrlFrom401Response()
        return
      } else {
        setMounted(true)
        updateApplicationState({ route })
      }
    }

    return () => {
      onExit?.(route)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Suspense fallback={Loading}>{mounted ? <PageComponent /> : null}</Suspense>
}

/**
 * Utility to test if a route is active.
 * @param route Route to test.
 * @returns true if the route is active.
 */
export function isRouteActive(route: Route): boolean {
  return route === activeRoute
}

/**
 * Get active route params.
 * @returns RouteParams object of the active route.
 */
export function routeParams(): RouteParams {
  return activeRouteParams
}
