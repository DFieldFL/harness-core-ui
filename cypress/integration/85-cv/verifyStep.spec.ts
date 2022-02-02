const pipelineListAPI =
  '/pipeline/api/pipelines/list?routingId=*&accountIdentifier=*&projectIdentifier=*&module=cd&orgIdentifier=*&searchTerm=&page=0&sort=lastUpdatedAt%2CDESC&size=20'
const pipelineSummaryAPI =
  '/pipeline/api/pipelines/summary/appdtest?routingId=*&accountIdentifier=*&orgIdentifier=*&projectIdentifier=*'
const pipelineDetailsAPI = '/pipeline/api/pipelines/appdtest?accountIdentifier=*&orgIdentifier=*&projectIdentifier=*'
const pipelineExecutionSummaryAPI =
  '/pipeline/api/pipelines/execution/summary?routingId=*&accountIdentifier=*&projectIdentifier=*&orgIdentifier=*&module=cd&size=20&pipelineIdentifier=*&page=0&myDeployments=false'
const pipelineExecutionAPI =
  '/pipeline/api/pipelines/execution/C9mgNjxSS7-B-qQek27iuA?routingId=*&orgIdentifier=*&projectIdentifier=*&accountIdentifier=*'
const pipelineExecutionForNodeAPI =
  '/pipeline/api/pipelines/execution/C9mgNjxSS7-B-qQek27iuA?routingId=*&orgIdentifier=*&projectIdentifier=*&accountIdentifier=*&stageNodeId=g_LkakmWRPm-wC6rfC2ufg'
const deploymentActivitySummaryAPI =
  'cv/api/activity/GZNwefkdR2aBhc7owmJ1-w/deployment-activity-summary?routingId=*&accountId=*'
const deploymentTimeseriesDataAPI =
  '/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=*&accountId=*&anomalousMetricsOnly=*&anomalousNodesOnly=*&pageNumber=0&pageSize=10'
const deploymentTimeseriesDataWithNodeFilterAPI =
  '/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=*&accountId=*&anomalousMetricsOnly=*&anomalousNodesOnly=*&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10'
const healthSourceAPI = 'cv/api/activity/GZNwefkdR2aBhc7owmJ1-w/healthSources?routingId=*&accountId=*'
const nodeNamesFilterAPI = 'cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-node-names?routingId=*&accountId=*'
const transactionsFilterAPI = 'cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-transaction-names?routingId=*&accountId=*'

