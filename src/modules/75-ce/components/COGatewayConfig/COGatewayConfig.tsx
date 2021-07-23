import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import type { CellProps, Renderer } from 'react-table'
import { debounce as _debounce, isEmpty as _isEmpty, get as _get, omit as _omit } from 'lodash-es'
import { Dialog, Drawer, IDialogProps } from '@blueprintjs/core'
import {
  Formik,
  FormikForm,
  FormInput,
  Container,
  Layout,
  CardSelect,
  Text,
  Table,
  Color,
  Tabs,
  Tab,
  Button,
  Switch,
  Icon,
  Card,
  useModalHook,
  IconName
} from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikContext } from 'formik'
import ReactTimeago from 'react-timeago'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useToaster } from '@common/exports'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import COInstanceSelector from '@ce/components/COInstanceSelector/COInstanceSelector'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import { Utils } from '@ce/common/Utils'
import {
  ASGMinimal,
  HealthCheck,
  PortConfig,
  Service,
  ServiceDep,
  useAllResourcesOfAccount,
  useGetAllASGs,
  useGetServices,
  useSecurityGroupsOfInstances
} from 'services/lw'
import { String, StringKeys, useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { TagsPopover } from '@common/components'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { Connectors } from '@connectors/constants'
import { FeatureFlag } from '@common/featureFlags'
import { ConnectorInfoDTO, ConnectorResponse, useGetConnectorListV2 } from 'services/cd-ng'
import CORoutingTable from './CORoutingTable'
import COHealthCheckTable from './COHealthCheckTable'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import CORuleDendencySelector from './CORuleDependencySelector'
import COGatewayConfigStep from './COGatewayConfigStep'
import COAsgSelector from '../COAsgSelector'
// import COFixedDrawer from '../COGatewayAccess/COFixedDrawer'
import COK8sClusterSelector from '../COK8sClusterSelector/COK8sClusterSelector'
import KubernetesRuleYamlEditor from './KubernetesRuleYamlEditor'
import { getK8sIngressTemplate } from './GetK8sYamlSchema'
import css from './COGatewayConfig.module.scss'

interface COGatewayConfigProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  valid: boolean
  setValidity: (tab: boolean) => void
  activeStepDetails?: { count?: number; tabId?: string } | null
}
interface CardData {
  text: string
  value: string
  icon: string
  providers?: string[]
}

const instanceTypeCardData: CardData[] = [
  {
    text: 'Spot',
    value: 'spot',
    icon: spotIcon,
    providers: ['aws']
  },
  {
    text: 'On demand',
    value: 'ondemand',
    icon: odIcon,
    providers: ['aws', 'azure']
  }
]
const portProtocolMap: { [key: number]: string } = {
  80: 'http',
  443: 'https'
}

enum RESOURCES {
  INSTANCES = 'INSTANCES',
  ASG = 'ASG',
  KUBERNETES = 'KUBERNETES'
}

const managedResources = [
  { label: 'Instances', value: RESOURCES.INSTANCES, providers: ['aws', 'azure'] },
  { label: 'Auto scaling groups', value: RESOURCES.ASG, providers: ['aws'] },
  {
    label: 'Kubernetes Cluster',
    value: RESOURCES.KUBERNETES,
    providers: ['aws', 'azure'],
    ffDependencies: ['CE_AS_KUBERNETES_ENABLED']
  }
]

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1000,
    minHeight: 350,
    borderTop: '5px solid #0091FF',
    padding: 40,
    position: 'relative',
    overflow: 'hidden'
  }
}

const CONFIG_STEP_IDS = ['configStep1', 'configStep2', 'configStep3', 'configStep4']

const DEFAULT_TOTAL_STEP_COUNT = 4
const MODIFIED_TOTAL_STEP_COUNT = 3

