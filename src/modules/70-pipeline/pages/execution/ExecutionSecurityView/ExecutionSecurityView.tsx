/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { PipelineSecurityView } from '@sto/PipelineSecurityView'

export default function ExecutionSecurityView(): React.ReactElement | null {
  const { accountId, orgIdentifier, projectIdentifier, pipelineIdentifier, executionIdentifier, module } =
    useParams<PipelineType<ExecutionPathProps>>()
  const context = useExecutionContext()
  const pipelineExecutionDetail = context?.pipelineExecutionDetail

  if (!pipelineExecutionDetail || !pipelineExecutionDetail.pipelineExecutionSummary) {
    return null
  }

  return (
    <Container width="100%" height="100%">
      <PipelineSecurityView
        pipelineExecutionDetail={pipelineExecutionDetail}
        accountId={accountId}
        module={module}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        pipelineIdentifier={pipelineIdentifier}
        executionIdentifier={executionIdentifier}
      />
    </Container>
  )
}
