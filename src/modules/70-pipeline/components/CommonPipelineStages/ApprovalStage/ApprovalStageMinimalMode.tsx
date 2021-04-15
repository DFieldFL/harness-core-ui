import React from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { Button, Container, FormikForm, FormInput, Heading, Text } from '@wings-software/uicore'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useStrings } from 'framework/exports'
import type { StageElementWrapper } from 'services/cd-ng'
import { Description } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import type { ApprovalStageMinimalModeProps, ApprovalStageMinimalValues } from './types'
import { ApprovalTypeCards, approvalTypeCardsData } from './ApprovalTypeCards'

import css from './ApprovalStageMinimalMode.module.scss'

const getInitialValues = (data?: StageElementWrapper): ApprovalStageMinimalValues => ({
  identifier: data?.stage.identifier,
  name: data?.stage.name,
  description: data?.stage.description,
  approvalType: data?.stage.spec?.approvalType || approvalTypeCardsData[0].value
})

export const ApprovalStageMinimalMode: React.FC<ApprovalStageMinimalModeProps> = props => {
  const { getString } = useStrings()
  const { onChange, onSubmit, data } = props

  const {
    state: { pipeline }
  } = React.useContext(PipelineContext)

  const handleValidate = (values: ApprovalStageMinimalValues): Record<string, string | undefined> | undefined => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: ApprovalStageMinimalValues): void => {
    if (data) {
      data.stage.identifier = values.identifier
      data.stage.name = values.name
      data.stage.description = values.description
      data.stage.approvalType = values.approvalType
      onSubmit?.(data, values.identifier)
    }
  }

  return (
    <Container padding="medium" className={css.approvalStageMinimalWrapper}>
      <Formik
        enableReinitialize
        initialValues={getInitialValues(data)}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('approvalStage.stageNameRequired')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .required(getString('validation.identifierRequired'))
              .matches(regexIdentifier, getString('validation.validIdRegex'))
              .notOneOf(illegalIdentifiers)
          })
        })}
        validate={handleValidate}
        onSubmit={(values: ApprovalStageMinimalValues) => handleSubmit(values)}
      >
        {formikProps => (
          <FormikForm>
            <Text
              font={{ size: 'medium', weight: 'semi-bold' }}
              icon="deployment-success-legacy"
              iconProps={{ size: 16 }}
              margin={{ bottom: 'medium' }}
            >
              {getString('pipelineSteps.build.create.aboutYourStage')}
            </Text>
            <FormInput.InputWithIdentifier inputLabel={getString('stageNameLabel')} />
            <Description />
            <Heading font={{ weight: 'semi-bold' }} level={3}>
              {getString('approvalStage.approvalTypeHeading')}
            </Heading>
            <ApprovalTypeCards formikProps={formikProps} />
            <Button
              type="submit"
              intent="primary"
              text={getString('pipelineSteps.build.create.setupStage')}
              onClick={() => formikProps.submitForm()}
              margin={{ top: 'small' }}
            />
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}
