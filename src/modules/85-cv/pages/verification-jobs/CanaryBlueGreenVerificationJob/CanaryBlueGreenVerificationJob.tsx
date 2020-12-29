import React from 'react'
import { Container, Formik, FormikForm, Layout, Text, Color } from '@wings-software/uikit'

import * as Yup from 'yup'

import { useStrings } from 'framework/exports'

import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'

import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { VerificationJobType } from '@cv/constants'
import {
  ServiceName,
  VerificationSensitivity,
  EnvironmentName,
  Duration,
  TrafficSplit
} from '@cv/pages/activity-setup/VerificationJobForms/VerificationJobFields'
import { useVerificationJobFormSubmit } from '@cv/pages/activity-setup/VerificationJobForms/VerificationJobFormCommons'
interface VerificationJobsDetailsProps {
  stepData: any
  onPrevious: () => void
  onNext: (data: any) => void
}
const CanaryBlueGreenVerificationJob: React.FC<VerificationJobsDetailsProps> = props => {
  const { getString } = useStrings()

  const { onSubmit, loading } = useVerificationJobFormSubmit({ onSuccess: props.onNext })
  return (
    <Container style={{ position: 'relative', top: 80 }}>
      <Formik
        initialValues={{ ...props.stepData }}
        validationSchema={Yup.object().shape({
          service: Yup.string().trim().required(getString('validation.nameRequired')),
          environment: Yup.string().required(getString('cv.verificationJobs.validation.environment')),
          duration: Yup.string().required(getString('cv.verificationJobs.validation.duration'))
        })}
        onSubmit={data => {
          onSubmit({ ...props.stepData, ...data })
        }}
      >
        {() => {
          return (
            <FormikForm>
              <Layout.Vertical width="50%" style={{ margin: 'auto' }}>
                <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800} margin={{ bottom: 'small' }}>
                  {getString('cv.verificationJobs.configure.heading')}
                </Text>
                <CVSelectionCard
                  isSelected={true}
                  iconProps={{
                    name: props.stepData?.type === VerificationJobType.CANARY ? 'canary-outline' : 'bluegreen',
                    size: 20
                  }}
                  cardLabel={
                    props.stepData?.type === VerificationJobType.CANARY ? getString('canary') : getString('blueGreen')
                  }
                />
                <Text margin={{ bottom: 'large' }} padding={{ top: 'xlarge' }}>
                  {getString('cv.verificationJobs.configure.prodDepText')}
                </Text>
                <Layout.Horizontal>
                  <Container margin={{ right: 'xlarge' }} width={'300px'}>
                    <ServiceName />
                    <EnvironmentName />
                    <VerificationSensitivity />
                  </Container>
                  <Container width={'300px'}>
                    <Duration />
                    <TrafficSplit />
                  </Container>
                </Layout.Horizontal>

                <SubmitAndPreviousButtons onPreviousClick={props.onPrevious} nextButtonProps={{ loading }} />
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default CanaryBlueGreenVerificationJob
