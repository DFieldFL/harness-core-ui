import type { IconName } from '@wings-software/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ModuleName } from 'framework/types/ModuleName'

interface SetPageNumberProps {
  setPage: (value: React.SetStateAction<number>) => void
  pageItemsCount?: number
  page: number
}

export const getModuleIcon = (module: ModuleName): IconName => {
  switch (module) {
    case ModuleName.CD:
      return 'cd-main'
    case ModuleName.CV:
      return 'cv-main'
    case ModuleName.CI:
      return 'ci-main'
    case ModuleName.CE:
      return 'ce-main'
    case ModuleName.CF:
      return 'cf-main'
  }
  return 'nav-project'
}

export const getReference = (scope?: Scope, identifier?: string): string | undefined => {
  switch (scope) {
    case Scope.PROJECT:
      return identifier
    case Scope.ORG:
      return `org.${identifier}`
    case Scope.ACCOUNT:
      return `account.${identifier}`
  }
}

export const setPageNumber = ({ setPage, pageItemsCount, page }: SetPageNumberProps): void => {
  if (pageItemsCount === 0 && page > 0) {
    setPage(page - 1)
  }
}
