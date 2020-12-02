import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { S3StepWidget } from '../S3Step'

describe('S3Step snapshot test', () => {
  test('Widget should render properly', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/pipeline-studio/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/-1/ui/"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <S3StepWidget initialValues={{ identifier: '', spec: {} }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
