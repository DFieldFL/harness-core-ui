/* eslint-disable react/display-name */
import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import type { Clause, Segment } from 'services/cf'
import TargetBasedOnConditions, { TargetBasedOnConditionsProps } from '../TargetBasedOnConditions'

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

type UseGetAllTargetAttributesReturn = ReturnType<typeof cfServices['useGetAllTargetAttributes']>

const mockResponse = (overrides: Partial<UseGetAllTargetAttributesReturn> = {}): UseGetAllTargetAttributesReturn =>
  ({
    data: ['ta1', 'ta2'],
    loading: false,
    error: null,
    refetch: jest.fn(),
    ...overrides
  } as any)

const renderComponent = (props: Partial<TargetBasedOnConditionsProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: 'Target_Group_1'
      }}
      queryParams={{ environment: 'env' }}
    >
      <Formik formName="test" onSubmit={jest.fn()} initialValues={props.values || { rules: [] }}>
        {({ values }) => <TargetBasedOnConditions targetGroup={{ environment: 'env' } as Segment} values={values} />}
      </Formik>
    </TestWrapper>
  )

describe('TargetBasedOnConditions', () => {
  const useGetAllTargetAttributesMock = jest.spyOn(cfServices, 'useGetAllTargetAttributes')

  beforeEach(() => {
    jest.resetAllMocks()
    useGetAllTargetAttributesMock.mockReturnValue(mockResponse())
  })

  test('it should display the heading', async () => {
    renderComponent()

    expect(screen.queryByTestId('container-spinner')).not.toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.targetBasedOnCondition')).toBeInTheDocument()
  })

  test('it should display the loading spinner when loading', async () => {
    useGetAllTargetAttributesMock.mockReturnValue(mockResponse({ data: null, loading: true }))

    renderComponent()

    expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
  })

  test('it should display an error message when an error occurs', async () => {
    const message = 'ERROR MESSAGE'
    const refetchMock = jest.fn()
    useGetAllTargetAttributesMock.mockReturnValue(
      mockResponse({ data: null, error: { message }, refetch: refetchMock } as any)
    )

    renderComponent()

    expect(screen.getByText(message)).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: 'Retry' })
    expect(btn).toBeInTheDocument()
    expect(refetchMock).not.toHaveBeenCalled()

    userEvent.click(btn)

    await waitFor(() => expect(refetchMock).toHaveBeenCalled())
  })

  test('it should display a row for each existing rule', async () => {
    const rules = [
      { id: 'abc', attribute: 'ta1', op: 'starts_with', values: ['123'] },
      { id: '123', attribute: 'ta2', op: 'ends_with', values: ['xyz'] },
      { id: 'xyz', attribute: 'ta1', op: 'starts_with', values: ['abc'] }
    ] as Clause[]

    renderComponent({ values: { rules } })

    expect(screen.getByTestId('rule-rows')).toBeInTheDocument()
    expect(screen.getByTestId('rule-rows').children).toHaveLength(rules.length * 2)
    expect(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })).toHaveLength(rules.length)
  })

  test('it should remove a row when a remove button is clicked', async () => {
    const rules = [
      { id: 'abc', attribute: 'ta1', op: 'starts_with', values: ['123'] },
      { id: '123', attribute: 'ta2', op: 'ends_with', values: ['xyz'] },
      { id: 'xyz', attribute: 'ta1', op: 'starts_with', values: ['abc'] }
    ] as Clause[]

    renderComponent({ values: { rules } })

    const fieldsEl = document.querySelectorAll('.fields')[1] as HTMLDivElement
    const btnEl = fieldsEl.nextSibling as HTMLButtonElement

    expect(fieldsEl).toBeInTheDocument()
    expect(btnEl).toBeInTheDocument()

    userEvent.click(btnEl)

    await waitFor(() => {
      expect(screen.getByTestId('rule-rows').children).toHaveLength((rules.length - 1) * 2)
      expect(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })).toHaveLength(rules.length - 1)
    })
  })

  test('it should add a row when the add rule button is clicked', async () => {
    renderComponent()

    expect(screen.queryByTestId('rule-rows')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'plus cf.segmentDetail.addRule' }))

    await waitFor(() => {
      expect(screen.getByTestId('rule-rows')).toBeInTheDocument()
      expect(screen.getByTestId('rule-rows').children).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: 'cf.segmentDetail.removeRule' })).toHaveLength(1)
    })
  })
})
