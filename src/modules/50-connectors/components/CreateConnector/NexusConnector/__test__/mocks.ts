import type { ResponseBoolean } from 'services/cd-ng'

export const mockConnector = {
  name: 'NexusTest',
  identifier: 'NexusTest',
  description: 'connectorDescription',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Nexus',
  spec: {
    nexusServerUrl: 'dummyRespositoryUrl',
    version: '2.x',
    auth: { type: 'UsernamePassword', spec: { username: 'dev', passwordRef: 'account.connectorPass' } }
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'connectorPass',
      identifier: 'connectorPass',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1606373702954,
    updatedAt: 1606373702954,
    draft: false
  },
  metaData: null,
  correlationId: '0346aa2b-290e-4892-a7f0-4ad2128c9829'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}
