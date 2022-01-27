/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const resourceTypes = {
  status: 'SUCCESS',
  data: {
    resourceTypes: [
      {
        name: 'SECRET',
        validatorTypes: ['BY_RESOURCE_IDENTIFIER', 'BY_RESOURCE_TYPE', 'BY_RESOURCE_TYPE_INCLUDING_CHILD_SCOPES']
      },
      {
        name: 'CONNECTOR',
        validatorTypes: ['BY_RESOURCE_IDENTIFIER', 'BY_RESOURCE_TYPE', 'BY_RESOURCE_TYPE_INCLUDING_CHILD_SCOPES']
      },
      { name: 'PIPELINE', validatorTypes: ['BY_RESOURCE_TYPE_INCLUDING_CHILD_SCOPES'] }
    ]
  },
  metaData: null,
  correlationId: '31eb8018-a8b5-4c6a-bf9f-2b378e020f5e'
}
export const resourceGroupDetails = {
  status: 'SUCCESS',
  data: {
    resourceGroup: {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'nameewrewew',
      resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'SECRET', includeChildScopes: false }],
      tags: {},
      description: '',
      color: '#0063f7'
    },
    createdAt: 1614689768311,
    lastModifiedAt: 1614689892647,
    harnessManaged: false
  },
  metaData: null,
  correlationId: '8e547da2-ed72-4327-a74d-874a825f8a20'
}
export const resourceGroupDetailsWithHarnessManaged = {
  status: 'SUCCESS',
  data: {
    resourceGroup: {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'nameewrewew',
      resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'SECRET', includeChildScopes: false }],
      tags: {},
      description: '',
      color: '#0063f7'
    },
    createdAt: 1614689768311,
    lastModifiedAt: 1614689892647,
    harnessManaged: true
  },
  metaData: null,
  correlationId: '8e547da2-ed72-4327-a74d-874a825f8a20'
}
