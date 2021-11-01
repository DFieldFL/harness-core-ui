import type { ResponseString, ResponsePageTemplateSummaryResponse } from 'services/template-ng'
import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'

export const mockTemplatesInputYaml: ResponseString = {
  status: 'SUCCESS',
  data:
    'type: "HarnessApproval"\ntimeout: "<+input>"' +
    '\nspec:\n  approvalMessage: "<+input>"\n  approvers:\n    userGroups: "<+input>"\n    minimumCount: "<+input>"\n'
}

export const mockTemplates: ResponsePageTemplateSummaryResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'Templateproject',
        identifier: 'manjutesttemplate',
        name: 'manju-test-template-qq-12344',
        description:
          'Flink is a versatile framework, supporting many different deployment scenarios in a mix and match fashion.',
        tags: { QAR: '', 'Internal 1': '', 'Canary 1': '', BLUE: '', 'Tag A': '' },
        yaml:
          'template:' +
          '\n    name: manju-test-template-qq-12344' +
          '\n    identifier: manjutesttemplate' +
          '\n    versionLabel: v4' +
          '\n    type: Step' +
          '\n    projectIdentifier: Templateproject' +
          '\n    orgIdentifier: default' +
          '\n    description: Flink is a versatile framework, supporting many different deployment scenarios in a mix and match fashion.' +
          '\n    tags:' +
          '\n        QAR: ""' +
          '\n        Internal 1: ""' +
          '\n        Canary 1: ""' +
          '\n        BLUE: ""' +
          '\n        Tag A: ""' +
          '\n    spec:' +
          '\n        type: HarnessApproval' +
          '\n        timeout: <+input>' +
          '\n        spec:' +
          '\n            approvalMessage: <+input>' +
          '\n            includePipelineExecutionHistory: true' +
          '\n            approvers:' +
          '\n                userGroups: <+input>' +
          '\n                minimumCount: <+input>' +
          '\n                disallowPipelineExecutor: false' +
          '\n            approverInputs:' +
          '\n                - name: "1"' +
          '\n                  defaultValue: "1"' +
          '\n                - name: ttt' +
          '\n                  defaultValue: ttt' +
          '\n        failureStrategies:' +
          '\n            - onFailure:' +
          '\n                  errors:' +
          '\n                      - Timeout' +
          '\n                  action:' +
          '\n                      type: MarkAsSuccess' +
          '\n',
        versionLabel: 'v4',
        templateEntityType: 'Step',
        childType: 'HarnessApproval',
        templateScope: 'project',
        version: 8,
        gitDetails: {},
        lastUpdatedAt: 1635626311830,
        stableTemplate: true
      }
    ],
    pageable: {
      sort: { sorted: true, unsorted: false, empty: false },
      pageSize: 20,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalPages: 1,
    totalElements: 1,
    sort: { sorted: true, unsorted: false, empty: false },
    first: true,
    numberOfElements: 5,
    size: 20,
    number: 0,
    empty: false
  }
}

export const mockTemplatesSuccessResponse: UseGetMockDataWithMutateAndRefetch<ResponsePageTemplateSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  cancel: jest.fn(),
  data: mockTemplates
}
