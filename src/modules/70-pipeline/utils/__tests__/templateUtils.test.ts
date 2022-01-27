/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as uuid from 'uuid'
import type { TemplateSummaryResponse } from 'services/template-ng'
import * as utils from '../templateUtils'

jest.mock('uuid')

describe('templateUtils', () => {
  describe('createStepNodeFromTemplate tests', () => {
    const template: TemplateSummaryResponse = {
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      childType: 'Http',
      description: '',
      identifier: 'Test_Http_Step',
      lastUpdatedAt: 1641755022840,
      name: 'Test Http Step',
      orgIdentifier: 'default',
      projectIdentifier: 'Yogesh_Test',
      stableTemplate: false,
      tags: {},
      templateEntityType: 'Step',
      templateScope: 'project',
      version: 0,
      versionLabel: 'v2',
      yaml: 'template:\n    name: Test Http Step\n    identifier: Test_Http_Step\n    versionLabel: v2\n    type: Step\n    projectIdentifier: Yogesh_Test\n    orgIdentifier: default\n    tags: {}\n    spec:\n        type: Http\n        timeout: 30s\n        spec:\n            url: <+input>\n            method: GET\n            headers: []\n            outputVariables: []\n            requestBody: <+input>\n'
    }
    test('when isCopied is false', () => {
      jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID')
      const result = utils.createStepNodeFromTemplate(template)
      expect(result).toEqual({
        name: 'Test Http Step',
        identifier: 'MockedUUID',
        template: { templateRef: 'Test_Http_Step', versionLabel: 'v2' }
      })
    })
    test('when isCopied is true', () => {
      jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID')
      const result = utils.createStepNodeFromTemplate(template, true)
      expect(result).toEqual({
        name: 'Test Http Step',
        identifier: 'MockedUUID',
        spec: {
          headers: [],
          method: 'GET',
          outputVariables: [],
          requestBody: '<+input>',
          url: '<+input>'
        },
        timeout: '30s',
        type: 'Http'
      })
    })
  })
})
