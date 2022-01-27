/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  Failure,
  ResponseListJiraProjectBasicNG,
  ResponseListJiraStatusNG,
  StepElementConfig,
  UseGetJiraProjectsProps,
  UseGetJiraStatusesProps
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { JiraCreateFieldType, JiraFieldNGWithValue } from '../JiraCreate/types'

export interface JiraUpdateData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    issueKey: string
    transitionTo?: {
      status: string | SelectOption
      transitionName: string
    }
    fields: JiraCreateFieldType[]
    selectedFields?: JiraFieldNGWithValue[]
    delegateSelectors?: string[]
  }
}

export interface JiraUpdateVariableListModeProps {
  variablesData: JiraUpdateData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JiraUpdateStepModeProps {
  stepViewType: StepViewType
  initialValues: JiraUpdateData
  onUpdate?: (data: JiraUpdateData) => void
  onChange?: (data: JiraUpdateData) => void
  allowableTypes: MultiTypeInputType[]
  isNewStep?: boolean
  readonly?: boolean
}

export interface JiraUpdateFormContentInterface {
  formik: FormikProps<JiraUpdateData>
  stepViewType: StepViewType
  allowableTypes: MultiTypeInputType[]
  refetchProjects: (props: UseGetJiraProjectsProps) => Promise<void>
  refetchStatuses: (props: UseGetJiraStatusesProps) => Promise<void>
  fetchingProjects: boolean
  fetchingStatuses: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  statusResponse: ResponseListJiraStatusNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  statusFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
  readonly?: boolean
}

export interface JiraUpdateDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: JiraUpdateData
  onUpdate?: (data: JiraUpdateData) => void
  inputSetData?: InputSetData<JiraUpdateData>
  allowableTypes: MultiTypeInputType[]
  formik?: any
}

export interface JiraUpdateDeploymentModeFormContentInterface extends JiraUpdateDeploymentModeProps {
  refetchStatuses: (props: UseGetJiraStatusesProps) => Promise<void>
  fetchingStatuses: boolean
  statusResponse: ResponseListJiraStatusNG | null
  statusFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
}
