import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, clickSubmit, fillAtForm } from '@common/utils/JestFormHelper'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import i18n from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags.i18n'
import { GitUrlType, GitConnectionType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import CreateGitlabConnector from '../CreateGitlabConnector'
import { mockResponse, mockSecret, sshAuthWithAPIAccessToken, usernamePassword } from './gitlabMocks'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

const updateConnector = jest.fn()
const createConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn())
}))

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn())
}))

describe('Create Gitlab connector Wizard', () => {
  test('Creating gitlab step one for SSH key', async () => {
    const description = 'dummy description'

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGitlabConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    expect(queryByText(container, 'Name')).not.toBeNull()
    fireEvent.click(getByText(i18n.addDescriptionLabel))
    // fill step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      },
      {
        container,
        type: InputTypes.TEXTAREA,
        fieldId: 'description',
        value: description
      },
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'urlType',
        value: GitUrlType.ACCOUNT
      },
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'connectionType',
        value: GitConnectionType.SSH
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'url',
        value: 'gitlabTestUrl'
      }
    ])

    // test for retaining values on toggling form fields
    fireEvent.click(getByText('remove')) //removing description
    expect(container).toMatchSnapshot() // matching snapshot with description and tags hidden
    fireEvent.click(getByText(i18n.addDescriptionLabel)) //showing description
    fireEvent.click(getByText(i18n.addTagsLabel)) //showing tags
    expect(container).toMatchSnapshot()
    await act(async () => {
      clickSubmit(container)
    })
    //step 2
    expect(container).toMatchSnapshot()
    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot() // Form validation for all required fields
    expect(createConnector).toBeCalledTimes(0)
  })

  test('Creating gitlab step one and step two for HTTPS', async () => {
    const description = 'dummy description'

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGitlabConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    expect(queryByText(container, 'Name')).not.toBeNull()
    fireEvent.click(getByText(i18n.addDescriptionLabel))
    // fill step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      },
      {
        container,
        type: InputTypes.TEXTAREA,
        fieldId: 'description',
        value: description
      },
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'urlType',
        value: GitUrlType.REPO
      },
      {
        container,
        type: InputTypes.RADIOS,
        fieldId: 'connectionType',
        value: GitConnectionType.HTTPS
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'url',
        value: 'gitlabTestUrl'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    //step 2
    await act(async () => {
      clickSubmit(container)
    })
    expect(container).toMatchSnapshot() // Form validation for all required fields
    expect(createConnector).toBeCalledTimes(0)
  })

  test('should be able to edit ssh with API access', async () => {
    updateConnector.mockReset()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGitlabConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={sshAuthWithAPIAccessToken as ConnectorInfoDTO}
          mock={mockResponse}
        />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Enable API access')).toBeDefined()
    expect(container).toMatchSnapshot()

    //updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)
    expect(updateConnector).toBeCalledWith({
      connector: {
        description: 'connector description',
        identifier: 'asasas',
        name: 'GitlabWorking',
        orgIdentifier: '',
        projectIdentifier: '',
        spec: {
          type: 'Account',
          url: 'https://gitlab.com/dev',
          authentication: {
            type: 'Ssh',
            spec: { spec: { sshKeyRef: 'account.gitlabPassword' } }
          },
          apiAccess: {
            type: 'Token',
            spec: {
              tokenRef: 'account.gitlabPassword'
            }
          }
        },
        tags: {},
        type: 'Gitlab'
      }
    })
  })

  test('should be able to edit  usernamePassword without API access', async () => {
    updateConnector.mockReset()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGitlabConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={usernamePassword as ConnectorInfoDTO}
          mock={mockResponse}
        />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Enable API access')).toBeDefined()
    expect(container).toMatchSnapshot()

    //updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)
    expect(updateConnector).toBeCalledWith({
      connector: {
        description: 'connector description',
        identifier: 'asasas',
        name: 'GitlabWorking',
        orgIdentifier: '',
        projectIdentifier: '',
        spec: {
          type: 'Account',
          url: 'https://gitlab.com/dev',
          authentication: {
            type: 'Http',
            spec: { type: 'UsernamePassword', spec: { passwordRef: 'account.gitlabPassword', username: 'dev' } }
          }
        },
        tags: {},
        type: 'Gitlab'
      }
    })
  })
})
