/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { RefObject, Dispatch, SetStateAction } from 'react'
import { Layout, Button, ButtonVariation } from '@wings-software/uicore'
import cx from 'classnames'
import type { FormikErrors, FormikProps } from 'formik'
import { parse } from 'yaml'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { setNewTouchedPanel } from './WizardUtils'
import css from './Wizard.module.scss'

interface WizardFooterProps {
  isYamlView: boolean
  selectedTabIndex: number
  onHide: () => void
  submitLabel?: string
  disableSubmit?: boolean
  setValidateOnChange: Dispatch<SetStateAction<boolean>>
  lastTab: boolean
  onYamlSubmit?: (val: any) => void
  yamlObjectKey?: string
  yamlHandler?: YamlBuilderHandlerBinding
  elementsRef: { current: RefObject<HTMLSpanElement>[] }
  showError: (str: string) => void
  yamlBuilderReadOnlyModeProps?: YamlBuilderProps
  formikProps: FormikProps<any>
  setSelectedTabId: Dispatch<SetStateAction<string>>
  setSelectedTabIndex: Dispatch<SetStateAction<number>>
  setTouchedPanels: Dispatch<SetStateAction<number[]>>
  touchedPanels: number[]
  tabsMap: string[]
  loadingYamlView?: boolean
  validate?: (arg?: { latestYaml?: string }) => Promise<FormikErrors<any>> | FormikErrors<any>
  setSubmittedForm: Dispatch<SetStateAction<boolean>>
}

export const WizardFooter = ({
  isYamlView,
  selectedTabIndex,
  onHide,
  submitLabel,
  disableSubmit,
  setValidateOnChange,
  lastTab,
  onYamlSubmit,
  yamlObjectKey,
  yamlHandler,
  elementsRef,
  showError,
  formikProps,
  yamlBuilderReadOnlyModeProps,
  setSelectedTabId,
  setSelectedTabIndex,
  tabsMap,
  setTouchedPanels,
  touchedPanels,
  loadingYamlView,
  validate,
  setSubmittedForm
}: WizardFooterProps): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal className={cx(css.footer, !isYamlView && css.nonYamlViewFooter)}>
      {!isYamlView && selectedTabIndex !== 0 && (
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
          icon="chevron-left"
          minimal
          onClick={() => {
            const upcomingTabIndex = selectedTabIndex - 1
            setSelectedTabId(tabsMap[upcomingTabIndex])
            setSelectedTabIndex(upcomingTabIndex)
            setNewTouchedPanel({ selectedTabIndex, upcomingTabIndex, touchedPanels, setTouchedPanels })
            formikProps.validateForm()
          }}
        />
      )}
      {!isYamlView && !lastTab && (
        <Button
          text={getString('continue')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => {
            const upcomingTabIndex = selectedTabIndex + 1
            setSelectedTabId(tabsMap[upcomingTabIndex])
            setSelectedTabIndex(upcomingTabIndex)
            setNewTouchedPanel({ selectedTabIndex, upcomingTabIndex, touchedPanels, setTouchedPanels })
            formikProps.validateForm()
          }}
        />
      )}
      {!isYamlView && lastTab && (
        <Button
          text={submitLabel || getString('submit')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          type="submit"
          disabled={disableSubmit}
          onClick={async () => {
            setSubmittedForm(true)

            if (
              elementsRef.current.some(
                (element): boolean =>
                  !!element?.current?.firstElementChild?.classList?.contains('bp3-icon-warning-sign')
              )
            ) {
              setValidateOnChange(true)
              showError(getString('addressErrorFields'))
            }
            const validateErrors = await validate?.()
            if (isEmpty(validateErrors)) {
              // submit form if given validate is empty
              formikProps.submitForm()
            }
          }}
        />
      )}
      {!isYamlView && (
        <Button
          className={css.cancel}
          variation={ButtonVariation.TERTIARY}
          onClick={onHide}
          text={getString('cancel')}
        />
      )}
      {isYamlView && yamlBuilderReadOnlyModeProps && !loadingYamlView && (
        <>
          <Button
            text={submitLabel || getString('submit')}
            variation={ButtonVariation.PRIMARY}
            rightIcon="chevron-right"
            onClick={async () => {
              setSubmittedForm(true)
              const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
              const errorsYaml =
                (yamlHandler?.getYAMLValidationErrorMap() as unknown as Map<number, string>) ||
                /* istanbul ignore next */ ''
              if (errorsYaml?.size > 0) {
                showError(getString('invalidYamlText'))
                return
              }

              if (!isEmpty(await validate?.({ latestYaml }))) {
                return
              } else {
                formikProps.setSubmitting(true)
              }

              try {
                const parsedYaml = parse(latestYaml)
                const processedFormik = yamlObjectKey ? parsedYaml?.[yamlObjectKey] : parsedYaml
                if (!parsedYaml) {
                  showError(getString('invalidYamlText'))
                  return
                }
                formikProps.setSubmitting(true)
                onYamlSubmit?.(processedFormik)
              } catch (e) {
                showError(getString('invalidYamlText'))
                return
              }
            }}
            disabled={disableSubmit}
          />
          <Button
            className={css.cancel}
            variation={ButtonVariation.TERTIARY}
            onClick={onHide}
            text={getString('cancel')}
          />
        </>
      )}
    </Layout.Horizontal>
  )
}