describe('Verify step', () => {
  beforeEach(() => {
    cy.intercept('POST', pipelineListAPI, { fixture: '/pipeline/api/pipelines/getPipelineList' }).as('pipelineList')
    cy.intercept('GET', pipelineSummaryAPI, { fixture: '/pipeline/api/pipelines/pipelineSummary' }).as(
      'pipelineSummary'
    )
    cy.intercept('GET', pipelineDetailsAPI, { fixture: '/pipeline/api/pipelines/getPipelineDetails' }).as(
      'pipelineDetails'
    )
    cy.intercept('POST', pipelineExecutionSummaryAPI, { fixture: '/pipeline/api/pipelines/getExecutionSummary' }).as(
      'pipelineExecutionSumary'
    )
    cy.intercept('GET', pipelineExecutionAPI, { fixture: '/pipeline/api/pipelines/getExecutionDetails' }).as(
      'pipelineExecution'
    )
    cy.intercept('GET', pipelineExecutionForNodeAPI, { fixture: '/pipeline/api/pipelines/getNodeExecutionDetails' }).as(
      'pipelineExecutionForNode'
    )
    cy.intercept('GET', deploymentActivitySummaryAPI, { fixture: '/cv/verifyStep/getDeploymentActivitySummary' }).as(
      'deployment-activity-summary'
    )
    cy.intercept('GET', deploymentTimeseriesDataAPI, { fixture: '/cv/verifyStep/getDeploymentTimeseriesData' }).as(
      'deploymentTimeseriesData'
    )
    cy.intercept('GET', healthSourceAPI, { fixture: '/cv/verifyStep/getHealthSourceFilters' }).as('healthSource')
    cy.intercept('GET', nodeNamesFilterAPI, { fixture: '/cv/verifyStep/getNodeNameFilters' }).as('nodeNames')
    cy.intercept('GET', transactionsFilterAPI, { fixture: '/cv/verifyStep/getTransactionNameFilters' }).as(
      'transactions'
    )
    cy.intercept('GET', deploymentTimeseriesDataWithNodeFilterAPI, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithNodeFilter')
    cy.on('uncaught:exception', () => false)
    cy.login('test', 'test')
    cy.contains('p', 'Projects').click()
    cy.contains('p', 'Project 1').click()
    cy.contains('p', 'Delivery').click()
    cy.contains('p', 'Pipelines').click()
  })

  it('should test verify step features', () => {
    cy.wait(1000)

    cy.findByText('appd-test').click()

    cy.wait(1000)
    cy.findByRole('link', { name: /Execution History/i }).click()
    cy.wait(1000)
    cy.findByText(/(Execution Id: 5)/i).click()
    cy.findByText(/appd_dev/i).click()
    cy.findByTestId(/Metrics/i).click()
    cy.findByTestId(/anomalousFilterCheckbox/i).should('be.checked')

    // on clicking expand all, it should expand all accordions
    cy.get('[data-open="false"]').should('have.length', 3)
    cy.get('[data-open="true"]').should('have.length', 0)
    cy.findByRole('button', { name: /Expand All/i }).click()
    cy.get('[data-open="false"]').should('have.length', 0)
    cy.get('[data-open="true"]').should('have.length', 3)
    cy.findByRole('button', { name: /Collapse All/i }).click()

    // load more should be visible, if we have more than 6 nodes present
    cy.findByTestId('/todolist/exception-Average Response Time (ms)-APP_DYNAMICS-panel').click()
    cy.findByTestId('loadMore_button').should('be.visible')
    cy.get('.highcharts-container ').should('have.length', 6)

    // if all the graphs are loaded, Load more button must be hidden
    cy.findByTestId('loadMore_button').click()
    cy.wait(1000)
    cy.get('.highcharts-container').should('have.length', 10)
    cy.findByTestId('loadMore_button').should('not.exist')

    // By clicking on the node graph, it should apply the same filter in nodes dropdown
    cy.findByTestId(/canaryNode-0/).click()
    cy.findByTestId(/node_name_filter/i).click()
    cy.findByRole('checkbox', { name: 'harness-deployment-canary-7445f86dbf-ml857' }).should('be.checked')
    cy.findByTestId(/canaryNode-0/).click()
    cy.findByText(/Nodes: All/i).should('be.visible')

    // if we come via Console view log, the anomalous filters checkbox must be unchecked
    cy.get('.bp3-switch').click()
    // clicking again to go to verify step page
    cy.get('.bp3-switch').click()
    cy.findByTestId(/anomalousFilterCheckbox/i).should('not.be.checked')

    // if we don't have any data for the applied filter, "No matching data." text must be shown
    cy.findByTestId(/node_name_filter/i).click()
    cy.findByText('harness-deployment-canary-7445f86dbf-ml857').click({ force: true })
    cy.wait(1000)
    cy.findByText(/No matching data./i).should('be.visible')
  })

  it('should show retry button when API fails', () => {
    // mocking API call to fail
    cy.intercept('GET', deploymentTimeseriesDataAPI, {
      statusCode: 500
    }).as('deploymentTimeseriesData')

    // cy.contains('p', 'Pipelines').click()
    cy.wait(1000)

    cy.findByText('appd-test').click()

    cy.wait(1000)
    cy.findByRole('link', { name: /Execution History/i }).click()
    cy.wait(1000)
    cy.findByText(/(Execution Id: 5)/i).click()
    cy.findByText(/appd_dev/i).click()
    cy.findByTestId(/Metrics/i).click()

    cy.wait('@deploymentTimeseriesData').its('response.statusCode').should('eq', 500)
    cy.wait(1000)
    cy.findByRole('button', { name: /Retry/i }).should('be.visible')
  })
})
