import React from 'react'
import { act, fireEvent, getAllByText, render, RenderResult, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { clickSubmit } from '@common/utils/JestFormHelper'
import NotificationTable, { NotificationTableProps } from '../NotificationTable'

const args: NotificationTableProps = {
  data: [
    {
      name: 'name',
      enabled: true,
      pipelineEvents: [{ type: 'AllEvents' }, { type: 'PipelineFailed' }],
      notificationMethod: {
        type: 'Slack',
        spec: { userGroups: ['pl-cd-ng'], webhookUrls: 'webhookURL' }
      }
    },
    {
      name: 'name',
      enabled: true,
      pipelineEvents: [{ type: 'AllEvents' }],
      notificationMethod: { type: 'Email', spec: { userGroups: ['pl-cd-ng'], recipients: ['abc@harness.io'] } }
    },
    {
      name: 'name',
      enabled: true,
      pipelineEvents: [{ type: 'AllEvents' }],
      notificationMethod: { type: 'PagerDuty', spec: { userGroups: ['pl-cd-ng'], integrationKeys: '12345' } }
    }
  ],
  gotoPage: jest.fn(),
  onUpdate: jest.fn(),
  totalPages: 1,
  totalItems: 3,
  pageItemCount: 3,
  pageSize: 5,
  pageIndex: 0
}
describe('Notification Table test', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <NotificationTable {...args} />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
  })
  test('render', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Edit Notfication', async () => {
      const menu = container.querySelector(`[data-icon="Options"]`)
      fireEvent.click(menu!)
      const editMenu = getByText('Edit')
      expect(editMenu).toBeDefined()
      act(() => {
        fireEvent.click(editMenu!)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      await act(async () => {
        //Step 1
        if (form) clickSubmit(form)
        await waitFor(() => getAllByText(document.body, 'Select Pipeline Events')[0])
      })
      form = findDialogContainer()
      await act(async () => {
        //Step 2
        if (form) clickSubmit(form)
        await waitFor(() => getAllByText(document.body, 'Notification Method')[1])
      })
      form = findDialogContainer()
      await act(async () => {
        //Step 3
        if (form) clickSubmit(form)
      })
    }),
    test('Delete Notfication', async () => {
      const menu = container.querySelector(`[data-icon="Options"]`)
      fireEvent.click(menu!)
      const deleteMenu = getByText('Delete')
      expect(deleteMenu).toBeDefined()
      await act(async () => {
        fireEvent.click(deleteMenu!)
      })
    }),
    test('New Notfication', async () => {
      const addNotification = getByText('Notifications')
      await act(async () => {
        fireEvent.click(addNotification!)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
})
