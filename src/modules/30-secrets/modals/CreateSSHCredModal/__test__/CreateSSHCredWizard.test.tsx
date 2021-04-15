import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, getByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import mockData from '@secrets/components/CreateUpdateSecret/__tests__/listSecretManagersMock.json'
import { TestWrapper } from '@common/utils/testUtils'

import type { ResponseSecretValidationResultDTO } from 'services/cd-ng'
import { clickSubmit, fillAtForm, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import CreateSSHCredWizard from '../CreateSSHCredWizard'
import mockListSecrets from './mockListSecrets.json'

const responseSecretValidation: ResponseSecretValidationResultDTO = {
  status: 'SUCCESS',
  data: { success: true },
  metaData: {}
}
const delegateResponse = {
  metaData: {},
  resource: true,
  responseMessages: 'true'
}

const createSSHSecret = jest.fn()

jest.useFakeTimers()
jest.mock('services/portal', () => ({
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: delegateResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...mockData, refetch: jest.fn(), error: null, loading: false }
  }),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockListSecrets)),
  useValidateSecret: jest
    .fn()
    .mockImplementation(() => ({ mutate: () => Promise.resolve({ responseSecretValidation }) })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: createSSHSecret }))
}))

describe('Create SSH Cred Wizard', () => {
  test('should render form', async () => {
    const { container, getAllByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateSSHCredWizard hideModal={noop} onSuccess={noop} />
      </TestWrapper>
    )

    // match step 1
    expect(container).toMatchSnapshot()

    fireEvent.click(getAllByText('+ Description')[0])
    fireEvent.click(getAllByText('+ Tags')[0])

    // fill step 1
    fillAtForm([
      { container, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummy name' },
      { container, type: InputTypes.TEXTAREA, fieldId: 'description', value: 'dummy description' }
    ])

    // submit step 1
    await act(async () => {
      clickSubmit(container)
    })

    // match step 2
    expect(container).toMatchSnapshot()

    //submit step 2
    await act(async () => {
      clickSubmit(container)
    })
    expect(getAllByText('Key file is required')[0]).toBeDefined()
    await act(async () => {
      fireEvent.click(container.querySelector('a[data-testid="key"]')!)
    })
    const $selectTab = getByText(document.body, 'Select an existing secret')
    await act(async () => {
      fireEvent.click($selectTab)
    })
    const $secret = getByText(document.body, 'nfile1')
    await act(async () => {
      fireEvent.click($secret)
    })
    const $applyBtn = getByText(document.body, 'entityReference.apply')
    await act(async () => {
      fireEvent.click($applyBtn)
    })

    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'userName', value: 'user name' })

    //submit step 2
    await act(async () => {
      clickSubmit(container)
    })

    //Create Secret
    expect(createSSHSecret).toHaveBeenCalledWith({
      secret: {
        type: 'SSHKey',
        name: 'dummy name',
        identifier: 'dummy_name',
        description: 'dummy description',
        tags: {},
        spec: {
          auth: {
            spec: {
              credentialType: 'KeyReference',
              spec: {
                key: 'account.nfile1',
                userName: 'user name'
              }
            },
            type: 'SSH'
          },
          port: 22
        }
      }
    })

    //step 3
    expect(container).toMatchSnapshot()
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'host', value: 'http://dummyUrl.com' })
    //Submit Step 3
    await act(async () => {
      clickSubmit(container)
    })
    //Verification of delegate service
    expect(getAllByText('RETEST CONNECTION')[0]).toBeDefined()
  })
})
