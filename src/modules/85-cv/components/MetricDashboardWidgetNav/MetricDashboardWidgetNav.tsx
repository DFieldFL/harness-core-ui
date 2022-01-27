/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Color, Container, Link, Text, Utils } from '@wings-software/uicore'
import { Classes, ITreeNode, PopoverInteractionKind, Tree } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { String, useStrings } from 'framework/strings'
import {
  MANUAL_INPUT_QUERY,
  ManualInputQueryModal
} from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/components/ManualInputQueryModal/ManualInputQueryModal'
import { PageSpinner } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type {
  MetricDashboardItem,
  MetricDashboardWidgetNavProps,
  MetricWidget,
  NodeDataType,
  TreeNodeLabelProps
} from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import css from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.module.scss'

const NodeDepth = {
  METRIC: 3,
  WIDGET: 2,
  DASHBOARD: 1
}
const LabelWidth = {
  FIRST_LEVEL: 192,
  SECOND_LEVEL: 170,
  THIRD_LEVEL: 140
}

const NodeType = {
  MANUAL_INPUT_METRIC: 'ManuallyInputQueryMetric',
  MANUAL_INPUT_QUERY: 'ManuualyInputQuery',
  DASHBOARD: 'Dashboard',
  WIDGET: 'Widget',
  METRIC: 'Metric',
  LABEL: 'Label'
}

const LoadingSkeleton = [
  {
    id: 1,
    isExpanded: true,
    disabled: true,
    label: <Container className={Classes.SKELETON} width={177} height={15} />,
    childNodes: [
      { id: 2, label: <Container className={Classes.SKELETON} width={155} height={15} /> },
      { id: 3, label: <Container className={Classes.SKELETON} width={155} height={15} /> },
      {
        id: 4,
        label: <Container className={Classes.SKELETON} width={155} height={15} />
      }
    ]
  },
  {
    id: 2,
    isExpanded: false,
    disabled: true,
    label: <Container className={Classes.SKELETON} width={177} height={15} />,
    hasCaret: true
  }
]

function initializeSelectedMetric(dashboardWidgetItems?: MetricDashboardItem[]): number[] | undefined {
  return dashboardWidgetItems?.length ? [1, 0, 0] : [0, 0]
}

function deselectMetric(navContent: ITreeNode[], nodePath?: number[]): void {
  if (!nodePath?.length) {
    return
  }

  let currNode = navContent[nodePath[0]]
  navContent[nodePath[0]] = currNode
  for (let pathIndex = 1; pathIndex < nodePath.length; pathIndex++) {
    currNode = currNode.childNodes?.[nodePath[pathIndex]] || ({} as ITreeNode)
    if (currNode && pathIndex === nodePath.length - 1) {
      currNode.isSelected = false
    }
  }
}

function generateTreeNode(type: string, data: any, id: string, isExpanded = false): ITreeNode<NodeDataType> {
  switch (type) {
    case NodeType.DASHBOARD:
      return {
        id,
        hasCaret: true,
        label: <TreeNodeLabel width={LabelWidth.FIRST_LEVEL} label={data.name} />,
        childNodes: [],
        nodeData: {
          data,
          type: NodeType.DASHBOARD
        }
      }
    case NodeType.WIDGET:
      return {
        id: id,
        hasCaret: true,
        isExpanded: isExpanded,
        label: <TreeNodeLabel width={LabelWidth.SECOND_LEVEL} label={id} />,
        childNodes: [],
        nodeData: {
          type: NodeType.WIDGET
        }
      }
    case NodeType.METRIC:
      return {
        id: id,
        label: <TreeNodeLabel width={LabelWidth.THIRD_LEVEL} label={data.metric} />,
        hasCaret: false,
        isExpanded: false,
        nodeData: {
          data,
          type: NodeType.METRIC
        }
      }
    case NodeType.MANUAL_INPUT_QUERY:
      return {
        id: MANUAL_INPUT_QUERY,
        hasCaret: true,
        label: (
          <TreeNodeLabel
            width={LabelWidth.FIRST_LEVEL}
            label={<String stringID="cv.monitoringSources.gco.mapMetricsToServicesPage.manuallyInputQueriesLabel" />}
          />
        ),
        childNodes: [],
        nodeData: {
          type: NodeType.MANUAL_INPUT_QUERY
        }
      }
    case NodeType.LABEL:
      return {
        id: id,
        label: <TreeNodeLabel width={LabelWidth.SECOND_LEVEL} label={data.label} />,
        hasCaret: false,
        isExpanded: false,
        isSelected: false
      }
    case NodeType.MANUAL_INPUT_METRIC:
    default:
      return {
        id,
        hasCaret: false,
        label: <TreeNodeLabel width={LabelWidth.SECOND_LEVEL} label={id} />,
        childNodes: [],
        nodeData: {
          type: NodeType.MANUAL_INPUT_METRIC
        }
      }
  }
}

