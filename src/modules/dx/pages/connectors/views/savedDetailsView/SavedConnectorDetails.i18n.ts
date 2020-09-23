export default {
  connectorName: 'Kubernetes Connector Name',
  description: 'Description',
  identifier: 'Identifier',
  tags: 'Tags',

  delegate: 'Delegate',

  NAME_LABEL: {
    Kubernetes: 'Kubernetes Connector Name',
    GIT: 'GIT Connector Name',
    Docker: 'Docker Connector Name',
    SecretManager: 'Secret Manager Name',
    AppDynamics: 'AppDynamics Connector Name',
    Splunk: ' Splunk Connector Name'
  },
  k8sCluster: {
    connectionMode: 'Connection Mode',
    delegateName: 'Delegate Name',
    delegateInCluster: 'Harness Delegate running In-Cluster',
    delegateOutCluster: 'Harness Delegate running Out-of-Cluster',
    credType: 'Credential Type',
    masterUrl: 'Master URL',
    username: 'Username',
    password: 'Password',
    serviceAccountToken: 'Service Account Token',
    identityProviderUrl: 'Identity Provider URL',
    oidcClientId: 'Client ID',
    clientSecret: 'Client Secret ',
    oidcScopes: 'OIDC Scopes',
    clientKey: 'Client Key',
    clientKeyPassphrase: 'Client Key Passphrase',
    clientCert: 'Client Certificate',
    clientAlgo: 'Client Key Algorithm',
    caCert: 'CA Certificate',
    encrypted: 'encrypted'
  },
  GIT: {
    configure: 'Configured',
    connection: 'Connection Type',
    url: 'URL',
    username: 'Username',
    password: 'Password',
    sshKey: 'SSH Encrypted Key',
    branchName: 'Branch Name',
    HTTP: 'HTTP',
    SSH: 'SSH'
  },
  Docker: {
    dockerRegistryURL: 'Docker Registry URL',
    username: 'Username',
    password: 'Password'
  }
}
