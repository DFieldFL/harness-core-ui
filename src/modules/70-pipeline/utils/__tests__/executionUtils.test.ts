/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as utils from '../executionUtils'

import stageGraph from './stage-graph.json'

jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({}))

describe('ExecutionUtils tests', () => {
  describe('getRunningStep tests', () => {
    test('gives current running step from stage graph', () => {
      const result = utils.getActiveStep(stageGraph as unknown as any)

      expect(result).toBe('WOLUCzOCQDWyjJyOLN_9TQ')
    })

    test('handles empty objects', () => {
      expect(utils.getActiveStep({})).toBe(null)
      expect(utils.getActiveStep({ nodeMap: {} })).toBe(null)
      expect(utils.getActiveStep({ nodeAdjacencyListMap: {} })).toBe(null)
      expect(utils.getActiveStep({ nodeMap: {}, nodeAdjacencyListMap: {} })).toBe(null)
    })
  })

  describe('getRunningStageForPipeline tests', () => {
    test('gives current running stage', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Running',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Running'
      )

      expect(stage).toBe('stage2')
    })

    test('gives current running stage - parallel', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['parallel']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            parallel: {
              nodeType: 'parallel',
              edgeLayoutList: {
                currentNodeChildren: ['stage2.1', 'stage2.2'],
                nextIds: ['stage3']
              }
            },
            'stage2.1': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.1'
            },
            'stage2.2': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Running'
      )

      expect(stage).toBe('stage2.1')
    })

    test('handles empty objects', () => {
      const stage = utils.getActiveStageForPipeline({
        layoutNodeMap: {}
      })

      expect(stage).toBe(null)
    })

    test('gives correct stage for completed process', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Success',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Success',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Success'
      )

      expect(stage).toBe('stage3')
    })

    test('gives correct stage for completed process - parallel', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['parallel']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            parallel: {
              nodeType: 'parallel',
              edgeLayoutList: {
                currentNodeChildren: ['stage2.1', 'stage2.2'],
                nextIds: ['stage3']
              }
            },
            'stage2.1': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.1'
            },
            'stage2.2': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.2'
            }
          },
          startingNodeId: 'stage1'
        },
        'Success'
      )

      expect(stage).toBe('stage2.2')
    })

    test('gives correct stage for completed process where last stage is skipped', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Success',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Skipped',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Success'
      )

      expect(stage).toBe('stage2')
    })

    test('gives correct stage for errored process', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Failed',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Failed'
      )

      expect(stage).toBe('stage2')
    })

    test('gives correct stage for errored process - parallel', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['parallel']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            parallel: {
              nodeType: 'parallel',
              edgeLayoutList: {
                currentNodeChildren: ['stage2.1', 'stage2.2'],
                nextIds: ['stage3']
              }
            },
            'stage2.1': {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Failed',
              nodeUuid: 'stage2.1'
            },
            'stage2.2': {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Success',
              nodeUuid: 'stage2.2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Failed'
      )

      expect(stage).toBe('stage2.1')
    })
  })
})
