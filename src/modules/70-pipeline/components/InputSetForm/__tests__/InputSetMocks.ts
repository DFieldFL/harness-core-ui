/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData, UseMutateMockData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import type {
  ResponseInputSetResponse,
  ResponseInputSetTemplateResponse,
  ResponseMergeInputSetResponse,
  ResponseOverlayInputSetResponse,
  ResponsePageInputSetSummaryResponse,
  ResponsePMSPipelineResponseDTO
} from 'services/pipeline-ng'

export const TemplateResponse: UseGetReturnData<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "testqqq"\n  stages:\n  - stage:\n      identifier: "asd"\n      type: "Deployment"\n      spec:\n        infrastructure:\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "<+input>"\n              namespace: "<+input>"\n              releaseName: "<+input>"\n'
    },
    correlationId: '54a0c3b6-62aa-4f19-ba57-ab69599299b0'
  }
}

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      ngPipeline: {
        pipeline: {
          name: 'testsdfsdf',
          identifier: 'testqqq',
          description: '',
          tags: null,
          variables: null,
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      yamlPipeline:
        'pipeline:\n  name: testsdfsdf\n  identifier: testqqq\n  description: ""\n  stages:\n    - stage:\n        name: asd\n        identifier: asd\n        description: ""\n        type: Deployment\n        spec:\n          service:\n            identifier: asd\n            name: asd\n            description: ""\n            serviceDefinition:\n              type: Kubernetes\n              spec:\n                artifacts:\n                  sidecars: []\n                  primary:\n                    type: Dockerhub\n                    spec:\n                      connectorRef: org.docker\n                      imagePath: asd\n                manifests: []\n                artifactOverrideSets: []\n                manifestOverrideSets: []\n          execution:\n            steps:\n              - step:\n                  name: Rollout Deployment\n                  identifier: rolloutDeployment\n                  type: K8sRollingDeploy\n                  spec:\n                    timeout: 10m\n                    skipDryRun: false\n            rollbackSteps:\n              - step:\n                  name: Rollback Rollout Deployment\n                  identifier: rollbackRolloutDeployment\n                  type: K8sRollingRollback\n                  spec:\n                    timeout: 10m\n          infrastructure:\n            environment:\n              name: qa\n              identifier: qa\n              description: ""\n              type: PreProduction\n            infrastructureDefinition:\n              type: KubernetesDirect\n              spec:\n                connectorRef: <+input>\n                namespace: <+input>\n                releaseName: <+input>\n'
    } as any,
    correlationId: '7a84d477-4549-4026-8113-a02730b4f7c5'
  }
}

export const MergedPipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      ngPipeline: {
        pipeline: {
          name: 'testsdfsdf',
          identifier: 'testqqq',
          description: '',
          tags: null,
          variables: null,
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      mergedPipelineYaml:
        'name: testsdfsdf\nidentifier: testqqq\ndescription: ""\nstages:\n  - stage:\n      name: asd\n      identifier: asd\n      description: ""\n      type: Deployment\n      spec:\n        service:\n          identifier: asd\n          name: asd\n          description: ""\n          serviceDefinition:\n            type: Kubernetes\n            spec:\n              artifacts:\n                sidecars: []\n                primary:\n                  type: Dockerhub\n                  spec:\n                    connectorRef: org.docker\n                    imagePath: asd\n              manifests: []\n              artifactOverrideSets: []\n              manifestOverrideSets: []\n        execution:\n          steps:\n            - step:\n                name: Rollout Deployment\n                identifier: rolloutDeployment\n                type: K8sRollingDeploy\n                spec:\n                  timeout: 10m\n                  skipDryRun: false\n          rollbackSteps:\n            - step:\n                name: Rollback Rollout Deployment\n                identifier: rollbackRolloutDeployment\n                type: K8sRollingRollback\n                spec:\n                  timeout: 10m\n        infrastructure:\n          environment:\n            name: qa\n            identifier: qa\n            description: ""\n            type: PreProduction\n          infrastructureDefinition:\n            type: KubernetesDirect\n            spec:\n              connectorRef: <+input>\n              namespace: <+input>\n              releaseName: <+input>\n'
    } as any,
    correlationId: '7a84d477-4549-4026-8113-a02730b4f7c5'
  }
}

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa1',
        identifier: 'tesa1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const GetInputSetsResponse: UseGetReturnData<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 2,
      pageItemCount: 2,
      pageSize: 100,
      content: [
        {
          identifier: 'asd',
          name: 'asd',
          pipelineIdentifier: 'testqqq',
          description: 'asd',
          inputSetType: 'INPUT_SET'
        },
        {
          identifier: 'test',
          name: 'test',
          pipelineIdentifier: 'testqqq',
          description: 'sdf',
          inputSetType: 'INPUT_SET'
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: 'dbc7238c-380f-4fe0-b160-a29510cfe0c8'
  }
}

export const GetInputSetEdit: UseGetReturnData<ResponseInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'Harness11',
      projectIdentifier: 'Uhat_Project',
      pipelineIdentifier: 'testqqq',
      identifier: 'asd',
      inputSetYaml:
        'inputSet:\n  name: asd\n  identifier: asd\n  description: asd\n  pipeline:\n    identifier: testqqq\n    stages:\n      - stage:\n          identifier: asd\n          type: Deployment\n          spec:\n            infrastructure:\n              infrastructureDefinition:\n                type: KubernetesDirect\n                spec:\n                  connectorRef: org.tesa1\n                  namespace: asd\n                  releaseName: asd\n',
      name: 'asd',
      description: 'asd',
      errorResponse: false
    },
    correlationId: 'fdb1358f-c3b8-459b-aa89-4e570b7ac6d0'
  }
}

export const GetOverlayInputSetEdit: UseGetReturnData<ResponseOverlayInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'Harness11',
      projectIdentifier: 'Uhat_Project',
      pipelineIdentifier: 'testqqq',
      identifier: 'OverLayInput',
      name: 'OverLayInput',
      description: 'OverLayInput',
      inputSetReferences: ['asd', 'test'],
      overlayInputSetYaml:
        'overlayInputSet:\n  name: OverLayInput\n  identifier: OverLayInput\n  description: OverLayInput\n  inputSetReferences:\n    - asd\n    - test\n',
      errorResponse: false
    },
    correlationId: '4cccf1ad-e86d-4629-9c85-95a23225f2e4'
  }
}

export const MergeInputSetResponse: UseMutateMockData<ResponseMergeInputSetResponse> = {
  loading: false,
  mutate: () =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        pipelineYaml:
          'pipeline:\n  identifier: "testqqq"\n  stages:\n  - stage:\n      identifier: "asd"\n      type: "Deployment"\n      spec:\n        infrastructure:\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "org.tesa1"\n              namespace: "asd"\n              releaseName: "asd"\n',
        inputSetErrorWrapper: {},
        errorResponse: false
      },
      correlationId: 'ec1dec41-213d-4164-8cfc-4198d6565f88'
    })
}
