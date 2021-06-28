import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayAccess from '../COGatewayAccess'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const accessDetails = {
  dnsLink: { selected: false },
  ssh: { selected: false },
  rdp: { selected: false },
  backgroundTasks: { selected: false },
  ipaddress: { selected: false }
}

const initialGatewayDetails = {
  name: 'mockname',
  cloudAccount: {
    id: '',
    name: ''
  },
  idleTimeMins: 15,
  fullfilment: '',
  filter: '',
  kind: 'instance',
  orgID: 'orgIdentifier',
  projectID: 'projectIdentifier',
  accountID: 'accountId',
  hostName: '',
  customDomains: [],
  matchAllSubdomains: false,
  disabled: false,
  routing: {
    instance: {
      filterText: ''
    },
    lb: '',
    ports: []
  },
  healthCheck: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30
  },
  opts: {
    preservePrivateIP: false,
    deleteCloudResources: false,
    alwaysUsePrivateIP: false
  },
  provider: {
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  selectedInstances: [
    {
      id: '1',
      ipv4: '',
      launch_time: '', // eslint-disable-line
      name: '',
      region: 'us-east-2',
      status: 'stopped',
      tags: '',
      type: 't2.micro',
      vpc: 'vpc-4e233426'
    }
  ],
  accessPointID: '',
  metadata: {
    security_groups: [], // eslint-disable-line
    access_details: accessDetails // eslint-disable-line
  },
  deps: []
}

const mockAccessPointList = {
  response: [
    {
      name: 'mock.com',
      id: 'mock.com',
      metadata: {
        albArn: 'mockalbARN'
      }
    }
  ]
}
const mockedHostedZonesData = {
  data: {
    response: [{ id: 'route53mock.com', name: 'route53mock.com' }]
  },
  loading: false,
  refetch: jest.fn(() => Promise.resolve({ data: { response: [{ id: 'route53mock.com', name: 'route53mock.com' }] } }))
}

const mockAccessPointResourceData = {
  response: [
    {
      details: {
        albARN: 'mockalbARN',
        name: 'mockALBname'
      }
    }
  ]
}

jest.mock('services/lw', () => ({
  useListAccessPoints: jest.fn().mockImplementation(() => ({
    data: mockAccessPointList,
    loading: false,
    refetch: jest.fn(() => mockAccessPointList)
  })),
  useAllHostedZones: jest.fn().mockImplementation(() => mockedHostedZonesData),
  useAccessPointResources: jest.fn().mockImplementation(() => ({
    data: mockAccessPointResourceData,
    loading: false,
    refetch: jest.fn(() => mockAccessPointResourceData)
  })),
  useCreateAccessPoint: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

describe('Testing COGatewayAccess', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('DNS checkbox checks succesfully', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
        />
      </TestWrapper>
    )
    // const dnsCheckBox = container.querySelector('#DNSLink') as HTMLInputElement
    // expect(dnsCheckBox).toBeDefined()
    // fireEvent.click(dnsCheckBox)
    // await waitFor(() => {
    //   expect(dnsCheckBox.checked).toBe(true)
    // })
    expect(container).toMatchSnapshot()
  })

  test('SSH checkbox checks succesfully and download os ssh file', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayAccess
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          valid={true}
          setValidity={jest.fn()}
        />
      </TestWrapper>
    )
    // const sshCheckBox = container.querySelector('#ssh') as HTMLInputElement
    // expect(sshCheckBox).toBeDefined()
    // fireEvent.click(sshCheckBox)
    // await waitFor(() => {
    //   expect(sshCheckBox.checked).toBe(true)
    // })
    const sshTab = await findByText(container, 'ce.co.gatewayAccess.sshRdp')
    act(() => {
      fireEvent.click(sshTab)
    })
    expect(container).toMatchSnapshot()

    const osDropdown = container.querySelector('input[name="sshOs"]') as HTMLInputElement
    const osCaret = container
      .querySelector(`input[name="sshOs"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(osCaret!)
    })
    const osToSelect = await findByText(container, 'Mac')
    act(() => {
      fireEvent.click(osToSelect)
    })
    expect(osDropdown.value).toBe('Mac')

    const downloadBtn = await findByText(container, 'Download CLI')
    act(() => {
      fireEvent.click(downloadBtn)
    })
  })
})
