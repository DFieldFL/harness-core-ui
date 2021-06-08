const baseUrl = 'https://qa.harness.io/gateway'
const targetLocalHost = true // set to false to target baseUrl environment instead of localhost

module.exports = {
  '/ng/api': {
    pathRewrite: { '^/ng/api': '' },
    target: targetLocalHost ? 'https://localhost:7090' : `${baseUrl}/ng/api`
  },
  '/pipeline/api': {
    pathRewrite: { '^/pipeline/api': '/api' },
    target: targetLocalHost ? 'http://localhost:12001' : `${baseUrl}/pipeline`
  },
  '/notifications/api': {
    pathRewrite: { '^/notifications/api': '/api' },
    target: targetLocalHost ? 'http://localhost:9005' : `${baseUrl}/notifications`
  },
  '/resourcegroup/api': {
    pathRewrite: { '^/resourcegroup/api': '/api' },
    target: targetLocalHost ? 'http://localhost:9005' : `${baseUrl}/resourcegroup`
  },
  '/authz/api': {
    pathRewrite: { '^/authz/api': '/api' },
    target: targetLocalHost ? 'http://localhost:9006' : `${baseUrl}/authz`
  },
  '/api': {
    target: targetLocalHost ? 'https://localhost:9090' : baseUrl
  },
  '/cv/api': {
    target: targetLocalHost ? 'https://localhost:6060' : `${baseUrl}`
  },
  '/cf': {
    target: targetLocalHost ? 'http://localhost:3000' : baseUrl,
    pathRewrite: targetLocalHost ? { '^/cf': '/api/1.0' } : {}
  },
  '/ci': {
    target: targetLocalHost ? 'https://localhost:7171' : baseUrl
  },
  '/ti-service': {
    target: targetLocalHost ? 'https://localhost:7457' : baseUrl
  },
  '/log-service': {
    pathRewrite: { ...(targetLocalHost ? { '^/log-service': '' } : {}) },
    target: targetLocalHost ? 'http://localhost:8079' : baseUrl
  },
  '/lw/api': {
    target: targetLocalHost ? 'http://localhost:9090' : `${baseUrl}/lw/api`,
    pathRewrite: { '^/lw/api': '' }
  },
  '/asaasin/api': {
    target: targetLocalHost ? 'http://localhost:8085' : `${baseUrl}/asaasin/api`,
    pathRewrite: { '^/asaasin/api': '' }
  },
  '/dashboard': {
    target: targetLocalHost ? 'http://localhost:5000' : baseUrl
  },
  '/ccm/api': {
    target: targetLocalHost ? 'http://localhost:5000' : baseUrl
  }
}
