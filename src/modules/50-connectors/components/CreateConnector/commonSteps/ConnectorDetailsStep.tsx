import React, { useRef, useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  FormikForm,
  Container
} from '@wings-software/uikit'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import { pick } from 'lodash-es'
import { StringUtils } from '@common/exports'
import {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ResponseBoolean,
  validateTheIdentifierIsUniquePromise,
  Failure
} from 'services/cd-ng'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { String } from 'framework/exports'
import { getHeadingByType } from '../../../pages/connectors/utils/ConnectorHelper'
import i18n from './ConnectorDetailsStep.i18n'
import css from './ConnectorDetailsStep.module.scss'
export type DetailsForm = Pick<ConnectorInfoDTO, 'name' | 'identifier' | 'description' | 'tags'>

interface ConnectorDetailsStepProps extends StepProps<ConnectorInfoDTO> {
  type: ConnectorInfoDTO['type']
  name: string
  setFormData?: (formData: ConnectorConfigDTO) => void
  formData?: ConnectorConfigDTO
  isEditMode?: boolean
  connectorInfo?: ConnectorInfoDTO | void
  mock?: ResponseBoolean
}

const ConnectorDetailsStep: React.FC<StepProps<ConnectorConfigDTO> & ConnectorDetailsStepProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const mounted = useRef(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [, setLoading] = useState(false)
  const isEdit = props.isEditMode || prevStepData?.isEdit

  const handleSubmit = async (formData: ConnectorConfigDTO): Promise<void> => {
    mounted.current = true
    if (isEdit) {
      //In edit mode validateTheIdentifierIsUnique API not required
      props.setFormData?.(formData)
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
    } else {
      setLoading(true)
      try {
        const response = await validateTheIdentifierIsUniquePromise({
          queryParams: {
            identifier: formData.identifier,
            accountIdentifier: accountId,
            orgIdentifier: orgIdentifier,
            projectIdentifier: projectIdentifier
          },
          mock: props.mock
        })
        setLoading(false)

        if ('SUCCESS' === response.status) {
          if (response.data) {
            props.setFormData?.(formData)
            nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData })
          } else {
            modalErrorHandler?.showDanger(i18n.validateError)
          }
        } else {
          throw response as Failure
        }
      } catch (error) {
        setLoading(false)
        modalErrorHandler?.showDanger(error.message)
      }
    }
  }

  const getInitialValues = () => {
    if (isEdit) {
      return { ...pick(props.connectorInfo, ['name', 'identifier', 'description', 'tags']) }
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {}
      }
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep}>
      <div className={css.heading}>{getHeadingByType(props.type)}</div>
      <ModalErrorHandler bind={setModalErrorHandler} />

      <Container padding="small" className={css.connectorForm}>
        <Formik<DetailsForm>
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(i18n.validation.name),
            identifier: Yup.string().when('name', {
              is: val => val?.length,
              then: Yup.string()
                .trim()
                .required(i18n.validation.identifier)
                .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, i18n.validIdRegex)
                .notOneOf(StringUtils.illegalIdentifiers)
            })
          })}
          initialValues={{
            ...(getInitialValues() as DetailsForm),
            ...prevStepData,
            ...props.formData
          }}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Container style={{ minHeight: 460 }}>
                  <AddDescriptionAndKVTagsWithIdentifier
                    formikProps={formikProps}
                    identifierProps={{ inputName: 'name', isIdentifierEditable: !isEdit }}
                  />
                </Container>
                <Layout.Horizontal>
                  <Button type="submit" intent="primary">
                    <String stringID="saveAndContinue" />
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default ConnectorDetailsStep
