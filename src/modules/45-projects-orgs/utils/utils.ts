import type { StringKeys } from 'framework/strings/StringsContext'
import { ModuleName } from 'framework/types/ModuleName'

export const getModulePurpose = (module: ModuleName): string => {
  switch (module) {
    case ModuleName.CD:
      return 'Delivery'
    case ModuleName.CV:
      return 'Verification'
    case ModuleName.CI:
      return 'Integration'
    case ModuleName.CE:
      return 'Efficiency'
    case ModuleName.CF:
      return 'Features'
  }
  return ''
}

export const getModuleDescription = (module: ModuleName): StringKeys => {
  switch (module) {
    case ModuleName.CD:
      return 'projectsOrgs.purposeList.descriptionCD'
    case ModuleName.CV:
      return 'projectsOrgs.purposeList.descriptionCV'
    case ModuleName.CI:
      return 'projectsOrgs.purposeList.descriptionCI'
    case ModuleName.CE:
      return 'projectsOrgs.purposeList.descriptionCE'
    case ModuleName.CF:
      return 'projectsOrgs.purposeList.descriptionCF'
  }
  return 'projectsOrgs.blank'
}
