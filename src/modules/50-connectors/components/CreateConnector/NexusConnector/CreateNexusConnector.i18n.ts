export default {
  type: 'NexusRegistry',
  STEP_ONE: {
    NAME: 'CONNECTOR DETAILS'
  },
  STEP_TWO: {
    NAME: 'AUTHENTICATION',
    Heading: 'Authentication',
    SAVE_CREDENTIALS_AND_CONTINUE: 'SAVE CREDENTIALS AND CONTINUE',
    BACK: 'BACK',
    NexusServerURL: 'Nexus URL *',
    NexusVersion: 'Version *',
    Username: 'Username',
    Password: 'Password',
    validation: {
      nexusServerURL: 'Nexus URL is required',
      nexusVersion: 'Version is required',
      password: 'Password is required'
    }
  },
  STEP_THREE: {
    NAME: 'VERIFY CONNECTION'
  }
}
