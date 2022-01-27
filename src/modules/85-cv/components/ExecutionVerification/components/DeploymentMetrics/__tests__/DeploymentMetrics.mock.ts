/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RestResponseTransactionMetricInfoSummaryPageDTO } from 'services/cv'

export const transactionMetricInfoSummary: RestResponseTransactionMetricInfoSummaryPageDTO = {
  metaData: {},
  resource: {
    pageResponse: {
      totalPages: 3,
      totalItems: 25,
      pageItemCount: 10,
      pageSize: 10,
      content: [
        {
          transactionMetric: {
            transactionName: 'WebTransaction/WebServletPath/RequestLogin',
            metricName: 'Calls per Minute',
            score: 1.0933333333333335,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 1.0933333333333335,
              controlData: [30.666666666666668, 31.333333333333332, 27, 25.666666666666668, 28],
              testData: [30, 10, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/RequestException',
            metricName: 'Calls per Minute',
            score: 0.8333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.8333333333333334,
              controlData: [48.666666666666664, 48.333333333333336, 49, 49.333333333333336, 47],
              testData: [49, 17, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/default',
            metricName: 'Calls per Minute',
            score: 0.8333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.8333333333333334,
              controlData: [48.333333333333336, 48.666666666666664, 48.666666666666664, 49.666666666666664, 46.5],
              testData: [50, 18, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/JSP/inside/display.jsp',
            metricName: 'Calls per Minute',
            score: 0.3333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.3333333333333334,
              controlData: [54.666666666666664, 43.333333333333336, 48.666666666666664, 46.666666666666664, 43],
              testData: [47, 16, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/Display',
            metricName: 'Calls per Minute',
            score: 0.3333333333333334,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_ANALYSIS',
              score: 0.3333333333333334,
              controlData: [54.666666666666664, 43.333333333333336, 48.666666666666664, 46.666666666666664, 43],
              testData: [47, 16, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/RequestException',
            metricName: 'Apdex',
            score: 0,
            risk: 'HEALTHY'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'HEALTHY',
              score: 0,
              controlData: [0.06666666666666667, 0.06, 0.06666666666666667, 0.06666666666666667, 0.065],
              testData: [0.06, 0.06, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/JSP/index.jsp',
            metricName: 'Apdex',
            score: 0,
            risk: 'NO_ANALYSIS'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'harness-pr-cv-nextgen-prod-deployment-5b5f48c558-s94wf',
              risk: 'NO_ANALYSIS',
              score: 0,
              controlData: [0.3333333333333333, 0, 0, 0, 0],
              testData: [-1, 1, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/JSP/inside/display.jsp',
            metricName: 'Apdex',
            score: 0,
            risk: 'HEALTHY'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'HEALTHY',
              score: 0,
              controlData: [1, 1, 1, 1, 1],
              testData: [1, 1, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Custom/load test/107',
            metricName: 'Apdex',
            score: 0,
            risk: 'NO_DATA'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'NO_DATA',
              score: 0,
              controlData: null as any,
              testData: [0, -1, -1, -1, -1],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'WebTransaction/Servlet/default',
            metricName: 'Apdex',
            score: 0,
            risk: 'HEALTHY'
          },
          connectorName: 'new relic',
          dataSourceType: 'NEW_RELIC',
          nodes: [
            {
              hostName: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
              risk: 'HEALTHY',
              score: 0,
              controlData: [0.6666666666666666, 0.5, 0.5, 0.5, 0.5],
              testData: [1, 1, -1, -1, -1],
              anomalous: false
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    },
    deploymentTimeRange: { startTime: '2021-11-02 16:01:00' as any, endTime: '2021-11-02 16:16:00' as any },
    deploymentStartTime: 1635868860000,
    deploymentEndTime: 1635869760000
  },
  responseMessages: []
}

export const transformMetricsExpectedResult = [
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 30.666666666666668 },
        { x: 1635869760000, y: 31.333333333333332 },
        { x: 1635870660000, y: 27 },
        { x: 1635871560000, y: 25.666666666666668 },
        { x: 1635872460000, y: 28 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Calls per Minute',
    nodeRiskCount: undefined,
    risk: 'NO_ANALYSIS',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 30 },
          { x: 1635869760000, y: 10 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    transactionName: 'WebTransaction/WebServletPath/RequestLogin'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 48.666666666666664 },
        { x: 1635869760000, y: 48.333333333333336 },
        { x: 1635870660000, y: 49 },
        { x: 1635871560000, y: 49.333333333333336 },
        { x: 1635872460000, y: 47 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Calls per Minute',
    nodeRiskCount: undefined,
    risk: 'NO_ANALYSIS',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 49 },
          { x: 1635869760000, y: 17 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    transactionName: 'WebTransaction/Servlet/RequestException'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 48.333333333333336 },
        { x: 1635869760000, y: 48.666666666666664 },
        { x: 1635870660000, y: 48.666666666666664 },
        { x: 1635871560000, y: 49.666666666666664 },
        { x: 1635872460000, y: 46.5 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Calls per Minute',
    nodeRiskCount: undefined,
    risk: 'NO_ANALYSIS',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 50 },
          { x: 1635869760000, y: 18 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    transactionName: 'WebTransaction/Servlet/default'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 54.666666666666664 },
        { x: 1635869760000, y: 43.333333333333336 },
        { x: 1635870660000, y: 48.666666666666664 },
        { x: 1635871560000, y: 46.666666666666664 },
        { x: 1635872460000, y: 43 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Calls per Minute',
    nodeRiskCount: undefined,
    risk: 'NO_ANALYSIS',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 47 },
          { x: 1635869760000, y: 16 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    transactionName: 'WebTransaction/JSP/inside/display.jsp'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 54.666666666666664 },
        { x: 1635869760000, y: 43.333333333333336 },
        { x: 1635870660000, y: 48.666666666666664 },
        { x: 1635871560000, y: 46.666666666666664 },
        { x: 1635872460000, y: 43 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Calls per Minute',
    nodeRiskCount: undefined,
    risk: 'NO_ANALYSIS',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 47 },
          { x: 1635869760000, y: 16 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    transactionName: 'WebTransaction/Servlet/Display'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 0.06666666666666667 },
        { x: 1635869760000, y: 0.06 },
        { x: 1635870660000, y: 0.06666666666666667 },
        { x: 1635871560000, y: 0.06666666666666667 },
        { x: 1635872460000, y: 0.065 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Apdex',
    nodeRiskCount: undefined,
    risk: 'HEALTHY',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 0.06 },
          { x: 1635869760000, y: 0.06 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'HEALTHY'
      }
    ],
    transactionName: 'WebTransaction/Servlet/RequestException'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 0.3333333333333333 },
        { x: 1635869760000, y: 0 },
        { x: 1635870660000, y: 0 },
        { x: 1635871560000, y: 0 },
        { x: 1635872460000, y: 0 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Apdex',
    nodeRiskCount: undefined,
    risk: 'NO_ANALYSIS',
    testData: [
      {
        name: 'harness-pr-cv-nextgen-prod-deployment-5b5f48c558-s94wf',
        points: [
          { x: 1635868860000, y: null },
          { x: 1635869760000, y: 1 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_ANALYSIS'
      }
    ],
    transactionName: 'WebTransaction/JSP/index.jsp'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 1 },
        { x: 1635869760000, y: 1 },
        { x: 1635870660000, y: 1 },
        { x: 1635871560000, y: 1 },
        { x: 1635872460000, y: 1 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Apdex',
    nodeRiskCount: undefined,
    risk: 'HEALTHY',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 1 },
          { x: 1635869760000, y: 1 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'HEALTHY'
      }
    ],
    transactionName: 'WebTransaction/JSP/inside/display.jsp'
  },
  {
    connectorName: 'new relic',
    controlData: [[]],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Apdex',
    nodeRiskCount: undefined,
    risk: 'NO_DATA',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 0 },
          { x: 1635869760000, y: null },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'NO_DATA'
      }
    ],
    transactionName: 'WebTransaction/Custom/load test/107'
  },
  {
    connectorName: 'new relic',
    controlData: [
      [
        { x: 1635868860000, y: 0.6666666666666666 },
        { x: 1635869760000, y: 0.5 },
        { x: 1635870660000, y: 0.5 },
        { x: 1635871560000, y: 0.5 },
        { x: 1635872460000, y: 0.5 }
      ]
    ],
    healthSourceType: 'NEW_RELIC',
    metricName: 'Apdex',
    nodeRiskCount: undefined,
    risk: 'HEALTHY',
    testData: [
      {
        name: 'dummypipeline-nr-deployment-canary-fdf55df6-z27gv',
        points: [
          { x: 1635868860000, y: 1 },
          { x: 1635869760000, y: 1 },
          { x: 1635870660000, y: null },
          { x: 1635871560000, y: null },
          { x: 1635872460000, y: null }
        ],
        risk: 'HEALTHY'
      }
    ],
    transactionName: 'WebTransaction/Servlet/default'
  }
]

export const transactionNameMock = {
  resource: ['A', 'B']
}

export const verifyStepNodeNameMock = {
  resource: ['V', 'W']
}
