/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { processFormData } from '../helper'
import type { JiraCreateData } from '../types'

describe('Jira Create process form data tests', () => {
  test('if duplicate fields are not sent', () => {
    const formValues: JiraCreateData = {
      name: 'jiraCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'JiraCreate',
      spec: {
        connectorRef: { label: 'conn', value: 'conn' },
        projectKey: { label: 'pid', value: 'pid', key: 'pid' },
        issueType: { label: 'iss', value: 'iss', key: 'iss' },
        fields: [
          {
            name: 'f1',
            value: 'v1'
          },
          {
            name: 'f2',
            value: { label: 'vb2', value: 'vb2' }
          }
        ],
        selectedFields: [
          {
            name: 'f2',
            value: { label: 'vb2', value: 'vb2' },
            key: 'f2',
            allowedValues: [],
            schema: {
              typeStr: '',
              type: 'string'
            }
          },
          {
            name: 'f3',
            value: [
              { label: 'v3', value: 'v3' },
              { label: 'v32', value: 'v32' }
            ],
            key: 'f3',
            allowedValues: [],
            schema: {
              typeStr: '',
              type: 'string'
            }
          }
        ]
      }
    }

    const returned = processFormData(formValues)
    expect(returned).toStrictEqual({
      name: 'jiraCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'JiraCreate',
      spec: {
        connectorRef: 'conn',
        delegateSelectors: undefined,
        projectKey: 'pid',
        issueType: 'iss',
        fields: [
          {
            name: 'Summary',
            value: ''
          },
          {
            name: 'Description',
            value: ''
          },
          {
            name: 'f2',
            value: 'vb2'
          },
          {
            name: 'f3',
            value: 'v3,v32'
          },
          {
            name: 'f1',
            value: 'v1'
          }
        ]
      }
    })
  })

  test('if runtime values work', () => {
    const formValues: JiraCreateData = {
      name: 'jiraCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'JiraCreate',
      spec: {
        connectorRef: '<+input>',
        delegateSelectors: undefined,
        projectKey: '<+expression>',
        issueType: '<+input>',
        fields: [
          {
            name: 'f1',
            value: '<+a.b>'
          }
        ],
        selectedFields: [
          {
            name: 'f2',
            value: '<+x.y>',
            key: 'f2',
            allowedValues: [],
            schema: {
              typeStr: '',
              type: 'string'
            }
          }
        ]
      }
    }

    const returned = processFormData(formValues)
    expect(returned).toStrictEqual({
      name: 'jiraCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'JiraCreate',
      spec: {
        connectorRef: '<+input>',
        projectKey: '<+expression>',
        delegateSelectors: undefined,
        issueType: '<+input>',
        fields: [
          {
            name: 'Summary',
            value: ''
          },
          {
            name: 'Description',
            value: ''
          },
          {
            name: 'f2',
            value: '<+x.y>'
          },
          {
            name: 'f1',
            value: '<+a.b>'
          }
        ]
      }
    })
  })
})
