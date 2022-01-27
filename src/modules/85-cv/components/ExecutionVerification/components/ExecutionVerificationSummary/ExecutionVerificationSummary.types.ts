/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionNode } from 'services/pipeline-ng'
import type { DeploymentNodeAnalysisResult } from '../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'

export interface VerifyExecutionProps {
  step: ExecutionNode
  stageType?: StageType
  displayAnalysisCount?: boolean
  onSelectNode?: (selectedNode?: DeploymentNodeAnalysisResult) => void
  className?: string
  isConsoleView?: boolean
}
