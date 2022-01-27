/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type {
  ResponseInputSetTemplateResponse,
  ResponsePlanExecutionResponseDto,
  ResponsePMSPipelineResponseDTO,
  ResponseRetryInfo
} from 'services/pipeline-ng'

export const mockRetryStages: UseGetMockDataWithMutateAndRefetch<ResponseRetryInfo> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      errorMessage: null as unknown as undefined,
      groups: [
        {
          info: [
            {
              name: 'stage1',
              identifier: 'stage1',
              status: 'Success',
              createdAt: 1637196823530,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'FkJ2JI9ySIaz4dMiOWiHTA'
            }
          ]
        },
        {
          info: [
            {
              name: 'stage2',
              identifier: 'stage2',
              status: 'Success',
              createdAt: 1637196843381,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'MR-2RZXuTiKQniQcka-aAQ'
            }
          ]
        },
        {
          info: [
            {
              name: 'stage3',
              identifier: 'stage3',
              status: 'Failed',
              createdAt: 1637196850227,
              parentId: 'MR-2RZXuTiKQniQcka-aAQ',
              nextId: null as unknown as undefined
            },
            {
              name: 'stage4',
              identifier: 'stage4',
              status: 'Success',
              createdAt: 1637196850248,
              parentId: 'MR-2RZXuTiKQniQcka-aAQ',
              nextId: null as unknown as undefined
            }
          ]
        }
      ],
      resumable: true
    },
    metaData: null as unknown as undefined,
    correlationId: '04b10adc-2516-4185-bc53-67c35d12ab01'
  }
}

export const mockPostRetryPipeline: UseGetMockDataWithMutateAndRefetch<ResponsePlanExecutionResponseDto> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      planExecution: {
        uuid: 'puqa4ivwRzGDUrYJdrcPbg',
        createdAt: 1642671599437,
        planId: 'Jxslh-ffQEGkvqB_lrrjhQ',
        setupAbstractions: {
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'default',
          projectIdentifier: 'Bhavya'
        },
        validUntil: 1658309999431 as unknown as undefined,
        status: 'RUNNING',
        startTs: 1642671599431,
        endTs: null as unknown as undefined,
        metadata: {
          runSequence: 3,
          triggerInfo: {
            triggerType: 'MANUAL',
            triggeredBy: {
              uuid: 'KrWK5MceTGyjLqLVRh3FCw',
              identifier: 'bhavya.sinha@harness.io',
              extraInfo: {
                email: 'bhavya.sinha@harness.io'
              }
            },
            isRerun: false
          },
          pipelineIdentifier: 'pipeline2',
          executionUuid: 'puqa4ivwRzGDUrYJdrcPbg',
          moduleType: 'cd',
          retryInfo: {
            isRetry: true,
            rootExecutionId: '5E3H4VokRkWXLnpYV2_u2A',
            parentRetryId: '5E3H4VokRkWXLnpYV2_u2A'
          }
        },
        lastUpdatedAt: 1642671599437,
        version: 0,

        nodeType: 'PLAN',
        nodeId: 'Jxslh-ffQEGkvqB_lrrjhQ'
      }
    },
    metaData: null as unknown as undefined,
    correlationId: '915c7b2f-8a53-483f-878d-3741408fe03e'
  }
}

export const mockInputsetYamlV2: UseGetMockDataWithMutateAndRefetch<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "<+input>"\n',
      inputSetYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "variablevalue"\n',
      latestTemplateYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "<+input>"\n'
    },
    metaData: null as unknown as undefined,
    correlationId: 'e2a0a206-f944-4e87-ae97-ef54cbeeb21e'
  }
}

