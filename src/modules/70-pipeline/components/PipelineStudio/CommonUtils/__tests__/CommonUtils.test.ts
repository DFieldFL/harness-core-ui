import type { NgPipeline, StageElementWrapper } from 'services/cd-ng'
import { getSelectStageOptionsFromPipeline } from '../CommonUtils'

function generateStage(idx: number, type: string): StageElementWrapper {
  return {
    stage: {
      identifier: `stageid-${idx}`,
      name: `stage-${idx}`,
      type: type
    }
  }
}

const stage1 = generateStage(1, 'Build')
const stage2 = generateStage(2, 'Deployment')
const stage3 = generateStage(3, 'Build')
const stage4 = generateStage(4, 'Deployment')

const pipeline: NgPipeline = {
  stages: [
    stage1,
    {
      parallel: [stage2, stage3]
    },
    stage4
  ]
} as NgPipeline

describe('getSelectOptionsFromPipeline', () => {
  test('should return correct number of stages', async () => {
    const options = getSelectStageOptionsFromPipeline(pipeline)
    expect(options).toHaveLength(4)
  })
  test('should return correct stage at index', async () => {
    const options = getSelectStageOptionsFromPipeline(pipeline)
    expect(options[0]).toEqual({
      label: stage1.stage.name,
      value: stage1.stage.identifier,
      node: stage1,
      type: stage1.stage.type
    })
    expect(options[1]).toEqual({
      label: stage2.stage.name,
      value: stage2.stage.identifier,
      node: stage2,
      type: stage2.stage.type
    })
    expect(options[2]).toEqual({
      label: stage3.stage.name,
      value: stage3.stage.identifier,
      node: stage3,
      type: stage3.stage.type
    })
    expect(options[3]).toEqual({
      label: stage4.stage.name,
      value: stage4.stage.identifier,
      node: stage4,
      type: stage4.stage.type
    })
  })
})
