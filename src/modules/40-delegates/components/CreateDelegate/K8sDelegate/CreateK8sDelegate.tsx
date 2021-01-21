import React from 'react'
import { WizardWithProgress } from '@common/components/WizardWithProgress/WizardWithProgress'
import { Status } from '@common/components/WizardWithProgress/WizardHelper'
import { Delegates } from '@delegates/constants'
import { GetDelegateTitleTextByType } from '@delegates/pages/delegates/utils/DelegateHelper'
import { useStrings } from 'framework/exports'
import type { DelegateInfoDTO } from '@delegates/DelegateInterface'
import DelegateDetailsStep from '../commonSteps/DelegateDetailsStep'
import Stepk8ReviewScript from './StepReviewScript/Stepk8sReviewScript'
import StepSuccessVerification from './StepSuccessVerification/StepSuccessVerifcation'
import css from './CreateK8sDelegate.module.scss'

interface CreateK8sDelegateProps {
  delegateInfo?: DelegateInfoDTO | void
}

const CreateK8sDelegate: React.FC<CreateK8sDelegateProps> = () => {
  const { getString } = useStrings()
  const [showWizard, setShowWizard] = React.useState(false)
  const panels = [
    {
      tabTitle: 'Delegate Setup',
      id: 'delegateSetup',
      status: Status.COMPLETED
    },
    { tabTitle: 'Review Script', id: 'reviewScript', status: Status.INPROGRESS },
    {
      tabTitle: 'Verification ',
      id: 'verifications',
      status: 'TODO'
    }
  ]

  return (
    <>
      {!showWizard && (
        <DelegateDetailsStep
          type={Delegates.KUBERNETES_CLUSTER}
          name={getString('delegate.stepOneWizard')}
          onClick={() => {
            setShowWizard(true)
          }}
        />
      )}
      {showWizard && (
        <WizardWithProgress
          title={GetDelegateTitleTextByType(Delegates.KUBERNETES_CLUSTER)}
          isNavMode={false}
          className={css.stepWizard}
          panels={panels}
        >
          <Stepk8ReviewScript
            onBack={() => {
              setShowWizard(false)
            }}
          />

          <StepSuccessVerification />
        </WizardWithProgress>
      )}
    </>
  )
}

export default CreateK8sDelegate
