import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'

import { HttpStep } from './HttpStep/HttpStep'
import { K8RolloutDeployStep } from './K8sRolloutDeployStep/K8sRolloutDeployStep'
import { ShellScriptStep } from './ShellScriptStep/ShellScriptStep'
import { KubernetesInfraSpec } from './KubernetesInfraSpec/KubernetesInfraSpec'
import { KubernetesServiceSpec } from './K8sServiceSpec/K8sServiceSpec'
import { K8sBlueGreenDeployStep } from './K8sBgStep/K8sBlueGreenDeployStep'
import { K8sCanaryDeployStep } from './K8sCanaryDeploy/K8sCanaryDeployStep'
import { K8sBGSwapServices } from './K8sBGSwapServices/K8sBGSwapServices'
import { K8sScaleStep } from './K8sScale/K8sScaleStep'
import { K8sRollingRollbackStep } from './K8sRollingRollback/K8sRollingRollback'
import { K8sCanaryDeleteStep } from './K8sCanaryDelete/K8sCanaryDeleteStep'
import { K8sApplyStep } from './K8sApply/K8sApplyStep'
import { K8sDeleteStep } from './K8sDelete/K8sDeleteStep'
import { DeployEnvironmentStep } from './DeployEnvStep/DeployEnvStep'
import { DeployServiceStep } from './DeployServiceStep/DeployServiceStep'
import { HelmDeploy } from './HelmDeploy/HelmDeploy'
import { HelmRollback } from './HelmRollback/HelmRollback'
import { TerraformRollback } from './TerraformRollback/TerraformRollback'
import { TerraformDestroy } from './TerraformDestroy/TerraformDestroy'
import { TerraformPlan } from './TerraformPlan/TerraformPlan'

factory.registerStep(new HttpStep())
factory.registerStep(new K8RolloutDeployStep())
factory.registerStep(new K8sRollingRollbackStep())
factory.registerStep(new K8sBlueGreenDeployStep())
factory.registerStep(new K8sCanaryDeployStep())
factory.registerStep(new K8sBGSwapServices())
factory.registerStep(new K8sScaleStep())
factory.registerStep(new K8sCanaryDeleteStep())
factory.registerStep(new K8sApplyStep())
factory.registerStep(new K8sDeleteStep())
factory.registerStep(new ShellScriptStep())
factory.registerStep(new KubernetesInfraSpec())
factory.registerStep(new DeployEnvironmentStep())
factory.registerStep(new DeployServiceStep())
factory.registerStep(new KubernetesServiceSpec())
factory.registerStep(new HelmDeploy())
factory.registerStep(new HelmRollback())
factory.registerStep(new TerraformRollback())
factory.registerStep(new TerraformDestroy())
factory.registerStep(new TerraformPlan())