function transformDashboardsToTreeNodes(
  dashboardWidgetItems: MetricDashboardItem[],
  manuallyInputQueries: string[]
): ITreeNode<NodeDataType>[] {
  const treeNodes: ITreeNode<NodeDataType>[] = []

  for (const dashboard of dashboardWidgetItems || []) {
    if (dashboard?.title && dashboard.itemId) {
      treeNodes.push(generateTreeNode(NodeType.DASHBOARD, { name: dashboard.title }, dashboard.itemId))
    }
  }

  // create manually input queries tree node
  treeNodes.unshift(generateTreeNode(NodeType.MANUAL_INPUT_QUERY, undefined, MANUAL_INPUT_QUERY))

  // insert all manual metrics into manually input queries node
  for (const metric of manuallyInputQueries || []) {
    if (metric) {
      treeNodes[0]?.childNodes?.push(generateTreeNode(NodeType.MANUAL_INPUT_METRIC, undefined, metric))
    }
  }

  if (treeNodes[1]) {
    treeNodes[1].isExpanded = true
    treeNodes[1].childNodes = LoadingSkeleton
    // when there are no selected dashboards and only a manual query
  } else if (treeNodes[0].childNodes?.length) {
    treeNodes[0].childNodes[0].isSelected = true
    treeNodes[0].isExpanded = true
  }

  return treeNodes
}

function transformWidgetsToTreeNodes(
  metricWidgets: MetricWidget[],
  isFirstLoad: boolean,
  dashboardIndex: number
): { treeNodes: ITreeNode<NodeDataType>[]; selectedMetricPath?: number[]; selectedMetric?: ITreeNode<NodeDataType> } {
  if (!metricWidgets?.length) {
    return { treeNodes: [] }
  }

  const treeNodes: ITreeNode<NodeDataType>[] = []
  let selectedMetricPath: number[] = []
  let selectedMetric: ITreeNode<NodeDataType> = {} as ITreeNode<NodeDataType>
  for (let widgetIndex = 0; widgetIndex < metricWidgets.length; widgetIndex++) {
    const widget = metricWidgets[widgetIndex]
    if (!widget || !widget.widgetName || !widget.dataSets?.length) {
      continue
    }

    const treeNode: ITreeNode<NodeDataType> = generateTreeNode(
      NodeType.WIDGET,
      undefined,
      widget.widgetName,
      widgetIndex === 0
    )

    for (let dataSetIndex = 0; dataSetIndex < widget.dataSets.length; dataSetIndex++) {
      const dataSet = widget.dataSets[dataSetIndex]
      if (!dataSet || !dataSet.name || !dataSet.query) {
        continue
      }

      const metric: ITreeNode<NodeDataType> = generateTreeNode(
        NodeType.METRIC,
        { metric: dataSet.name, widget: widget.widgetName, query: dataSet.query },
        dataSet.id
      )
      if (isFirstLoad && dataSetIndex === 0 && widgetIndex === 0) {
        metric.isSelected = true
        selectedMetricPath = [dashboardIndex, 0, 0]
        selectedMetric = metric
      }
      treeNode.childNodes?.push(metric)
    }

    treeNodes.push(treeNode)
  }

  return { treeNodes, selectedMetricPath, selectedMetric }
}

