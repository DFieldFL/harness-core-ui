import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { DatadogInitialValue } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { setSecretField } from '@secrets/utils/SecretField'

export interface SpecData {
  url: string
  applicationKeyRef: string
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

export async function initializeDatadogConnectorWithStepData(
  prevStepData: ConnectorConfigDTO | undefined,
  accountId = ''
): Promise<ConnectorConfigDTO | undefined> {
  if (!prevStepData) {
    return
  }

  const { spec, ...prevData } = prevStepData
  const updatedInitialValues = {
    ...spec,
    ...prevData
  }

  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'url' as AllowedKeyList)
  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'apiKeyRef' as AllowedKeyList)
  updateInitialValue(
    prevData as PrevData,
    spec as SpecData,
    updatedInitialValues,
    'applicationKeyRef' as AllowedKeyList
  )

  const initValueWithSecrets = await setDatadogSecrets(updatedInitialValues, accountId)
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

export async function setDatadogSecrets(
  initialValues: DatadogInitialValue,
  accountId: string
): Promise<DatadogInitialValue> {
  const { projectIdentifier, orgIdentifier, apiKeyRef, applicationKeyRef } = initialValues || {}
  if (apiKeyRef && typeof apiKeyRef !== 'object' && applicationKeyRef && typeof applicationKeyRef !== 'object') {
    const resultAPIkey = await setSecretField(apiKeyRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    const resultAPPkey = await setSecretField(applicationKeyRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    initialValues.apiKeyRef = resultAPIkey
    initialValues.applicationKeyRef = resultAPPkey
  }
  return initialValues
}
