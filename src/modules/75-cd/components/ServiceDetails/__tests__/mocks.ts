/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { NativeHelmInstanceInfoDTO, ResponseInstancesByBuildIdList } from 'services/cd-ng'

export const mockserviceInstanceDetails: UseGetMockDataWithMutateAndRefetch<ResponseInstancesByBuildIdList> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      instancesByBuildIdList: [
        {
          buildId: '',
          instances: [
            {
              podName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb-todolist-llk7p',
              artifactName: '',
              connectorRef: 'account.K8sPlaygroundTest',
              infrastructureDetails: {
                namespace: 'default',
                releaseName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb'
              },
              terraformInstance: null as unknown as undefined,
              deployedAt: 1643027218996,
              deployedById: 'AUTO_SCALED',
              deployedByName: 'AUTO_SCALED',
              pipelineExecutionName: 'AUTO_SCALED'
            },
            {
              podName: 'gcs-v2helm-todolist-768f49bcfb-5m6tx',
              artifactName: '',
              connectorRef: 'account.K8s_CDP_v115',
              infrastructureDetails: {
                namespace: 'default',
                releaseName: 'gcs-v2helm'
              },
              terraformInstance: null as unknown as undefined,
              deployedAt: 1643027808183,
              deployedById: '4QWHXCwYQN2dU8fVWqv3sg',
              deployedByName: 'automationpipelinesng@mailinator.com',
              pipelineExecutionName: 'v2GcsHelmChart'
            },
            {
              podName: 'v2helm-test-new-nginx-ingress-controller-7f644d49c5-v9rxk',
              artifactName: '',
              connectorRef: 'account.K8s_CDP_v115',
              infrastructureDetails: {
                namespace: 'default',
                releaseName: 'v2helm-test-new'
              },
              instanceInfoDTO: {
                helmChartInfo: {
                  name: 'todolist',
                  repoUrl: 'https://github.com/wings-software/PipelinesNgAutomation',
                  version: '0.2.0'
                },
                helmVersion: 'V3',
                namespace: 'default',
                podName: 'v2helm-test-new-nginx-ingress-controller-7f644d49c5-v9rxk',
                releaseName: 'v2helm-test-new'
              } as NativeHelmInstanceInfoDTO,
              terraformInstance: null as unknown as undefined,
              deployedAt: 1643027303485,
              deployedById: '4QWHXCwYQN2dU8fVWqv3sg',
              deployedByName: 'automationpipelinesng@mailinator.com',
              pipelineExecutionName: 'v2Install'
            }
          ]
        }
      ]
    },
    metaData: null as unknown as undefined,
    correlationId: 'a9d67688-9100-4e38-8da6-9852a62bc422'
  }
}
