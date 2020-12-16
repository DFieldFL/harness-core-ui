export enum StepType {
  HTTP = 'Http',
  SHELLSCRIPT = 'ShellScript',
  APPROVAL = 'Approval',
  K8sRollingRollback = 'K8sRollingRollback',
  K8sBlueGreenDeploy = 'K8sBlueGreenDeploy',
  StepGroup = 'StepGroup',
  KubernetesInfraSpec = 'KubernetesInfraSpec',
  K8sServiceSpec = 'K8sServiceSpec',
  K8sRollingDeploy = 'K8sRollingDeploy',
  CustomVariable = 'Custom_Variable',
  Dependency = 'dependency',
  Plugin = 'plugin',
  Run = 'run',
  GCR = 'buildAndPushGCR',
  ECR = 'buildAndPushECR',
  SaveCacheGCS = 'saveCacheGCS',
  RestoreCacheGCS = 'restoreCacheGCS',
  SaveCacheS3 = 'saveCacheS3',
  RestoreCacheS3 = 'restoreCacheS3',
  DockerHub = 'buildAndPushDockerHub',
  GCS = 'uploadToGCS',
  S3 = 'uploadToS3',
  JFrogArtifactory = 'uploadToArtifactory'
}
