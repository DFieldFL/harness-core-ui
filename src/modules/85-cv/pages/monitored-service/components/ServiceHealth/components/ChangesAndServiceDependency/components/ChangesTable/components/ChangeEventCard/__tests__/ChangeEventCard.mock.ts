export const payload = {
  metaData: {},
  resource: {
    id: 'rZc13AsoT1CZigLguBXZaw',
    accountId: 'kmpySmUISimoRrJL6NL73w',
    orgIdentifier: 'CVNG',
    projectIdentifier: 'DemoDataProject',
    serviceIdentifier: 'service1',
    serviceName: 'service1',
    envIdentifier: 'prod',
    environmentName: 'prod',
    name: 'A little bump in the road',
    changeSourceIdentifier: 'pagerduty',
    eventTime: 1601664322169,
    metadata: {
      eventId: 'PGR0VU2',
      pagerDutyUrl: 'https://api.pagerduty.com/incidents/PGR0VU2',
      title: 'A little bump in the road',
      status: 'triggered',
      triggeredAt: 1601664322.169,
      urgency: 'high',
      htmlUrl: 'https://acme.pagerduty.com/incidents/PGR0VU2',
      priority: 'P2',
      assignment: null,
      assignmentUrl: null,
      escalationPolicy: 'Default',
      escalationPolicyUrl: 'https://acme.pagerduty.com/escalation_policies/PUS0KTE'
    },
    category: 'Alert',
    type: 'PagerDuty'
  },
  responseMessages: []
}

export const HarnessCDMockData = {
  metaData: {},
  resource: {
    id: 'FHj1QjXMTNySJF2mz4d5Bw',
    accountId: 'kmpySmUISimoRrJL6NL73w',
    orgIdentifier: 'default',
    projectIdentifier: 'DevProject',
    serviceIdentifier: 'service1',
    serviceName: 'service1',
    envIdentifier: 'env1',
    environmentName: 'env1',
    name: 'CD Nextgen - service1 - test',
    changeSourceIdentifier: 'cdNg',
    eventTime: 1633853633448,
    metadata: {
      deploymentStartTime: 1633853330350,
      deploymentEndTime: 1633853633448,
      planExecutionId: 'ZW6KNATYQYmn1MdScWBmbQ',
      pipelineId: 'DemoData',
      stageStepId: 'YIya827mTBSol-5ItBhCVA',
      stageId: 'Demo',
      artifactType: null,
      artifactTag: null,
      status: 'ABORTED',
      verifyStepSummaries: [
        {
          name: 'verify_prod',
          verificationStatus: 'VERIFICATION_PASSED'
        },
        {
          name: 'verify_dev',
          verificationStatus: 'VERIFICATION_FAILED'
        }
      ],
      pipelinePath:
        '/account/kmpySmUISimoRrJL6NL73w/cd/orgs/default/projects/DevProject/pipelines/DemoData/executions/ZW6KNATYQYmn1MdScWBmbQ/pipeline?stage=YIya827mTBSol-5ItBhCVA'
    },
    category: 'Deployment' as any,
    type: 'HarnessCDNextGen' as any
  },
  responseMessages: []
}
