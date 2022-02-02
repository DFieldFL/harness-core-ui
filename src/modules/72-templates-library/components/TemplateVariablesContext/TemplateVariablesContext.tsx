/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { useMutateAsGet, UseMutateAsGetReturn } from '@common/hooks/useMutateAsGet'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { Failure, NGTemplateInfoConfig, useCreateVariables, VariableMergeServiceResponse } from 'services/template-ng'

export interface TemplateVariablesData {
  variablesTemplate: NGTemplateInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  error?: UseMutateAsGetReturn<Failure | Error>['error'] | null
  initLoading: boolean
  loading: boolean
}

export const TemplateVariablesContext = React.createContext<TemplateVariablesData>({
  variablesTemplate: { name: '', identifier: '', versionLabel: '', type: 'Step' },
  metadataMap: {},
  error: null,
  initLoading: true,
  loading: false
})

export function useTemplateVariables(): TemplateVariablesData {
  return React.useContext(TemplateVariablesContext)
}

export function TemplateVariablesContextProvider(
  props: React.PropsWithChildren<{ template: NGTemplateInfoConfig }>
): React.ReactElement {
  const { template: originalTemplate } = props
  const [{ variablesTemplate, metadataMap }, setTemplateVariablesData] = React.useState<
    Pick<TemplateVariablesData, 'metadataMap' | 'variablesTemplate'>
  >({
    variablesTemplate: { name: '', identifier: '', versionLabel: '', type: 'Step' },
    metadataMap: {}
  })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<TemplateStudioPathProps>()
  const { data, error, initLoading, loading } = useMutateAsGet(useCreateVariables, {
    body: yamlStringify({ template: originalTemplate }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    debounce: 800
  })
  React.useEffect(() => {
    setTemplateVariablesData({
      metadataMap: defaultTo(data?.data?.metadataMap, {}),
      variablesTemplate: defaultTo(parse(defaultTo(data?.data?.yaml, ''))?.template, {})
    })
  }, [data?.data?.metadataMap, data?.data?.yaml])
  return (
    <TemplateVariablesContext.Provider
      value={{
        variablesTemplate,
        metadataMap,
        error,
        initLoading,
        loading
      }}
    >
      {props.children}
    </TemplateVariablesContext.Provider>
  )
}
