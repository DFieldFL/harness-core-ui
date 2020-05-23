import { Text } from '@wings-software/uikit'
import type { RouteEntry } from 'framework'
import React, { Suspense, useEffect, useState } from 'react'
import i18n from './RouteMounter.i18n'
import css from './RouteMounter.module.scss'
import SessionToken from 'framework/utils/SessionToken'
import { buildLoginUrlFrom401Response } from 'framework/utils/Utils'

const Loading = <Text className={css.loading}>{i18n.loading}</Text>

interface RouteMounterProps {
  routeEntry: RouteEntry
  onEnter?: (routeEntry: RouteEntry) => void
  onExit?: (routeEntry: RouteEntry) => void
}

export const RouteMounter: React.FC<RouteMounterProps> = ({ routeEntry, onEnter, onExit }) => {
  const [mounted, setMounted] = useState(false)
  const { title, component: page, pageId } = routeEntry
  const PageComponent = page as React.ElementType

  useEffect(() => {
    // TODO: Add accountName into title
    document.title = `Harness | ${title}`
    document.body.setAttribute('page-id', pageId)

    onEnter?.(routeEntry)

    if (!mounted) {
      if (routeEntry.authenticated !== false && !SessionToken.isAuthenticated()) {
        window.location.href = buildLoginUrlFrom401Response()
      } else {
        setMounted(true)
      }
    }

    return () => {
      onExit?.(routeEntry)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Suspense fallback={Loading}>{mounted ? <PageComponent /> : null}</Suspense>
}
