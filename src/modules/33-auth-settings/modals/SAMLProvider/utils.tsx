/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { AuthenticationMechanisms } from '@auth-settings/constants/utils'
import type { UseStringsReturn } from 'framework/strings'
export interface FormValues {
  displayName: string
  authorizationEnabled: boolean
  groupMembershipAttr: string
  entityIdEnabled: boolean
  entityIdentifier: string
  clientSecret?: string
  clientId?: string
  samlProviderType?: Providers
  enableClientIdAndSecret: boolean
}

export enum Providers {
  AZURE = 'AZURE',
  OKTA = 'OKTA',
  ONE_LOGIN = 'ONELOGIN',
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
  if (data.samlProviderType) {
    formData.set('samlProviderType', data.samlProviderType)
  }

  if (data.samlProviderType === Providers.AZURE) {
    if (data.authorizationEnabled && data.clientId && data.enableClientIdAndSecret) {
      formData.set('clientId', data.clientId)
    }
    if (data.authorizationEnabled && data.clientSecret && data.enableClientIdAndSecret) {
      formData.set('clientSecret', data.clientSecret)
    }
  }
  if (data.entityIdEnabled && data.entityIdentifier) {
    formData.set('entityIdentifier', data.entityIdentifier)
  }

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
