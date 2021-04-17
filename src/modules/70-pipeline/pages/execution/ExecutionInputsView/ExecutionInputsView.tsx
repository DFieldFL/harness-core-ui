import React from 'react'
import { useParams } from 'react-router-dom'

import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetInputsetYaml } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import type { ResponseJsonNode } from 'services/cd-ng'

import css from './ExecutionInputsView.module.scss'

interface ExecutionInputsViewInterface {
  mockData?: ResponseJsonNode
}

export default function ExecutionInputsView(props: ExecutionInputsViewInterface): React.ReactElement {
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, module, executionIdentifier } = useParams<
    PipelineType<ExecutionPathProps>
  >()

  const { data, loading } = useGetInputsetYaml({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const [inputSetYaml, setInputSetYaml] = React.useState('')
  React.useEffect(() => {
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;((data as unknown) as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [data])

  // React.useEffect(() => {
  //   if (query.executionId && query.executionId !== null) {
  //     refetch()
  //   }
  // }, [query.executionId])

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className={css.main}>
      <RunPipelineForm
        pipelineIdentifier={pipelineIdentifier}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        accountId={accountId}
        module={module}
        inputSetYAML={inputSetYaml || ''}
        executionView
        mockData={props.mockData}
      />
    </div>
  )
}
