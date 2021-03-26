import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HelmWithGIT from '../HelmWithGIT'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  handleSubmit: jest.fn()
}
describe('helm with GIT tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      helmVersion: 'V2',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }],
      repoName: ''
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Commit',
      folderPath: '',
      helmVersion: 'V3',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id2' }],
      repoName: ''
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'manifest_id',
      branch: 'master',
      commitId: undefined,
      gitFetchType: 'Commit',
      folderPath: './temp',
      helmVersion: 'V3',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: 'Fetch', flag: 'test', id: 'id2' }],
      repoName: 'someURL/repoName'
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
