import type { IconName } from '@wings-software/uicore'
import { AuthenticationMechanisms } from '@auth-settings/constants/utils'
import type { UseStringsReturn } from 'framework/strings'

export interface FormValues {
  displayName: string
  authorizationEnabled: boolean
  groupMembershipAttr: string
}

export enum Providers {
  AZURE = 'AZURE',
  OKTA = 'OKTA',
  ONE_LOGIN = 'ONE_LOGIN',
  OTHER = 'OTHER'
}

export interface SAMLProviderType {
  value: Providers
  label: string
  icon: IconName
}

export const createFormData = (data: FormValues): FormData => {
  const formData = new FormData()
  formData.set('displayName', data.displayName)
  formData.set('authorizationEnabled', JSON.stringify(data.authorizationEnabled))
  formData.set('groupMembershipAttr', data.groupMembershipAttr)
  formData.set('ssoSetupType', AuthenticationMechanisms.SAML)

  const file = (data as any)?.files?.[0]
  file && formData.set('file', file)

  return formData
}

export const getSelectedSAMLProvider = (
  selected: SAMLProviderType | undefined,
  getString: UseStringsReturn['getString']
): string => {
  if (selected && selected?.value !== Providers.OTHER) {
    return selected.label
  }
  return getString('authSettings.SAMLProvider')
}
