import type { MultiSelectOption } from '@wings-software/uicore'
import { omit, startCase } from 'lodash-es'
import type { PipelineExecutionFilterProperties, FilterDTO } from 'services/pipeline-ng'

import { EXECUTION_STATUS } from '@pipeline/utils/statusHelpers'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { StringUtils } from '@common/exports'
import type { CIBuildResponseDTO } from '@pipeline/pages/pipeline-deployment-list/ExecutionsList/ExecutionCard/ExecutionDetails/Types/types'
import type { FilterProperties } from 'services/cd-ng'
import { isObjectEmpty, removeNullAndEmpty } from '@common/components/Filter/utils/FilterUtils'

export interface BuildContext {
  buildType?: BUILD_TYPE
  repositoryName?: string
  sourceBranch?: string
  targetBranch?: string
  branch?: string
  tag?: string
}

const exclusionList = ['buildType', 'repositoryName', 'sourceBranch', 'targetBranch', 'tag', 'branch']

export const getValidFilterArguments = (formData: Record<string, any>): PipelineExecutionFilterProperties => {
  const { status, buildType, repositoryName, sourceBranch, targetBranch, branch, tag } = formData
  const statusOptions = status?.map((type: MultiSelectOption) => type?.value)
  return Object.assign(omit(formData, ...exclusionList), {
    status: statusOptions,
    moduleProperties: getModuleProperties(buildType as BUILD_TYPE, {
      repositoryName,
      sourceBranch,
      targetBranch,
      branch,
      tag
    })
  })
}

export type PipelineExecutionFormType = Omit<PipelineExecutionFilterProperties, 'status'> & {
  status?: MultiSelectOption[]
} & BuildContext

export const createOption = (label: string, value: string, count?: number): MultiSelectOption => {
  const labelWithCount =
    count && count > 0
      ? label
          .concat(' ')
          .concat('(')
          .concat((count || '').toString())
          .concat(')')
      : label
  return {
    label: labelWithCount,
    value: value
  } as MultiSelectOption
}

export const getOptionsForMultiSelect = (): MultiSelectOption[] => {
  return Object.keys(EXECUTION_STATUS).map(key => {
    const text = EXECUTION_STATUS[parseInt(key)] || ''
    return createOption(startCase(text), text)
  })
}

export const createRequestBodyPayload = ({
  isUpdate,
  data,
  projectIdentifier,
  orgIdentifier
}: {
  isUpdate: boolean
  data: FilterDataInterface<PipelineExecutionFormType, FilterInterface>
  projectIdentifier: string
  orgIdentifier: string
}): FilterDTO => {
  const {
    metadata: { name: _name, filterVisibility, identifier },
    formValues
  } = data
  const { pipelineName, status: _statuses, moduleProperties: _moduleProperties } = getValidFilterArguments(formValues)
  return {
    name: _name,
    identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
    filterVisibility: filterVisibility,
    projectIdentifier,
    orgIdentifier,
    filterProperties: {
      filterType: 'PipelineExecution',
      pipelineName: pipelineName || '',
      status: _statuses,
      moduleProperties: _moduleProperties as PipelineExecutionFilterProperties['moduleProperties']
    } as PipelineExecutionFilterProperties
  }
}

const getModuleProperties = (buildType: BUILD_TYPE, contextInfo: BuildContext): any => {
  const { repositoryName, sourceBranch, targetBranch, branch, tag } = contextInfo
  let moduleProperties
  switch (buildType) {
    case BUILD_TYPE.PULL_OR_MERGE_REQUEST:
      moduleProperties = {
        ci: {
          ciExecutionInfoDTO: {
            event: 'pullRequest',
            pullRequest: { sourceRepo: repositoryName, sourceBranch: sourceBranch, targetBranch: targetBranch }
          } as CIBuildResponseDTO
        }
      }
      break
    case BUILD_TYPE.BRANCH:
      moduleProperties = {
        ci: {
          branch: branch
        }
      }
      break
    case BUILD_TYPE.TAG:
      moduleProperties = {
        ci: {
          tag: tag
        }
      }
      break
  }

  return moduleProperties
}

export const enum BUILD_TYPE {
  PULL_OR_MERGE_REQUEST = 'PULL_OR_MERGE_REQUEST',
  BRANCH = 'BRANCH',
  TAG = 'TAG'
}

export const getFilterWithValidFields = (
  formData: PipelineExecutionFormType | undefined,
  filterProperties: FilterProperties | undefined
): Partial<PipelineExecutionFormType> | Partial<FilterProperties> | undefined => {
  if (!isObjectEmpty(filterProperties || {})) {
    return removeNullAndEmpty(omit(filterProperties, 'filterType'))
  } else if (!isObjectEmpty(formData || {})) {
    return removeNullAndEmpty(formData || {})
  }
  return {}
}

export const getBuildType = (moduleProperties: {
  [key: string]: {
    [key: string]: any
  }
}): BUILD_TYPE | undefined => {
  const { branch, tag, ciExecutionInfoDTO } = moduleProperties?.ci || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}

  return sourceBranch && targetBranch
    ? BUILD_TYPE.PULL_OR_MERGE_REQUEST
    : branch
    ? BUILD_TYPE.BRANCH
    : tag
    ? BUILD_TYPE.TAG
    : undefined
}