const COGatewayConfig: React.FC<COGatewayConfigProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const isKubernetesEnabled = useFeatureFlag(FeatureFlag.CE_AS_KUBERNETES_ENABLED)
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const [featureFlagsMap] = useState<Record<string, boolean>>({ CE_AS_KUBERNETES_ENABLED: isKubernetesEnabled })
  const [selectedInstances, setSelectedInstances] = useState<InstanceDetails[]>(props.gatewayDetails.selectedInstances)
  const [filteredInstances, setFilteredInstances] = useState<InstanceDetails[]>([])
  const [allInstances, setAllInstances] = useState<InstanceDetails[]>([])
  const [healthCheck, setHealthCheck] = useState<boolean>(props.gatewayDetails.healthCheck ? true : false)
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck | null>(props.gatewayDetails.healthCheck)
  const [gatewayName, setGatewayName] = useState<string>(props.gatewayDetails.name)
  const [idleTime, setIdleTime] = useState<number>(props.gatewayDetails.idleTimeMins)
  const [fullfilment, setFullfilment] = useState<string>(props.gatewayDetails.fullfilment)
  // const [matchSubdomains, setMatchSubdomains] = useState<boolean>(
  //   props.gatewayDetails.matchAllSubdomains ? props.gatewayDetails.matchAllSubdomains : false
  // )
  // const [usePrivateIP, setUsePrivateIP] = useState<boolean>(
  //   props.gatewayDetails.opts.alwaysUsePrivateIP ? props.gatewayDetails.opts.alwaysUsePrivateIP : false
  // )
  const [routingRecords, setRoutingRecords] = useState<PortConfig[]>(props.gatewayDetails.routing.ports)
  const [serviceDependencies, setServiceDependencies] = useState<ServiceDep[]>(props.gatewayDetails.deps || [])
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [totalStepsCount, setTotalStepsCount] = useState<number>(DEFAULT_TOTAL_STEP_COUNT)
  const [allConnectors, setAllConnectors] = useState<ConnectorResponse[]>([])
  const [connectorsToShow, setConnectorsToShow] = useState<ConnectorResponse[]>([])
  const [selectedResource, setSelectedResource] = useState<RESOURCES | null>(
    !_isEmpty(props.gatewayDetails.selectedInstances)
      ? RESOURCES.INSTANCES
      : !_isEmpty(props.gatewayDetails.routing?.instance?.scale_group)
      ? RESOURCES.ASG
      : !_isEmpty(props.gatewayDetails.routing?.k8s?.RuleJson)
      ? RESOURCES.KUBERNETES
      : null
  )
  const [selectedInstanceType, setSelectedInstanceType] = useState<CardData | null>(
    props.gatewayDetails.fullfilment
      ? instanceTypeCardData[instanceTypeCardData.findIndex(card => card.value == props.gatewayDetails.fullfilment)]
      : null
  )
  const configContEl = useRef<HTMLDivElement>(null)
  const [activeDrawerIds, setActiveDrawerIds] = useState<string[]>([CONFIG_STEP_IDS[0], CONFIG_STEP_IDS[1]])
  const [activeConfigTabId, setActiveConfigTabId] = useState<string | undefined>(props.activeStepDetails?.tabId)
  const [asgToShow, setAsgToShow] = useState<ASGMinimal[]>([])
  const [allAsg, setAllAsg] = useState<ASGMinimal[]>([])
  const [selectedAsg, setSelectedAsg] = useState<ASGMinimal | undefined>(
    props.gatewayDetails.routing?.instance?.scale_group
  )

  const [selectedConnector, setSelectedConnector] = useState<ConnectorResponse | undefined>()
  const [yamlData, setYamlData] = useState<Record<any, any>>(
    props.gatewayDetails.routing.k8s?.RuleJson ? JSON.parse(props.gatewayDetails.routing.k8s.RuleJson) : undefined
  )

  const isK8sSelected = selectedResource === RESOURCES.KUBERNETES

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { showError, showSuccess } = useToaster()
  function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Text lineClamp={3} color={Color.BLACK}>
        {tableProps.value}
      </Text>
    )
  }
  function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere' }}>
        {tableProps.value} {tableProps.row.original.id}
      </Text>
    )
  }

  const RemoveCell = (tableProps: CellProps<InstanceDetails>) => {
    const handleDeletion = () => {
      const instances = [...selectedInstances]
      instances.splice(tableProps.row.index, 1)
      if (instances.length) {
        const updatedGatewayDetails = { ...props.gatewayDetails }
        updatedGatewayDetails.selectedInstances = instances
        props.setGatewayDetails(updatedGatewayDetails)
        setSelectedInstances(instances)
      } else {
        resetSelectedInstancesDetails()
      }
    }
    return <Button className={css.clearBtn} icon={'delete'} onClick={handleDeletion} />
  }

  const { mutate: getInstances, loading: loadingInstances } = useAllResourcesOfAccount({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      type: 'instance',
      accountIdentifier: accountId
    }
  })

  const { mutate: fetchAllASGs, loading: loadingFetchASGs } = useGetAllASGs({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  const defaultQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      searchTerm: '',
      pageIndex: 0,
      pageSize: 100
    }),
    [accountId]
  )

  const { mutate: fetchConnectors, loading: loadingConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const { data: servicesData, error } = useGetServices({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })
  if (error) {
    showError('Faield to fetch services', undefined, 'ce.svc.fetch.error')
  }

  const [openInstancesModal, closeInstancesModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps}>
        <COInstanceSelector
          selectedInstances={selectedInstances}
          setSelectedInstances={setSelectedInstances}
          setGatewayDetails={props.setGatewayDetails}
          instances={filteredInstances}
          gatewayDetails={props.gatewayDetails}
          search={handleSearch}
          onInstancesAddSuccess={() => {
            handleSearch('')
            closeInstancesModal()
          }}
          loading={loadingInstances}
          refresh={refreshInstances}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            handleSearch('')
            closeInstancesModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    )
  }, [filteredInstances, selectedInstances, loadingInstances])

  const handleAsgSearch = (text: string) => {
    if (!text) {
      setAsgToShow([])
      return
    }
    text = text.toLowerCase()
    const filteredScalingGroups = allAsg.filter(
      item => item.name?.toLowerCase().includes(text) || item.id?.toLowerCase().includes(text)
    )
    setAsgToShow(filteredScalingGroups)
  }

  const handleConnectorsSearch = (text: string) => {
    if (!text) {
      setConnectorsToShow(allConnectors)
      return
    }
    text = text.toLowerCase()
    const filteredConnectors = allConnectors.filter(item =>
      (item.connector as ConnectorInfoDTO).name?.toLowerCase().includes(text)
    )
    setConnectorsToShow(filteredConnectors)
  }

  const [openAsgModal, closeAsgModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps}>
        <COAsgSelector
          selectedScalingGroup={selectedAsg}
          setSelectedAsg={setSelectedAsg}
          setGatewayDetails={props.setGatewayDetails}
          scalingGroups={asgToShow}
          gatewayDetails={props.gatewayDetails}
          search={handleAsgSearch}
          onAsgAddSuccess={updatedGatewayDetails => {
            setRoutingRecords(updatedGatewayDetails.routing.ports)
            handleAsgSearch('')
            closeAsgModal()
          }}
          loading={loadingFetchASGs}
          refresh={fetchAndSetAsgItems}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            handleAsgSearch('')
            closeAsgModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-asg-modal'}
        />
      </Dialog>
    )
  }, [allAsg, asgToShow, selectedAsg, loadingFetchASGs])

  const [openClusterModal, closeClusterModal] = useModalHook(() => {
    return (
      <Dialog {...modalProps}>
        <COK8sClusterSelector
          loading={loadingConnectors}
          clusters={connectorsToShow}
          search={handleConnectorsSearch}
          selectedCluster={selectedConnector}
          refetchConnectors={fetchAndSetConnectors}
          onClusterAddSuccess={cluster => {
            const updatedGatewayDetails: GatewayDetails = {
              ...props.gatewayDetails,
              metadata: { ...props.gatewayDetails.metadata, kubernetes_connector_id: cluster.connector?.identifier }
            }
            props.setGatewayDetails(updatedGatewayDetails)
            setSelectedConnector(cluster)
            handleConnectorsSearch('')
            closeClusterModal()
          }}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            handleConnectorsSearch('')
            closeClusterModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-cluster-modal'}
        />
      </Dialog>
    )
  }, [allConnectors, connectorsToShow, selectedConnector, loadingConnectors])

  useLayoutEffect(() => {
    const observeScrollHandler = _debounce(() => {
      const parentElVal = (configContEl.current as HTMLDivElement).getBoundingClientRect()
      const configStepsContainers: HTMLElement[] = []
      CONFIG_STEP_IDS.forEach((_id: string) => {
        const element = document.getElementById(_id)
        element && configStepsContainers.push(element)
      })
      const newActiveIds: string[] = []
      configStepsContainers.forEach((stepEl, _i) => {
        const { top, bottom, height } = stepEl.getBoundingClientRect()
        if (
          (top > parentElVal.top || bottom - parentElVal.top > 100) &&
          (bottom <= parentElVal.bottom || (height >= parentElVal.height ? bottom > parentElVal.bottom : false))
        ) {
          newActiveIds.push(stepEl.id)
        }
      })
      setActiveDrawerIds(newActiveIds)
    }, 500)

    {
      ;(configContEl.current as HTMLDivElement).addEventListener('scroll', observeScrollHandler)
      if (props.activeStepDetails?.count) {
        const el = document.getElementById(`configStep${props.activeStepDetails.count}`)
        el?.scrollIntoView()
      }
    }

    return () => {
      ;(configContEl.current as HTMLDivElement).removeEventListener('scroll', observeScrollHandler)
    }
  }, [])

  useEffect(() => {
    props.gatewayDetails.routing.ports = routingRecords
    props.setGatewayDetails(props.gatewayDetails)
  }, [routingRecords])
  useEffect(() => {
    props.gatewayDetails.deps = serviceDependencies
    props.setGatewayDetails(props.gatewayDetails)
  }, [serviceDependencies])
  useEffect(() => {
    const updatedGatewayDetails = { ...props.gatewayDetails, healthCheck: healthCheckPattern }
    props.setGatewayDetails(updatedGatewayDetails)
  }, [healthCheckPattern])

  const refreshInstances = async (): Promise<void> => {
    try {
      const result = await getInstances(
        { Text: '' },
        {
          queryParams: {
            cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
            type: 'instance',
            accountIdentifier: accountId
          }
        }
      )
      if (result && result.response) {
        const instances = result.response
          ?.filter(x => x.status != 'terminated')
          .map(item => {
            return {
              name: item.name ? item.name : '',
              id: item.id ? item.id : '',
              ipv4: item.ipv4 ? item.ipv4[0] : '',
              region: item.region ? item.region : '',
              type: item.type ? item.type : '',
              tags: '',
              launch_time: item.launch_time ? item.launch_time : '', // eslint-disable-line
              status: item.status ? item.status : '',
              vpc: item.metadata ? item.metadata['VpcID'] : '',
              ...(isAzureProvider && { metadata: { resourceGroup: item.metadata?.resourceGroup } })
            }
          })
        setAllInstances(instances)
        setFilteredInstances(instances)
      }
    } catch (e) {
      showError(e.data?.message || e.message, undefined, 'ce.refetch.instance.error')
    }
  }

  const fetchAndSetAsgItems = async (): Promise<void> => {
    try {
      const result = await fetchAllASGs({ Text: '' })
      if (result?.response) {
        const filteredAsgs = result.response.filter((item: ASGMinimal) => !_isEmpty(item.target_groups))
        setAllAsg(filteredAsgs)
        setAsgToShow(filteredAsgs)
      }
    } catch (err) {
      showError(err.data?.message || err.message, undefined, 'ce.fetchAndSetAsgItems.error')
    }
  }

  const fetchAndSetConnectors = async () => {
    try {
      const { data: connectorResponse } = await fetchConnectors({
        filterType: 'Connector',
        types: [Connectors.CE_KUBERNETES]
      })
      const content = connectorResponse?.content || []
      if (!_isEmpty(content)) {
        setAllConnectors(content)
        setConnectorsToShow(content)
        const prevSelectedConnector = content.find(
          _item => _item.connector?.identifier === props.gatewayDetails.metadata.kubernetes_connector_id
        )
        prevSelectedConnector && setSelectedConnector(prevSelectedConnector)
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  const updateNameInYaml = React.useCallback(
    _debounce((_nameString: string) => {
      // updated only in case of k8s
      if (isK8sSelected) {
        const yamlRuleName = yamlData?.metadata?.name
        const updatedName = yamlRuleName && Utils.getHyphenSpacedString(_nameString)
        if (updatedName && yamlRuleName !== updatedName) {
          const updatedYaml = {
            ...yamlData,
            metadata: {
              ...yamlData.metadata,
              name: updatedName,
              annotations: {
                ...yamlData.metadata.annotations,
                'nginx.ingress.kubernetes.io/configuration-snippet': `more_set_input_headers "AutoStoppingRule: ${orgIdentifier}-${projectIdentifier}-${updatedName}";`
              }
            }
          }
          setYamlData(updatedYaml)
          const updatedGatewayDetails: GatewayDetails = {
            ...props.gatewayDetails,
            name: _nameString,
            routing: { ...props.gatewayDetails.routing, k8s: { RuleJson: JSON.stringify(updatedYaml) } }
          }
          props.setGatewayDetails(updatedGatewayDetails)
        }
      }
    }, 500),
    [isK8sSelected, yamlData]
  )

  useEffect(() => {
    updateNameInYaml(gatewayName)
  }, [gatewayName])

  const { mutate: getSecurityGroups, loading } = useSecurityGroupsOfInstances({
    org_id: orgIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })
  const fetchInstanceSecurityGroups = async (): Promise<void> => {
    const emptyRecords: PortConfig[] = []
    try {
      let text = `id = ['${
        props.gatewayDetails.selectedInstances ? props.gatewayDetails.selectedInstances[0].id : ''
      }']\nregions = ['${
        props.gatewayDetails.selectedInstances ? props.gatewayDetails.selectedInstances[0].region : ''
      }']`

      if (isAzureProvider) {
        text += `\nresource_groups=['${
          props.gatewayDetails.selectedInstances
            ? props.gatewayDetails.selectedInstances[0].metadata?.resourceGroup
            : ''
        }']`
      }

      const result = await getSecurityGroups({
        text
      })
      if (result && result.response) {
        Object.keys(result.response).forEach(instance => {
          result.response?.[instance].forEach(sg => {
            sg?.inbound_rules?.forEach(rule => {
              if (rule.protocol == '-1' || rule.from === '*') {
                addAllPorts()
                return
              } else if (rule && rule.from && [80, 443].includes(+rule.from)) {
                const fromRule = +rule.from
                const toRule = +(rule.to ? rule.to : 0)
                emptyRecords.push({
                  protocol: portProtocolMap[fromRule],
                  port: fromRule,
                  action: 'forward',
                  target_protocol: portProtocolMap[fromRule], // eslint-disable-line
                  target_port: toRule, // eslint-disable-line
                  server_name: '', // eslint-disable-line
                  redirect_url: '', // eslint-disable-line
                  routing_rules: [] // eslint-disable-line
                })
                const routes = [...emptyRecords]
                if (routes.length) setRoutingRecords(routes)
              }
            })
          })
        })
      }
    } catch (e) {
      showError(e.data?.message || e.message, undefined, 'ce.creaetap.result.error')
    }
  }

  function isValid(): boolean {
    return (
      (selectedInstances.length > 0 || !_isEmpty(selectedAsg) || !_isEmpty(selectedConnector)) &&
      (selectedResource !== RESOURCES.KUBERNETES ? routingRecords.length > 0 : true) &&
      gatewayName != '' &&
      idleTime >= 5 &&
      (selectedResource === RESOURCES.INSTANCES ? fullfilment != '' : true) &&
      (!_isEmpty(serviceDependencies)
        ? serviceDependencies.every(_dep => !isNaN(_dep.dep_id) && !isNaN(_dep.delay_secs))
        : true) &&
      (selectedResource === RESOURCES.KUBERNETES ? !_isEmpty(yamlData) : true)
    )
  }

  const resetSelectedInstancesDetails = () => {
    setRoutingRecords([])
    setSelectedInstances([])
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.selectedInstances = []
    props.setGatewayDetails(updatedGatewayDetails)
  }

  const resetSelectedAsgDetails = () => {
    setRoutingRecords([])
    setSelectedAsg(undefined)
    const updatedGatewayDetails = { ...props.gatewayDetails }
    delete updatedGatewayDetails.routing.instance.scale_group
    props.setGatewayDetails(updatedGatewayDetails)
  }

  const clearResourceDetailsFromGateway = (resourceType: RESOURCES) => {
    if (resourceType) {
      switch (resourceType) {
        case RESOURCES.INSTANCES:
          // set total no. of steps to default (4)
          if (totalStepsCount !== DEFAULT_TOTAL_STEP_COUNT) {
            setTotalStepsCount(DEFAULT_TOTAL_STEP_COUNT)
          }
          // remove details related to AsG
          if (!_isEmpty(props.gatewayDetails.routing.instance.scale_group)) {
            resetSelectedAsgDetails()
          }
          if (!_isEmpty(props.gatewayDetails.metadata.kubernetes_connector_id)) {
            resetKubernetesConnectorDetails()
          }
          break
        case RESOURCES.ASG:
          // set total no. of steps to default (4)
          if (totalStepsCount !== DEFAULT_TOTAL_STEP_COUNT) {
            setTotalStepsCount(DEFAULT_TOTAL_STEP_COUNT)
          }
          // remove details related to instances
          if (!_isEmpty(props.gatewayDetails.selectedInstances)) {
            resetSelectedInstancesDetails()
          }
          if (!_isEmpty(props.gatewayDetails.metadata.kubernetes_connector_id)) {
            resetKubernetesConnectorDetails()
          }
          break
        case RESOURCES.KUBERNETES:
          // set total no. of steps to modified (3)
          setTotalStepsCount(MODIFIED_TOTAL_STEP_COUNT)
          if (!_isEmpty(props.gatewayDetails.selectedInstances)) {
            resetSelectedInstancesDetails()
          }
          if (!_isEmpty(props.gatewayDetails.routing.instance.scale_group)) {
            resetSelectedAsgDetails()
          }
          break
        default:
          return
      }
    }
  }

  const resetKubernetesConnectorDetails = () => {
    setSelectedConnector(undefined)
    const updatedRouting = _omit(props.gatewayDetails.routing, 'k8s')
    const updatedMetadata = _omit(props.gatewayDetails.metadata, 'kubernetes_connector_id')
    const updatedGatewayDetails: GatewayDetails = {
      ...props.gatewayDetails,
      routing: updatedRouting,
      metadata: updatedMetadata
    }
    props.setGatewayDetails(updatedGatewayDetails)
  }

  useEffect(() => {
    // run only in case of selecting instances
    if (selectedResource === RESOURCES.INSTANCES) {
      if (!selectedInstances.length) {
        setRoutingRecords([])
        return
      }
      if (routingRecords.length) {
        return
      }
      fetchInstanceSecurityGroups()
    }
  }, [selectedInstances])

  useEffect(() => {
    clearResourceDetailsFromGateway(selectedResource as RESOURCES)
  }, [selectedResource])

  useEffect(() => {
    if (!props.gatewayDetails.provider) return
    refreshInstances()
    isAwsProvider && fetchAndSetAsgItems()
    isKubernetesEnabled && fetchAndSetConnectors()
  }, [props.gatewayDetails.provider])
  useEffect(() => {
    if (isValid()) {
      props.setValidity(true)
    } else {
      props.setValidity(false)
    }
  }, [
    selectedInstances,
    routingRecords,
    gatewayName,
    idleTime,
    fullfilment,
    selectedAsg,
    serviceDependencies,
    yamlData,
    selectedResource,
    selectedConnector
  ])
  function handleSearch(text: string): void {
    if (!text) {
      setFilteredInstances(allInstances)
      return
    }
    text = text.toLowerCase()
    const instances: InstanceDetails[] = []
    allInstances.forEach(t => {
      const r = t as InstanceDetails
      const name = r.name as string
      const id = r.id as string
      if (name.toLowerCase().indexOf(text) >= 0 || id.toLowerCase().indexOf(text) >= 0) {
        instances.push(t)
      }
    })
    setFilteredInstances(instances)
  }
  function addPort(): void {
    routingRecords.push({
      protocol: 'http',
      port: 80,
      action: 'forward',
      target_protocol: 'http', // eslint-disable-line
      target_port: 80, // eslint-disable-line
      redirect_url: '', // eslint-disable-line
      server_name: '', // eslint-disable-line
      routing_rules: [] // eslint-disable-line
    })
    const routes = [...routingRecords]
    setRoutingRecords(routes)
  }
  function addAllPorts(): void {
    const emptyRecords: PortConfig[] = []
    Object.keys(portProtocolMap).forEach(item => {
      emptyRecords.push({
        protocol: portProtocolMap[+item],
        port: +item,
        action: 'forward',
        target_protocol: portProtocolMap[+item], // eslint-disable-line
        target_port: +item, // eslint-disable-line
        server_name: '', // eslint-disable-line
        redirect_url: '', // eslint-disable-line
        routing_rules: [] // eslint-disable-line
      })
    })
    const routes = [...emptyRecords]
    if (routes.length) setRoutingRecords(routes)
  }
  function addDependency(): void {
    serviceDependencies.push({
      delay_secs: 5 // eslint-disable-line
    })
    const deps = [...serviceDependencies]
    setServiceDependencies(deps)
  }

  const handleAsgInstancesChange = (formik: FormikContext<any>, val: string, instanceType: 'OD' | 'SPOT') => {
    switch (instanceType) {
      case 'OD':
        if (Utils.isNumber(val)) {
          const numericVal = Number(val)
          formik.setFieldValue('odInstance', numericVal)
          selectedAsg?.mixed_instance &&
            formik.setFieldValue(
              'spotInstance',
              (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal
            )
          const updatedGatewayDetails = { ...props.gatewayDetails }
          // eslint-disable-next-line
          updatedGatewayDetails.routing.instance.scale_group = {
            ...props.gatewayDetails.routing.instance.scale_group,
            on_demand: numericVal, // eslint-disable-line
            // eslint-disable-next-line
            ...(selectedAsg?.mixed_instance && {
              spot: (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal // eslint-disable-line
            })
          }
          props.setGatewayDetails(updatedGatewayDetails)
        }
        break
      case 'SPOT':
        if (Utils.isNumber(val)) {
          const numericVal = Number(val)
          formik.setFieldValue('spotInstance', numericVal)
          formik.setFieldValue(
            'odInstance',
            (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal
          )
          const updatedGatewayDetails = { ...props.gatewayDetails }
          // eslint-disable-next-line
          updatedGatewayDetails.routing.instance.scale_group = {
            ...props.gatewayDetails.routing.instance.scale_group,
            spot: numericVal,
            on_demand: (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal // eslint-disable-line
          }
          props.setGatewayDetails(updatedGatewayDetails)
        }
        break
    }
  }

  const handleHealthCheckToggle = (toggleStatus: boolean) => {
    setHealthCheckPattern(toggleStatus ? Utils.getDefaultRuleHealthCheck() : null)
    setHealthCheck(toggleStatus)
  }

  const step4Title =
    selectedResource === RESOURCES.KUBERNETES
      ? `${getString('ce.co.gatewayReview.routing')} and ${getString(
          'ce.co.autoStoppingRule.configuration.step4.advancedConfiguration'
        )}`
      : `${getString('ce.co.gatewayReview.routing')}, ${getString('ce.co.gatewayConfig.healthCheck')} and ${getString(
          'ce.co.autoStoppingRule.configuration.step4.advancedConfiguration'
        )}`

  const getSelectedResourceText = (resource: string) => {
    switch (resource) {
      case RESOURCES.INSTANCES:
        return getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.instance')
      case RESOURCES.ASG:
        return getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.asg')
      case RESOURCES.KUBERNETES:
        return getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.kubernetes')
      default:
        return ''
    }
  }

  const getSelectedResourceModalCta = (resource: string) => {
    switch (resource) {
      case RESOURCES.INSTANCES:
        return `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.instance')}`
      case RESOURCES.ASG:
        return `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.asg')}`
      case RESOURCES.KUBERNETES:
        return `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.kubernetes')}`
      default:
        return ''
    }
  }

  const openSelectedResourceModal = () => {
    switch (selectedResource?.valueOf()) {
      case RESOURCES.INSTANCES:
        openInstancesModal()
        break
      case RESOURCES.ASG:
        openAsgModal()
        break
      case RESOURCES.KUBERNETES:
        openClusterModal()
        break
    }
  }

  /* Move to common file */
  const RenderColumnConnector: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    const tags = data.connector?.tags || {}
    return (
      <Layout.Horizontal spacing="small">
        <div>
          <Layout.Horizontal spacing="small">
            <div color={Color.BLACK} title={data.connector?.name}>
              {data.connector?.name}
            </div>
            {tags && Object.keys(tags).length ? <TagsPopover tags={tags} /> : null}
          </Layout.Horizontal>
          <div title={data.connector?.identifier}>{data.connector?.identifier}</div>
        </div>
      </Layout.Horizontal>
    )
  }

  const RenderColumnDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original

    return data.connector ? (
      <div>
        <div color={Color.BLACK}>{getK8DisplaySummary(data.connector)}</div>
      </div>
    ) : null
  }

  const getConnectorDisplaySummaryLabel = (titleStringId: StringKeys, Element: JSX.Element): JSX.Element | string => {
    return (
      <div>
        {titleStringId ? (
          <Text inline color={Color.BLACK}>
            <String stringID={titleStringId} />:
          </Text>
        ) : null}
        {Element}
      </div>
    )
  }

  const displayDelegatesTagsSummary = (delegateSelectors: []): JSX.Element => {
    return (
      <div>
        <Text inline color={Color.BLACK}>
          <String stringID={'delegate.delegateTags'} />:
        </Text>
        <Text inline margin={{ left: 'xsmall' }} color={Color.GREY_400}>
          {delegateSelectors?.join?.(', ')}
        </Text>
      </div>
    )
  }

  const getK8DisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
    return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
      ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
      : getConnectorDisplaySummaryLabel('UrlLabel', <Text>{connector?.spec?.credential?.spec?.masterUrl}</Text>)
  }

  const RenderColumnActivity: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        <Icon name="activity" />
        {data.activityDetails?.lastActivityTime ? <ReactTimeago date={data.activityDetails?.lastActivityTime} /> : null}
      </Layout.Horizontal>
    )
  }
  const RenderColumnLastUpdated: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        {data.lastModifiedAt ? <ReactTimeago date={data.lastModifiedAt} /> : null}
      </Layout.Horizontal>
    )
  }

  const handleYamlSave = (_data: Record<any, any>) => {
    setYamlData(_data)
    const updatedGatewayDetails: GatewayDetails = {
      ...props.gatewayDetails,
      routing: { ...props.gatewayDetails.routing, k8s: { RuleJson: JSON.stringify(_data) } }
    }
    props.setGatewayDetails(updatedGatewayDetails)
    showSuccess(getString('ce.savedYamlSuccess'))
  }

  const isFFEnabledForResource = (flags: string[] | undefined) => {
    let enableStatus = true
    if (!flags || _isEmpty(flags)) return enableStatus
    flags.forEach(_flag => {
      if (!featureFlagsMap[_flag]) {
        enableStatus = false
      }
    })
    return enableStatus
  }

  return (
    <Layout.Vertical ref={configContEl} className={css.page}>
      {/* {drawerOpen && (
        <COFixedDrawer
          topMargin={85}
          content={<COHelpSidebar pageName="configuration" activeSectionNames={activeDrawerIds} />}
          onClose={() => setDrawerOpen(false)}
        />
      )} */}
      <Drawer
        autoFocus={true}
        enforceFocus={true}
        hasBackdrop={true}
        usePortal={true}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
        }}
        size="392px"
        style={{
          // top: '85px',
          boxShadow: 'rgb(40 41 61 / 4%) 0px 2px 8px, rgb(96 97 112 / 16%) 0px 16px 24px',
          height: '100vh',
          overflowY: 'scroll'
        }}
      >
        <Container style={{ textAlign: 'right' }}>
          <Button icon="cross" minimal onClick={_ => setDrawerOpen(false)} />
        </Container>
        <COHelpSidebar pageName="configuration" activeSectionNames={activeDrawerIds} />
      </Drawer>
      <Container style={{ paddingTop: 10 }}>
        <Layout.Vertical spacing="large" padding="large">
          <COGatewayConfigStep
            count={1}
            title={getString('ce.co.autoStoppingRule.configuration.step1.title')}
            subTitle={getString('ce.co.autoStoppingRule.configuration.step1.subTitle')}
            totalStepsCount={totalStepsCount}
            id={CONFIG_STEP_IDS[0]}
          >
            <Layout.Horizontal>
              <Card interactive={false} className={css.displayCard}>
                <Icon name={props.gatewayDetails.provider.icon as IconName} size={30} />
                <Text style={{ marginTop: '5px' }} font="small">
                  {props.gatewayDetails.provider.name}
                </Text>
              </Card>
              {/* <Layout.Vertical style={{}}> */}
              {/* <Layout.Horizontal spacing="large">

                </Layout.Horizontal> */}
              <Formik
                initialValues={{
                  gatewayName: props.gatewayDetails.name,
                  idleTime: props.gatewayDetails.idleTimeMins
                }}
                formName="coGatewayConfig"
                onSubmit={values => alert(JSON.stringify(values))}
                render={formik => (
                  <FormikForm className={css.step1Form}>
                    <Layout.Horizontal spacing="xxxlarge">
                      <Layout.Vertical className={css.formElement}>
                        <Text style={{ fontSize: 16, fontWeight: 500, color: '#0B0B0D' }}>AutoStopping Rule Name</Text>
                        <FormInput.Text
                          name="gatewayName"
                          label={getString('ce.co.gatewayConfig.name')}
                          placeholder={getString('ce.co.autoStoppingRule.configuration.step1.nameInputPlaceholder')}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldValue('gatewayName', e.target.value)
                            props.gatewayDetails.name = e.target.value
                            props.setGatewayDetails(props.gatewayDetails)
                            setGatewayName(e.target.value)
                          }}
                        />
                      </Layout.Vertical>
                      <Layout.Vertical className={css.formElement}>
                        <Text style={{ fontSize: 16, fontWeight: 500, color: '#0B0B0D' }}>
                          Idle Time (mins)
                          <Icon
                            name="info"
                            onClick={() => {
                              setDrawerOpen(true)
                            }}
                          ></Icon>
                        </Text>
                        <FormInput.Text
                          name="idleTime"
                          placeholder={getString('ce.co.autoStoppingRule.configuration.step1.idleTimeInputPlaceholder')}
                          label={
                            <Layout.Horizontal spacing="small">
                              <Text style={{ fontSize: 13 }}>
                                {getString('ce.co.autoStoppingRule.configuration.step1.form.idleTime.label')}
                              </Text>
                            </Layout.Horizontal>
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldValue('idleTime', e.target.value)
                            props.gatewayDetails.idleTimeMins = +e.target.value
                            props.setGatewayDetails(props.gatewayDetails)
                            setIdleTime(+e.target.value)
                          }}
                        />
                      </Layout.Vertical>
                    </Layout.Horizontal>
                  </FormikForm>
                )}
                validationSchema={Yup.object().shape({
                  gatewayName: Yup.string()
                    .trim()
                    .required('Rule Name is required field')
                    .matches(
                      isK8sSelected ? /[a-z0-9]([-a-z0-9]*[a-z0-9])?/ : /.*/,
                      'Name should not contain special characters'
                    ),
                  idleTime: Yup.number().typeError('Idle time must be a number').required('Idle Time is required field')
                })}
              ></Formik>
              {/* </Layout.Vertical> */}
            </Layout.Horizontal>
          </COGatewayConfigStep>
          <COGatewayConfigStep
            count={2}
            title={getString('ce.co.autoStoppingRule.configuration.step2.title')}
            onInfoIconClick={() => setDrawerOpen(true)}
            subTitle={getString('ce.co.autoStoppingRule.configuration.step2.subTitle')}
            totalStepsCount={totalStepsCount}
            id={CONFIG_STEP_IDS[1]}
          >
            <Layout.Vertical className={css.step2Container}>
              <Text className={css.radioGroupTitle}>Select the resources to be managed by the rule</Text>
              <RadioGroup
                selectedValue={selectedResource?.valueOf()}
                onChange={e => {
                  setSelectedResource(e.currentTarget.value as RESOURCES)
                }}
                className={css.radioGroup}
              >
                {managedResources
                  .filter(
                    resource =>
                      resource.providers.includes(props.gatewayDetails.provider.value) &&
                      isFFEnabledForResource(resource.ffDependencies)
                  )
                  .map(resourceItem => {
                    return <Radio key={resourceItem.value} label={resourceItem.label} value={resourceItem.value} />
                  })}
              </RadioGroup>
              {!_isEmpty(selectedResource) && (
                <Layout.Vertical style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, color: '#9293AB', marginBottom: 10 }}>
                    {getSelectedResourceText(selectedResource?.valueOf() as string)}
                  </Text>
                  <Text style={{ cursor: 'pointer', color: '#0278D5' }} onClick={openSelectedResourceModal}>
                    {getSelectedResourceModalCta(selectedResource?.valueOf() as string)}
                  </Text>
                </Layout.Vertical>
              )}
              {selectedInstances.length ? (
                <Table<InstanceDetails>
                  data={selectedInstances}
                  bpTableProps={{}}
                  className={css.instanceTable}
                  columns={[
                    {
                      accessor: 'name',
                      Header: 'NAME AND ID',
                      width: '16.5%',
                      Cell: NameCell
                    },
                    {
                      accessor: 'ipv4',
                      Header: 'IP ADDRESS',
                      width: '16.5%',
                      Cell: TableCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'region',
                      Header: 'REGION',
                      width: '16.5%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'type',
                      Header: 'TYPE',
                      width: '16.5%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'tags',
                      Header: 'TAGS',
                      width: '16.5%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'launch_time',
                      Header: 'LAUNCH TIME',
                      width: '16.5%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'status',
                      Header: 'STATUS',
                      width: '16.5%',
                      Cell: TableCell
                    },
                    {
                      Header: '',
                      id: 'menu',
                      accessor: row => row.id,
                      width: '5%',
                      Cell: RemoveCell,
                      disableSortBy: true
                    }
                  ]}
                />
              ) : null}
              {!_isEmpty(selectedAsg) && (
                <Table<ASGMinimal>
                  data={[selectedAsg as ASGMinimal]}
                  bpTableProps={{}}
                  columns={[
                    {
                      accessor: 'name',
                      Header: 'Name and ID',
                      width: '16.5%',
                      Cell: NameCell
                    },
                    {
                      accessor: 'desired',
                      Header: 'Instances',
                      width: '10%',
                      Cell: TableCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'region',
                      Header: 'Region',
                      width: '16.5%',
                      Cell: TableCell
                    }
                  ]}
                />
              )}
              {!_isEmpty(selectedConnector) && (
                <Table<ConnectorResponse>
                  data={[selectedConnector as ConnectorResponse]}
                  bpTableProps={{}}
                  columns={[
                    {
                      Header: getString('connector').toUpperCase(),
                      accessor: row => row.connector?.name,
                      id: 'name',
                      width: '20%',
                      Cell: RenderColumnConnector
                    },
                    {
                      Header: getString('details').toUpperCase(),
                      accessor: row => row.connector?.description,
                      id: 'details',
                      width: '20%',
                      Cell: RenderColumnDetails
                    },
                    {
                      Header: getString('lastActivity').toUpperCase(),
                      accessor: 'activityDetails',
                      id: 'activity',
                      width: '20%',
                      Cell: RenderColumnActivity
                    },
                    // {
                    //   Header: getString('connectivityStatus').toUpperCase(),
                    //   accessor: 'status',
                    //   id: 'status',
                    //   width: '15%',
                    //   Cell: RenderColumnStatus
                    // },
                    {
                      Header: getString('lastUpdated').toUpperCase(),
                      accessor: 'lastModifiedAt',
                      id: 'lastModifiedAt',
                      width: '20%',
                      Cell: RenderColumnLastUpdated
                    }
                  ]}
                />
              )}
            </Layout.Vertical>
          </COGatewayConfigStep>
          {selectedResource !== RESOURCES.KUBERNETES && (
            <COGatewayConfigStep
              count={3}
              title={
                selectedAsg
                  ? getString('ce.co.autoStoppingRule.configuration.step3.asgTitle')
                  : getString('ce.co.autoStoppingRule.configuration.step3.title')
              }
              onInfoIconClick={() => setDrawerOpen(true)}
              subTitle={
                selectedAsg
                  ? getString('ce.co.autoStoppingRule.configuration.step3.asgSubTitle')
                  : getString('ce.co.autoStoppingRule.configuration.step3.subTitle')
              }
              totalStepsCount={totalStepsCount}
              id={CONFIG_STEP_IDS[2]}
            >
              {!selectedAsg && (
                <Layout.Vertical>
                  <CardSelect
                    data={instanceTypeCardData.filter(_instanceType =>
                      _instanceType.providers?.includes(props.gatewayDetails.provider.value)
                    )}
                    className={css.instanceTypeViewGrid}
                    onChange={item => {
                      setSelectedInstanceType(item)
                      props.gatewayDetails.fullfilment = (item as CardData).value
                      props.setGatewayDetails(props.gatewayDetails)
                      setFullfilment((item as CardData).value)
                      trackEvent('SelectedInstanceType', { value: item?.value || '' })
                    }}
                    renderItem={(item, _) => (
                      <Layout.Vertical spacing="large">
                        <img src={(item as CardData).icon} alt="" aria-hidden />
                      </Layout.Vertical>
                    )}
                    selected={selectedInstanceType}
                    cornerSelected={true}
                  ></CardSelect>
                  <Layout.Horizontal spacing="small" className={css.instanceTypeNameGrid}>
                    {instanceTypeCardData
                      .filter(_instanceType => _instanceType.providers?.includes(props.gatewayDetails.provider.value))
                      .map(_item => {
                        return (
                          <Text font={{ align: 'center' }} style={{ fontSize: 12 }} key={_item.text}>
                            {_item.text}
                          </Text>
                        )
                      })}
                  </Layout.Horizontal>
                </Layout.Vertical>
              )}
              {selectedAsg && (
                <Layout.Horizontal className={css.asgInstanceSelectionContianer}>
                  <div className={css.asgInstanceDetails}>
                    <Text className={css.asgDetailRow}>
                      <span>Desired capacity: </span>
                      <span>{selectedAsg.desired}</span>
                    </Text>
                    <Text className={css.asgDetailRow}>
                      <span>Min capacity: </span>
                      <span>{selectedAsg.min}</span>
                    </Text>
                    <Text className={css.asgDetailRow}>
                      <span>Max capacity: </span>
                      <span>{selectedAsg.max}</span>
                    </Text>
                  </div>
                  <div className={css.asgInstanceFormContainer}>
                    <Formik
                      initialValues={{
                        odInstance: props.gatewayDetails.routing.instance.scale_group?.on_demand || selectedAsg.desired,
                        spotInstance: _get(props.gatewayDetails.routing.instance.scale_group, 'spot', 0)
                      }}
                      formName="odInstance"
                      onSubmit={_ => {}} // eslint-disable-line
                      render={formik => (
                        <FormikForm>
                          <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
                            <Layout.Vertical className={css.instanceTypeInput}>
                              <FormInput.Text
                                name={'odInstance'}
                                inputGroup={{ type: 'number', pattern: '[0-9]*' }}
                                label={
                                  <Layout.Horizontal>
                                    <img src={odIcon} />
                                    <Text>On-Demand</Text>
                                  </Layout.Horizontal>
                                }
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleAsgInstancesChange(formik, e.target.value, 'OD')
                                }
                              />
                            </Layout.Vertical>
                            <Layout.Vertical className={css.instanceTypeInput}>
                              <FormInput.Text
                                name={'spotInstance'}
                                inputGroup={{ type: 'number', pattern: '[0-9]*' }}
                                disabled={!selectedAsg?.mixed_instance}
                                helperText={
                                  !selectedAsg?.mixed_instance &&
                                  getString('ce.co.autoStoppingRule.configuration.step3.policyNotEnabled')
                                }
                                label={
                                  <Layout.Horizontal>
                                    <img src={spotIcon} />
                                    <Text>Spot</Text>
                                  </Layout.Horizontal>
                                }
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleAsgInstancesChange(formik, e.target.value, 'SPOT')
                                }
                              />
                            </Layout.Vertical>
                          </Layout.Horizontal>
                        </FormikForm>
                      )}
                      validationSchema={Yup.object().shape({
                        odInstance: Yup.number()
                          .required()
                          .positive()
                          .min(0)
                          .max(selectedAsg.max as number),
                        spotInstance: Yup.number()
                          .positive()
                          .min(0)
                          .max(selectedAsg.max as number)
                      })}
                    ></Formik>
                  </div>
                </Layout.Horizontal>
              )}
            </COGatewayConfigStep>
          )}
          <COGatewayConfigStep
            count={isK8sSelected ? MODIFIED_TOTAL_STEP_COUNT : DEFAULT_TOTAL_STEP_COUNT}
            title={`${getString('ce.co.autoStoppingRule.configuration.step4.setup')} ${step4Title}`}
            totalStepsCount={totalStepsCount}
            id={CONFIG_STEP_IDS[3]}
          >
            {selectedInstances.length || !_isEmpty(selectedAsg) || !_isEmpty(selectedConnector) ? (
              <Container style={{ justifyContent: 'center', maxWidth: '947px' }}>
                <Container className={css.configTab}>
                  <Tabs
                    id="tabsId1"
                    selectedTabId={activeConfigTabId}
                    onChange={tabId => tabId !== activeConfigTabId && setActiveConfigTabId(tabId as string)}
                  >
                    <Tab
                      id="routing"
                      title="Routing"
                      panel={
                        <Container style={{ backgroundColor: '#FBFBFB' }}>
                          {!isK8sSelected && (
                            <Layout.Vertical spacing="large">
                              {!selectedAsg && loading ? (
                                <Icon
                                  name="spinner"
                                  size={24}
                                  color="blue500"
                                  style={{ alignSelf: 'center', marginTop: '10px' }}
                                />
                              ) : (
                                <CORoutingTable routingRecords={routingRecords} setRoutingRecords={setRoutingRecords} />
                              )}
                              <Container className={css.rowItem}>
                                <Text
                                  onClick={() => {
                                    addPort()
                                  }}
                                >
                                  {getString('ce.co.gatewayConfig.addPortLabel')}
                                </Text>
                              </Container>
                            </Layout.Vertical>
                          )}
                          {isK8sSelected && (
                            <KubernetesRuleYamlEditor
                              existingData={
                                yamlData ||
                                getK8sIngressTemplate({
                                  name: props.gatewayDetails.name,
                                  idleTime: props.gatewayDetails.idleTimeMins,
                                  cloudConnectorId: props.gatewayDetails.cloudAccount.id,
                                  orgId: orgIdentifier,
                                  projectId: projectIdentifier
                                })
                              }
                              fileName={gatewayName && `${gatewayName.split(' ').join('-')}-autostopping.yaml`}
                              handleSave={handleYamlSave}
                            />
                          )}
                        </Container>
                      }
                    />
                    {selectedResource !== RESOURCES.KUBERNETES && (
                      <Tab
                        id="healthcheck"
                        title="Health check"
                        panel={
                          <Container style={{ backgroundColor: '#FBFBFB', maxWidth: '523px', marginLeft: '210px' }}>
                            <Layout.Vertical spacing="large" padding="large">
                              <Switch
                                label={getString('ce.co.gatewayConfig.healthCheck')}
                                className={css.switchFont}
                                onChange={e => {
                                  handleHealthCheckToggle(e.currentTarget.checked)
                                }}
                                checked={healthCheck}
                              />
                              {healthCheck && (
                                <COHealthCheckTable
                                  pattern={healthCheckPattern}
                                  updatePattern={setHealthCheckPattern}
                                />
                              )}
                            </Layout.Vertical>
                          </Container>
                        }
                      />
                    )}
                    <Tab
                      id="advanced"
                      title="Advanced Configuration"
                      panel={
                        <Container style={{ backgroundColor: '#FBFBFB', width: '595px', marginLeft: '175px' }}>
                          <Layout.Vertical spacing="medium" style={{ padding: '32px' }}>
                            {/* <Switch
                              label={getString('ce.co.gatewayConfig.allowTraffic')}
                              width="50%"
                              className={css.switchFont}
                              checked={matchSubdomains}
                              onChange={e => {
                                props.gatewayDetails.matchAllSubdomains = e.currentTarget.checked
                                setMatchSubdomains(e.currentTarget.checked)
                                props.setGatewayDetails(props.gatewayDetails)
                              }}
                            />
                            <Switch
                              label={getString('ce.co.gatewayConfig.usePrivateIP')}
                              width="50%"
                              className={css.switchFont}
                              checked={usePrivateIP}
                              onChange={e => {
                                props.gatewayDetails.opts.alwaysUsePrivateIP = e.currentTarget.checked
                                setUsePrivateIP(e.currentTarget.checked)
                                props.setGatewayDetails(props.gatewayDetails)
                              }}
                            /> */}
                            {serviceDependencies && serviceDependencies.length ? (
                              <CORuleDendencySelector
                                deps={serviceDependencies}
                                setDeps={setServiceDependencies}
                                service_id={props.gatewayDetails.id}
                                allServices={servicesData?.response as Service[]}
                              ></CORuleDendencySelector>
                            ) : null}
                            <Container>
                              <Text
                                onClick={() => {
                                  addDependency()
                                }}
                                style={{ color: 'var(--primary-7)', cursor: 'pointer' }}
                              >
                                {'+ add dependency'}
                              </Text>
                            </Container>
                          </Layout.Vertical>
                        </Container>
                      }
                    />
                  </Tabs>
                </Container>
              </Container>
            ) : null}
          </COGatewayConfigStep>
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}

export default COGatewayConfig
