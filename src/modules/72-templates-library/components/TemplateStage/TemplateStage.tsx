import React from 'react'
import { PipelineStage } from '@pipeline/components/PipelineStages/PipelineStage'
import TemplateStageSetupShell from '@templates-library/components/TemplateStageSetupShell/TemplateStageSetupShell'

export class TemplateStage extends PipelineStage<any> {
  render(): JSX.Element {
    const { minimal } = this.props
    if (minimal) {
      return <></>
    }
    return <TemplateStageSetupShell />
  }
}
