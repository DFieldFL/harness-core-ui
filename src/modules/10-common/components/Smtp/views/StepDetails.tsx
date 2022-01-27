/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Text,
  StepProps,
  FormikForm,
  Formik,
  Container,
  Layout,
  FormInput,
  FontVariation,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Color,
  getErrorInfoFromErrorObject,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { NgSmtpDTO, SmtpConfigDTO, useValidateName } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema } from '@common/utils/Validation'
import type { CreateSmtpWizardProps, SmtpSharedObj } from '../CreateSmtpWizard'
import css from '../useCreateSmtpModal.module.scss'

export interface DetailsForm extends Omit<SmtpConfigDTO, 'port'> {
  name?: string
  port?: number
}
export interface SmtpModalHeaderProps {
  errorHandler: React.Dispatch<React.SetStateAction<ModalErrorHandlerBinding | undefined>>
  mainHeading: string
  subHeading: string
}
export const SmtpModalHeader: React.FC<SmtpModalHeaderProps> = ({ errorHandler, mainHeading, subHeading }) => {
  return (
    <>
      <ModalErrorHandler bind={errorHandler} />
      <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.H3 }}>
        {mainHeading}
      </Text>

      <Text margin={{ bottom: 'xlarge' }} color={Color.BLACK} font={{ variation: FontVariation.SMALL }}>
        {subHeading}
      </Text>
    </>
  )
}
const StepSmtpDetails: React.FC<StepProps<NgSmtpDTO> & SmtpSharedObj & CreateSmtpWizardProps> = ({
  prevStepData,
  nextStep,
  detailsData
}) => {
  const { getString } = useStrings()

  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const { accountId } = useParams<ProjectPathProps>()
  const { loading, mutate: validateName } = useValidateName({ queryParams: { accountId, name: '' } })
  return (
    <Formik<DetailsForm>
      onSubmit={values => {
        const name = values.name || ''
        const port = values.port || 0
        const valuesExcludeName = { ...values, port }
        delete valuesExcludeName.name
        validateName(undefined, { queryParams: { accountId, name }, headers: { 'content-type': 'application/json' } })
          .then(val => {
            if (val.status === 'SUCCESS') {
              nextStep?.({ name: name, value: valuesExcludeName })
            } else {
              modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(val))
            }
          })
          .catch(err => {
            modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(err))
          })
      }}
      formName="smtpStepDetailsForm"
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        host: Yup.string().trim().required(getString('validation.hostRequired')),
        port: Yup.number()
          .moreThan(-1, getString('common.smtp.portPositive'))
          .required(getString('common.smtp.portRequired')),
        fromAddress: Yup.string().nullable().email(getString('common.validation.email.format'))
      })}
      initialValues={{
        name: prevStepData?.name || detailsData?.name || '',
        host: '',
        port: undefined,
        useSSL: false,
        startTLS: false,
        fromAddress: '',
        ...(prevStepData ? prevStepData.value : detailsData?.value)
      }}
    >
      {() => {
        return (
          <Container padding="small" height={570}>
            <SmtpModalHeader
              errorHandler={setModalErrorHandler}
              mainHeading={getString('details')}
              subHeading={getString('common.smtp.modalSubHeading')}
            />

            <Container className={css.smtpMdlContainer}>
              <FormikForm>
                <FormInput.Text name="name" label={getString('name')}></FormInput.Text>
                <FormInput.Text name="host" label={getString('pipelineSteps.hostLabel')}></FormInput.Text>
                <FormInput.Text name="port" label={getString('common.smtp.port')}></FormInput.Text>
                <FormInput.CheckBox name="useSSL" label={getString('common.smtp.enableSSL')}></FormInput.CheckBox>
                <FormInput.CheckBox name="startTLS" label={getString('common.smtp.startTSL')}></FormInput.CheckBox>
                <FormInput.Text name="fromAddress" label={getString('common.smtp.fromAddress')}></FormInput.Text>
                <Layout.Horizontal className={css.buttonPanel}>
                  <Button
                    type="submit"
                    disabled={loading}
                    variation={ButtonVariation.PRIMARY}
                    text={getString('continue')}
                  />
                </Layout.Horizontal>
              </FormikForm>
            </Container>
          </Container>
        )
      }}
    </Formik>
  )
}

export default StepSmtpDetails
