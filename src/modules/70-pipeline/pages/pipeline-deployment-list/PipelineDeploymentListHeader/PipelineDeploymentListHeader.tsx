import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonGroup } from '@wings-software/uicore'

import { String } from 'framework/strings'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

import StatusSelect from '@pipeline/components/StatusSelect/StatusSelect'
import PipelineSelect from '@pipeline/components/PipelineSelect/PipelineSelect'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { GetListOfExecutionsQueryParams } from 'services/pipeline-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { useFiltersContext } from '../FiltersContext/FiltersContext'
import { ExecutionFilters } from './ExecutionFilters/ExecutionFilters'
import type { QuickStatusParam } from '../types'
import css from './PipelineDeploymentListHeader.module.scss'

export interface FilterQueryParams {
  query?: string
  pipeline?: string
  status?: ExecutionStatus | null
}
export interface PipelineDeploymentListHeaderProps {
  onRunPipeline(): void
}

const defaultPageNumber = 1

export function PipelineDeploymentListHeader(props: PipelineDeploymentListHeaderProps): React.ReactElement {
  const { module, pipelineIdentifier } = useParams<Partial<PipelineType<PipelinePathProps>>>()
  const { queryParams } = useFiltersContext()
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()

  function handleMyDeployments(): void {
    updateQueryParams({ myDeployments: true })
  }

  function handleAllDeployments(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateQueryParams({ myDeployments: [] as any }) // removes the param
  }

  function handleStatusChange(status?: QuickStatusParam | null): void {
    if (status) {
      updateQueryParams({ status, page: defaultPageNumber })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQueryParams({ status: [] as any }) // removes the param
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function handlePipelineChange(pipelineIdentifier?: string): void {
    if (pipelineIdentifier) {
      updateQueryParams({ pipelineIdentifier, page: defaultPageNumber })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQueryParams({ pipelineIdentifier: [] as any }) // removes the param
    }
  }

  return (
    <div className={css.main}>
      <div className={css.lhs}>
        <RbacButton
          icon="run-pipeline"
          intent="primary"
          onClick={props.onRunPipeline}
          permission={{
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: pipelineIdentifier || queryParams.pipelineIdentifier
            },
            permission: PermissionIdentifier.EXECUTE_PIPELINE,
            options: {
              skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
            }
          }}
        >
          <String className={css.runText} stringID="runPipelineText" />
        </RbacButton>
        <div className={css.filterGroup}>
          <String className={css.label} stringID={module === 'ci' ? 'buildsText' : 'deploymentsText'} />
          <ButtonGroup className={css.btnGroup}>
            <Button
              intent={!queryParams.myDeployments ? 'primary' : 'none'}
              onClick={handleAllDeployments}
              withoutBoxShadow
            >
              <String stringID="all" />
            </Button>
            <Button
              intent={queryParams.myDeployments ? 'primary' : 'none'}
              onClick={handleMyDeployments}
              withoutBoxShadow
            >
              <String stringID="common.My" />
            </Button>
          </ButtonGroup>
        </div>
        <>
          <div className={css.filterGroup}>
            <String className={css.label} stringID="status" />
            <StatusSelect value={queryParams.status} onSelect={handleStatusChange} />
          </div>
          {pipelineIdentifier ? null : (
            <div className={css.filterGroup}>
              <String className={css.label} stringID="pipelines" />
              <PipelineSelect
                selectedPipeline={queryParams.pipelineIdentifier}
                onPipelineSelect={handlePipelineChange}
              />
            </div>
          )}
        </>
      </div>
      <div className={css.rhs}>
        <ExecutionFilters />
      </div>
    </div>
  )
}
