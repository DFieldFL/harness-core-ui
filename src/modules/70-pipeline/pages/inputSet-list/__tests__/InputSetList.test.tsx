import React from 'react'
import { render, RenderResult, waitFor, fireEvent, getByText, queryByText, getByTestId } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper, findDialogContainer, findPopoverContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import InputSetList from '../InputSetList'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit
} from './InputSetListMocks'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))
const deleteInputSetMock = jest.fn()
const deleteInputSet = (): Promise<{ status: string }> => {
  deleteInputSetMock()
  return Promise.resolve({ status: 'SUCCESS' })
}
const getInputSetList = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => PipelineResponse),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
  useCreateInputSetForPipeline: jest.fn(() => ({})),
  useUpdateInputSetForPipeline: jest.fn(() => ({})),
  useUpdateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn().mockImplementation(args => {
    getInputSetList(args)
    return GetInputSetsResponse
  }),
  getInputSetForPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(GetInputSetsResponse.data)),
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useDeleteInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: deleteInputSet })),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => ({})),
  useGetYamlSchema: jest.fn(() => ({}))
}))

const TEST_PATH = routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

describe('Input Set List tests', () => {
  test('render Input Set List view', async () => {
    const { getAllByText, container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <InputSetList />
      </TestWrapper>
    )
    await waitFor(() => getAllByText('OverLayInput'))
    expect(container).toMatchSnapshot()
  })
})

describe('Input Set List - Actions tests', () => {
  let container: HTMLElement | undefined
  let getAllByText: RenderResult['getAllByText'] | undefined

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <InputSetList />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText?.('OverLayInput'))
  })

  test('click handler for Input Set', async () => {
    const inputSetRow = getAllByText?.('asd')[0]
    await act(async () => {
      fireEvent.click(inputSetRow!)
      await waitFor(() => getByTestId(document.body, 'location'))
      expect(
        getByTestId(document.body, 'location').innerHTML.endsWith(
          routes.toInputSetForm({
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: 'asd',
            module: 'cd'
          } as any)
        )
      ).toBeTruthy()
    })
  })

  test('click handler for Overlay Input Set', async () => {
    const inputSetRow = getAllByText?.('OverLayInput')[0]
    await act(async () => {
      fireEvent.click(inputSetRow!)
      await waitFor(() => getByText(document.body, 'Edit Overlay Input Set: OverLayInput'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
  })

  test('click handler for edit Overlay Input Set from menu', async () => {
    const menu = container?.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu!)
    const editMenu = getAllByText?.('Edit')[0]
    await act(async () => {
      fireEvent.click(editMenu!)
      await waitFor(() => getByText(document.body, 'Edit Overlay Input Set: OverLayInput'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
  })

  test('click handler for edit Input Set from menu', async () => {
    const menu = container?.querySelectorAll("[icon='more']")[1]
    fireEvent.click(menu!)
    const editMenu = getAllByText?.('Edit')[0]
    await act(async () => {
      fireEvent.click(editMenu!)
      await waitFor(() => getByTestId(document.body, 'location'))
      expect(
        getByTestId(document.body, 'location').innerHTML.endsWith(
          routes.toInputSetForm({
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: 'asd',
            module: 'cd'
          } as any)
        )
      ).toBeTruthy()
    })
  })

  test('click handler for delete Overlay Input Set from menu', async () => {
    deleteInputSetMock.mockReset()
    const menu = container?.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu!)
    const deleteMenu = getAllByText?.('Delete')[0]
    await act(async () => {
      fireEvent.click(deleteMenu!)
      await waitFor(() => getByText(document.body, 'Delete Overlay Input Set'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'Delete')
      fireEvent.click(deleteBtn!)
      await waitFor(() => getByText(document.body, 'Input Set "OverLayInput" deleted'))
      expect(deleteInputSetMock).toBeCalled()
    })
  })

  test('click handler for delete Input Set from menu', async () => {
    deleteInputSetMock.mockReset()
    const menu = container?.querySelectorAll("[icon='more']")[1]
    fireEvent.click(menu!)
    const deleteMenu = getAllByText?.('Delete')[0]
    await act(async () => {
      fireEvent.click(deleteMenu!)
      await waitFor(() => getByText(document.body, 'Delete Input Set'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'Delete')
      fireEvent.click(deleteBtn!)
      await waitFor(() => getByText(document.body, 'Input Set "asd" deleted'))
      expect(deleteInputSetMock).toBeCalled()
    })
  })

  test('click handler for new Overlay Input Set', async () => {
    const menu = getAllByText?.('+ New Input Set')[0]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const newInputSet = getByText(popover as HTMLElement, 'Overlay Input Set')
    await act(async () => {
      fireEvent.click(newInputSet)
      await waitFor(() => getByText(document.body, 'New Overlay Input Set'))
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      // Close
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      fireEvent.click(form?.querySelector('[icon="small-cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
  })

  test('click handler for new Input Set', async () => {
    const menu = getAllByText?.('+ New Input Set')[0]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const newInputSet = getByText(popover as HTMLElement, 'Input Set')
    await act(async () => {
      fireEvent.click(newInputSet)
      await waitFor(() => getByTestId(document.body, 'location'))
      expect(
        getByTestId(document.body, 'location').innerHTML.endsWith(
          routes.toInputSetForm({
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: '-1',
            module: 'cd'
          } as any)
        )
      ).toBeTruthy()
    })
  })

  test('search Input Set list', async () => {
    getInputSetList.mockReset()
    const searchInput = container?.querySelector('[placeholder="Search Input Set"]') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'asd' } })
    expect(getInputSetList).toBeCalledWith({
      debounce: 300,
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        pageIndex: 0,
        pageSize: 10,
        pipelineIdentifier: 'pipeline',
        projectIdentifier: 'test',
        searchTerm: 'asd'
      }
    })
  })
})
