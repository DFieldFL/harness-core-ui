import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { match } from 'path-to-regexp'

import type { Module } from 'framework/types/ModuleName'
import { withAccountId } from '@common/utils/routeUtils'

export interface ModuleInfo {
  module?: Module
  accountId: string
}

export interface UseModuleInfoReturn {
  module?: Module
}

const pathToMatch = withAccountId(() => '/:module(ci|cd|cf|cv|ce)')({ accountId: ':accountId' })
const matchModuleFn = match<ModuleInfo>(pathToMatch, { end: false })

export function useModuleInfo(): UseModuleInfoReturn {
  const { pathname } = useLocation()

  const matchModule = useMemo(() => matchModuleFn(pathname), [pathname])

  return { module: matchModule === false ? undefined : matchModule.params.module }
}