function TreeNodeLabel(props: TreeNodeLabelProps): JSX.Element {
  const { width, label } = props
  return (
    <Text
      color={Color.BLACK}
      width={width}
      lineClamp={1}
      className={css.textOverflow}
      tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
    >
      {label}
    </Text>
  )
}

export default function MetricDashboardWidgetNav<T>(props: MetricDashboardWidgetNavProps<T>): JSX.Element {
  const {
    className,
    connectorIdentifier,
    dashboards,
    onSelectMetric,
    showSpinnerOnLoad,
    manuallyInputQueries = [],
    dashboardWidgetMapper,
    dashboardDetailsRequest,
    addManualQueryTitle
  } = props

  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps>()
  const [selectedMetricPath, setSelectedMetricPath] = useState<number[] | undefined>(
    initializeSelectedMetric(dashboards)
  )
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [selectedDashboard, setSelectedDashboard] = useState<MetricDashboardItem | undefined>(
    dashboards?.filter(dashboard => dashboard?.itemId && dashboard.title)[0]
  )
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [navContent, setNavContent] = useState<ITreeNode<NodeDataType>[]>(
    transformDashboardsToTreeNodes(dashboards, manuallyInputQueries)
  )
  const { error, loading, data: dashboardWidgetsData, refetch: fetchDetails } = dashboardDetailsRequest

  const metricWidgets: MetricWidget[] = useMemo(() => {
    return (
      dashboardWidgetsData?.data?.map((widgetToMap: any) => {
        return dashboardWidgetMapper(selectedDashboard?.itemId || '', widgetToMap)
      }) || []
    )
  }, [dashboardWidgetsData, dashboardWidgetMapper])

  useEffect(() => {
    const selectedDashIndex = navContent.findIndex(treeNode => treeNode.id === selectedDashboard?.itemId)
    if (selectedDashIndex === -1 || loading) {
      return
    }
    if (error?.data) {
      navContent[selectedDashIndex].isExpanded = false
      navContent[selectedDashIndex].childNodes = []
      setNavContent([...navContent])
      if (error?.data) {
        showError(getErrorMessage(error), 5000)
      }
    } else if (metricWidgets.length) {
      const {
        treeNodes,
        selectedMetricPath: metricPath,
        selectedMetric: metric
      } = transformWidgetsToTreeNodes(metricWidgets, isFirstLoad, selectedDashIndex)
      navContent[selectedDashIndex].childNodes = treeNodes
      setNavContent([...navContent])
      const { data: datum } = metric?.nodeData || {}
      if (isFirstLoad) {
        setSelectedMetricPath(metricPath)
        onSelectMetric(
          metric?.id as string,
          metric?.nodeData?.data?.metric,
          datum?.query,
          datum?.widget,
          selectedDashboard?.itemId,
          selectedDashboard?.title as string
        )
        setIsFirstLoad(false)
      }
    } else if (dashboardWidgetsData?.data && !metricWidgets.length) {
      navContent[selectedDashIndex].childNodes = [
        generateTreeNode(
          NodeType.LABEL,
          { label: getString('cv.monitoringSources.datadog.noMetricsWidgets') },
          'no_data_label_id'
        )
      ]
      setNavContent([...navContent])
    }
  }, [metricWidgets, loading])

  useEffect(() => {
    if (selectedDashboard?.itemId) {
      fetchDetails({
        queryParams: {
          projectIdentifier,
          orgIdentifier,
          accountId,
          connectorIdentifier,
          tracingId: Utils.randomId(),
          dashboardId: selectedDashboard.itemId,
          path: selectedDashboard.itemId
        }
      })
    }
  }, [selectedDashboard?.itemId, projectIdentifier, orgIdentifier, accountId, connectorIdentifier, fetchDetails])

  // when only manually input query is selected on load, run this hook
  useEffect(() => {
    if (!loading && isFirstLoad && selectedMetricPath?.toString() === '0,0' && navContent[0]?.childNodes?.[0]) {
      onSelectMetric(
        navContent[0]?.childNodes?.[0]?.id as string,
        navContent[0]?.childNodes?.[0]?.id as string,
        MANUAL_INPUT_QUERY
      )
    }
  }, [])

  return (
    <Container width={300} className={cx(css.main, className)}>
      {loading && showSpinnerOnLoad && <PageSpinner />}
      <Link withoutHref onClick={() => setIsModalOpen(true)} className={css.inputQueryLink}>
        {getString('cv.monitoringSources.gco.addManualInputQuery')}
      </Link>
      <Tree
        className={css.treeNodeContainer}
        contents={navContent}
        onNodeExpand={(node, nodePath) => {
          const { type, data: datum } = node.nodeData || {}
          if (
            nodePath.length === NodeDepth.DASHBOARD &&
            !node.childNodes?.length &&
            type !== NodeType.MANUAL_INPUT_QUERY
          ) {
            navContent.forEach(dashboard => (dashboard.isExpanded = false))
            node.childNodes = LoadingSkeleton
            setSelectedDashboard({ title: datum.name, itemId: node.id as string })
          }
          node.isExpanded = true
          setNavContent([...navContent])
        }}
        onNodeCollapse={node => {
          node.isExpanded = false
          setNavContent([...navContent])
        }}
        onNodeClick={(node, nodePath) => {
          const { isExpanded = false, id, childNodes, nodeData } = node
          const { data: datum, type } = nodeData || {}
          switch (nodePath.length) {
            case NodeDepth.DASHBOARD:
              navContent.forEach(dashboard => (dashboard.isExpanded = false))
              node.isExpanded = !isExpanded
              if (type !== NodeType.MANUAL_INPUT_QUERY && node.isExpanded && !childNodes?.length) {
                node.childNodes = LoadingSkeleton
                setSelectedDashboard({ title: nodeData?.data.name as string, itemId: id as string })
              }
              break
            case NodeDepth.WIDGET:
              if (nodePath.toString() === selectedMetricPath?.toString()) {
                return
              }
              if (type === NodeType.MANUAL_INPUT_METRIC) {
                node.isSelected = true
                deselectMetric(navContent, selectedMetricPath)
                setSelectedMetricPath(nodePath)
                setSelectedDashboard(undefined)
                onSelectMetric(node.id as string, node.id as string, MANUAL_INPUT_QUERY)
              } else {
                node.isExpanded = !isExpanded
              }
              break
            case NodeDepth.METRIC:
              if (nodePath.toString() === selectedMetricPath?.toString()) {
                return
              }
              node.isSelected = true
              deselectMetric(navContent, selectedMetricPath)
              setSelectedMetricPath(nodePath)
              onSelectMetric(
                id as string,
                datum.metric,
                datum.query,
                datum.widget,
                selectedDashboard?.itemId,
                selectedDashboard?.title as string
              )
              break
            default:
              break
          }
          setNavContent([...navContent])
        }}
      />
      {isModalOpen && (
        <ManualInputQueryModal
          title={addManualQueryTitle}
          manuallyInputQueries={manuallyInputQueries}
          onSubmit={values => {
            if (navContent.length > 0) {
              deselectMetric(navContent, selectedMetricPath)
              setSelectedDashboard(undefined)
              navContent.forEach(dashboard => (dashboard.isExpanded = false))
            }
            if (navContent[0]?.nodeData?.type === NodeType.MANUAL_INPUT_QUERY) {
              const newMetric = generateTreeNode(NodeType.MANUAL_INPUT_METRIC, undefined, values.metricName)
              newMetric.isSelected = true
              navContent[0].childNodes?.unshift(newMetric)
              navContent[0].isExpanded = true
            }
            setNavContent([...navContent])
            setSelectedMetricPath([0, 0])
            onSelectMetric(values.metricName, values.metricName, MANUAL_INPUT_QUERY)
          }}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </Container>
  )
}