export const mockgetRetryPipeline: UseGetMockDataWithMutateAndRefetch<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'pipeline:\n    name: retry-pipeline\n    identifier: retrypipeline\n    projectIdentifier: Bhavya\n    orgIdentifier: default\n    tags: {}\n    allowStageExecutions: true\n    stages:\n        - stage:\n              name: stage1\n              identifier: stage1\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: service\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                              artifacts:\n                                  primary:\n                                      spec:\n                                          connectorRef: account.dockertest\n                                          imagePath: harness/todolist-sample\n                                          tag: <+input>\n                                      type: DockerRegistry\n                  infrastructure:\n                      environmentRef: env\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: org.test\n                              namespace: afdfd\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                type: ShellScript\n                                name: shell1\n                                identifier: shell1\n                                spec:\n                                    shell: Bash\n                                    onDelegate: true\n                                    source:\n                                        type: Inline\n                                        spec:\n                                            script: exit 0\n                                    environmentVariables: []\n                                    outputVariables: []\n                                    executionTarget: {}\n                                timeout: 10m\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n        - stage:\n              name: stage2\n              identifier: stage2\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: env\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.K8sConn\n                              namespace: acd\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                type: ShellScript\n                                name: shell2\n                                identifier: shell2\n                                spec:\n                                    shell: Bash\n                                    onDelegate: true\n                                    source:\n                                        type: Inline\n                                        spec:\n                                            script: exit 0\n                                    environmentVariables: []\n                                    outputVariables: []\n                                    executionTarget: {}\n                                timeout: 10m\n                      rollbackSteps: []\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n        - parallel:\n              - stage:\n                    name: stage3\n                    identifier: stage3\n                    description: ""\n                    type: Deployment\n                    spec:\n                        serviceConfig:\n                            serviceRef: service\n                            serviceDefinition:\n                                type: Kubernetes\n                                spec:\n                                    variables: []\n                        infrastructure:\n                            environmentRef: env\n                            infrastructureDefinition:\n                                type: KubernetesDirect\n                                spec:\n                                    connectorRef: org.test\n                                    namespace: name1\n                                    releaseName: release-<+INFRA_KEY>\n                            allowSimultaneousDeployments: false\n                        execution:\n                            steps:\n                                - step:\n                                      type: ShellScript\n                                      name: shell3\n                                      identifier: shell3\n                                      spec:\n                                          shell: Bash\n                                          onDelegate: true\n                                          source:\n                                              type: Inline\n                                              spec:\n                                                  script: exit 1\n                                          environmentVariables: []\n                                          outputVariables: []\n                                          executionTarget: {}\n                                      timeout: 10m\n                            rollbackSteps: []\n                    tags: {}\n                    failureStrategies:\n                        - onFailure:\n                              errors:\n                                  - AllErrors\n                              action:\n                                  type: StageRollback\n              - stage:\n                    name: stage4\n                    identifier: stage4\n                    description: ""\n                    type: Deployment\n                    spec:\n                        serviceConfig:\n                            serviceRef: service\n                            serviceDefinition:\n                                type: Kubernetes\n                                spec:\n                                    variables: []\n                        infrastructure:\n                            environmentRef: env\n                            infrastructureDefinition:\n                                type: KubernetesDirect\n                                spec:\n                                    connectorRef: org.test\n                                    namespace: name1\n                                    releaseName: release-<+INFRA_KEY>\n                            allowSimultaneousDeployments: false\n                        execution:\n                            steps:\n                                - step:\n                                      type: ShellScript\n                                      name: shell4\n                                      identifier: shell4\n                                      spec:\n                                          shell: Bash\n                                          onDelegate: true\n                                          source:\n                                              type: Inline\n                                              spec:\n                                                  script: exit 0\n                                          environmentVariables: []\n                                          outputVariables: []\n                                          executionTarget: {}\n                                      timeout: 10m\n                            rollbackSteps: []\n                    tags: {}\n                    failureStrategies:\n                        - onFailure:\n                              errors:\n                                  - AllErrors\n                              action:\n                                  type: StageRollback\n        - stage:\n              name: stage5\n              identifier: stage5\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: service\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: <+input>\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: org.test\n                              namespace: fadfd\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                type: ShellScript\n                                name: shell5\n                                identifier: shell5\n                                spec:\n                                    shell: Bash\n                                    onDelegate: true\n                                    source:\n                                        type: Inline\n                                        spec:\n                                            script: exit 1\n                                    environmentVariables: []\n                                    outputVariables: []\n                                    executionTarget: {}\n                                timeout: 10m\n                      rollbackSteps: []\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n',
      version: 74,
      modules: ['cd']
    },
    metaData: null as unknown as undefined,
    correlationId: '70f98267-de06-437f-b4ec-4c91b7353916'
  }
}
