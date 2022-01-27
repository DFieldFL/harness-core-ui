/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikActions } from 'formik'
import set from 'lodash-es/set'
import {
  Layout,
  Formik,
  Button,
  FormikForm,
  Container,
  StepProps,
  SelectOption,
  FormInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { validateDockerDelegatePromise, useGetDelegateTokens } from 'services/portal'
import type { DelegateTokenDetails } from 'services/portal'

import { useStrings } from 'framework/strings'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { useCreateTokenModal } from '@delegates/components/DelegateTokens/modals/useCreateTokenModal'

import type { DockerDelegateWizardData } from '../CreateDockerDelegate'
import css from './Step1Setup.module.scss'

interface DelegateSetupStepProps {
  onBack?: any
}

//this regex is retrieved from kubernetes
const delegateNameRegex = /^[a-z]([-a-z0-9]*[a-z])?(\.[a-z0-9]([-a-z0-9]*[a-z])?)*$/g

const formatTokenOptions = (data: any): Array<SelectOption> => {
  const tokens: Array<DelegateTokenDetails> = data?.resource

  return tokens
    ? tokens.map((item: DelegateTokenDetails) => {
        return { label: item.name || '', value: item.name || '' }
      })
    : []
}

const Step1Setup: React.FC<StepProps<DockerDelegateWizardData> & DelegateSetupStepProps> = props => {
  const { NG_SHOW_DEL_TOKENS } = useFeatureFlags()
  const { prevStepData } = props
  let initialValues
  if (prevStepData) {
    const tags = {}
    prevStepData.tags?.forEach(tag => set(tags, tag, ''))
    initialValues = {
      ...prevStepData,
      tags: tags
    }
  } else {
    initialValues = {
      name: '',
      identifier: '',
      description: '',
      tags: {}
    }
    if (NG_SHOW_DEL_TOKENS) {
      set(initialValues, 'tokenName', '')
    }
  }

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const [formData, setInitValues] = useState<DockerDelegateWizardData>(initialValues as DockerDelegateWizardData)

  const validateName = async (
    values: DockerDelegateWizardData,
    formikActions: FormikActions<DockerDelegateWizardData>
  ) => {
    const response = (await validateDockerDelegatePromise({
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        delegateName: values.name,
        tokenName: NG_SHOW_DEL_TOKENS ? values.tokenName : undefined
      }
    })) as any
    const isNameUnique = !response?.responseMessages[0]

    if (isNameUnique) {
      const stepPrevData = {
        name: values.name,
        identifier: values.identifier,
        description: values.description,
        tokenName: NG_SHOW_DEL_TOKENS ? values.tokenName : undefined
      }
      const tagsArray = Object.keys(values.tags || {})
      set(stepPrevData, 'tags', tagsArray)
      props?.nextStep?.(stepPrevData)
    } else {
      formikActions.setFieldError('name', getString('delegates.delegateNameNotUnique'))
    }
  }

  const { data: tokensResponse, refetch: getTokens } = useGetDelegateTokens({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      status: 'ACTIVE'
    }
  })
  const defaultToken = tokensResponse?.resource?.[0]

  const { openCreateTokenModal } = useCreateTokenModal({ onSuccess: getTokens })

  React.useEffect(() => {
    if (NG_SHOW_DEL_TOKENS && defaultToken) {
      formData.tokenName = defaultToken?.name
      setInitValues({ ...formData })
    }
  }, [defaultToken])

  const onSubmit = (values: DockerDelegateWizardData, formikActions: FormikActions<DockerDelegateWizardData>) => {
    setInitValues(values)
    validateName(values, formikActions)
  }

  const delegateTokenOptions = useMemo(() => formatTokenOptions(tokensResponse), [tokensResponse])

  return (
    <Layout.Vertical padding="xxlarge">
      <Container padding="small">
        <Formik
          initialValues={formData}
          onSubmit={onSubmit}
          formName="delegateSetupStepForm"
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('delegate.delegateNameRequired'))
              .matches(delegateNameRegex, getString('delegates.delegateNameRegexIssue')),
            tokenName: NG_SHOW_DEL_TOKENS
              ? Yup.string().required(getString('delegates.tokens.tokenRequired'))
              : Yup.string()
          })}
        >
          {() => {
            return (
              <FormikForm>
                <Container className={css.delegateForm}>
                  <Layout.Horizontal className={css.baseContainer}>
                    <Layout.Vertical className={css.leftPanel}>
                      <div className={css.formGroup}>
                        <AddDescriptionAndKVTagsWithIdentifier
                          forceOpenTags
                          identifierProps={{
                            inputLabel: getString('delegate.delegateName')
                          }}
                        />
                      </div>
                      {NG_SHOW_DEL_TOKENS && (
                        <Layout.Horizontal className={css.tokensSelectContainer} spacing="small">
                          <FormInput.Select
                            items={delegateTokenOptions}
                            label={getString('delegates.tokens.delegateTokens')}
                            name="tokenName"
                          />
                          <Button
                            minimal
                            icon="plus"
                            onClick={e => {
                              e.preventDefault()
                              openCreateTokenModal()
                            }}
                            text={getString('add')}
                          />
                        </Layout.Horizontal>
                      )}
                    </Layout.Vertical>
                    <Layout.Vertical className={css.rightPanel} />
                  </Layout.Horizontal>
                </Container>
                <Layout.Horizontal>
                  <Button
                    id="delegateSetupBackBtn"
                    intent="none"
                    text={getString('back')}
                    onClick={props.onBack}
                    icon="chevron-left"
                    margin={{ right: 'small' }}
                  />
                  <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default Step1Setup
