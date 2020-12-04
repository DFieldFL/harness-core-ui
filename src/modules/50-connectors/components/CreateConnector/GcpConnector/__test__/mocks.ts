import type { ResponseBoolean } from 'services/cd-ng'

export const encryptedKeyMock = {
  name: 'devConnector',
  identifier: 'devConnector',
  description: 'devConnector description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Gcp',
  spec: { credential: { type: 'ManualConfig', spec: { secretKeyRef: 'account.s15656' } } }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretFile',
      name: 's15656',
      identifier: 's15656',
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
