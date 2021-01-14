import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'

import type { ResponseBoolean } from 'services/cd-ng'
import CreateArtifactoryConnector from '../CreateArtifactoryConnector'
import i18n from '../CreateArtifactoryConnector.i18n'

const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

describe('Create Artifactory connector Wizard', () => {
  test('should render form', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateArtifactoryConnector {...commonProps} isEditMode={false} connectorInfo={undefined} mock={mockResponse} />
      </TestWrapper>
    )

    // match step 1
    expect(container).toMatchSnapshot()

    // fill step 1
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // step 2
    expect(queryByText(container, i18n.STEP_TWO.ArtifactoryServerURL)).toBeDefined()
    fireEvent.click(getByText(i18n.STEP_TWO.SAVE_CREDENTIALS_AND_CONTINUE)) // trying to create coonector with step 2 data

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="artifactoryServerUrl"]')!, {
        target: { value: 'dummy artifactoryServerUrl' }
      })
    })
    expect(container).toMatchSnapshot()
    const backBtn = getByText('BACK')
    fireEvent.click(backBtn)
    // Coonector name should be retained in step 1
    expect(queryByText(container, 'dummy name')).toBeDefined()
  })
})
