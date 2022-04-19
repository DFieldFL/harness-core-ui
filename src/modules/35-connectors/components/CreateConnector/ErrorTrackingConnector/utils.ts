/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ErrorTrackingInitialValue } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { setSecretField } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO } from 'services/cd-ng'

export interface SpecData {
  url: string
  apiKeyRef: string
  delegateSelectors: string
}

export interface PrevData {
  name: string
  identifier: string
  description: string
  orgIdentifier: string
  projectIdentifier: string
  tags: any
  type: string
}

type AllowedKeyList = keyof PrevData & keyof SpecData

export async function initializeErrorTrackingConnectorWithStepData(
  prevStepData: ConnectorConfigDTO | undefined,
  accountId = ''
): Promise<ConnectorConfigDTO | undefined> {
  if (!prevStepData) {
    return undefined
  }

  const { spec, ...prevData } = prevStepData
  const updatedInitialValues = {
    ...spec,
    ...prevData
  }

  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'url' as AllowedKeyList)
  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'apiKeyRef' as AllowedKeyList)

  const initValueWithSecrets = await setErrorTrackingSecrets(updatedInitialValues, accountId)
  initValueWithSecrets.loading = false
  return initValueWithSecrets
}

function updateInitialValue(
  prevData: PrevData,
  spec: SpecData,
  updatedInitialValues: PrevData & SpecData,
  key: AllowedKeyList
): void {
  if (prevData && prevData[key]) {
    updatedInitialValues[key] = prevData[key]
  } else if (spec && spec[key]) {
    updatedInitialValues[key] = spec[key]
  }
}

async function setErrorTrackingSecrets(
  initialValues: ErrorTrackingInitialValue,
  accountId: string
): Promise<ErrorTrackingInitialValue> {
  const { projectIdentifier, orgIdentifier, apiKeyRef } = initialValues || {}
  if (apiKeyRef && typeof apiKeyRef !== 'object') {
    const resultAPIkey = await setSecretField(apiKeyRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    initialValues.apiKeyRef = resultAPIkey
  }
  return initialValues
}
