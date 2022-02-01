/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { RefObject, SetStateAction, Dispatch } from 'react'
import { Color, Icon, IconName, PageSpinner } from '@wings-software/uicore'
import cx from 'classnames'
import { parse } from 'yaml'
import type { FormikProps, FormikErrors } from 'formik'
import { isUndefined, range } from 'lodash-es'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'

import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction
} from '@common/interfaces/YAMLBuilderProps'

import css from './Wizard.module.scss'

export interface FormikPropsInterface {
  initialValues: any
  validationSchema?: any
  validate?: ({
    formikProps,
    latestYaml
  }: {
    formikProps: FormikProps<any>
    latestYaml?: string
  }) => Promise<FormikErrors<any>> | FormikErrors<any> | any
  validateOnBlur?: boolean
  validateOnChange?: boolean
  enableReinitialize?: boolean
  onSubmit: (val: any) => void
}

const renderIcon = ({
  requiredFields,
  checkValidPanel,
  panelIndex,
  touchedPanels,
  isEdit,
  formikVals,
  formikErrs
}: {
  requiredFields?: string[]
  checkValidPanel?: ({
    formikValues,
    formikErrors
  }: {
    formikValues: { [key: string]: any }
    formikErrors: { [key: string]: any }
  }) => boolean
  panelIndex: number
  touchedPanels: number[]
  isEdit: boolean
  formikVals: { [key: string]: any }
  formikErrs: { [key: string]: any }
}): JSX.Element | undefined => {
  if (!touchedPanels.includes(panelIndex) && !isEdit) return
  let iconName: IconName = 'tick-circle'
  let iconColor = Color.GREEN_500

  let showWarningIcon = requiredFields?.some(requiredField => {
    const val = formikVals[requiredField]
    // empty array should not show warning as valid yaml spec
    // set array to undefined to see warning
    if (isUndefined(val) || (typeof val === 'string' && val === '')) {
      return true
    }
  })

  if (!showWarningIcon && checkValidPanel && !checkValidPanel({ formikValues: formikVals, formikErrors: formikErrs })) {
    showWarningIcon = true
  }
  if (showWarningIcon) {
    iconName = 'warning-sign'
    iconColor = Color.RED_500
  }

  return <Icon size={20} color={iconColor} name={iconName} />
}

export const renderTitle = ({
  tabTitle,
  tabTitleComponent,
  requiredFields,
  checkValidPanel,
  panelIndex,
  touchedPanels,
  isEdit,
  selectedTabIndex,
  ref,
  formikVals,
  formikErrs
}: {
  tabTitle?: string
  tabTitleComponent?: JSX.Element
  requiredFields: string[]
  checkValidPanel?: ({
    formikValues,
    formikErrors
  }: {
    formikValues: { [key: string]: any }
    formikErrors: { [key: string]: any }
  }) => boolean
  panelIndex: number
  touchedPanels: number[]
  isEdit: boolean
  selectedTabIndex: number
  formikVals: { [key: string]: any }
  formikErrs: { [key: string]: any }
  ref: RefObject<HTMLSpanElement>
}): JSX.Element => {
  let title: string | JSX.Element = ''

  if (tabTitleComponent) title = tabTitleComponent
  else if (tabTitle) title = tabTitle
  const icon = renderIcon({
    requiredFields,
    panelIndex,
    touchedPanels,
    isEdit,
    formikVals,
    formikErrs,
    checkValidPanel
  })
  return (
    <span ref={ref} className={css.tab}>
      {icon ? (
        icon
      ) : (
        <div className={cx(css.panelIndexCircle, selectedTabIndex === panelIndex && css.activeIndex)}>
          <span className={css.panelIndexNumber}>{panelIndex + 1}</span>
        </div>
      )}
      {title}
    </span>
  )
}

export const setNewTouchedPanel = ({
  upcomingTabIndex,
  touchedPanels,
  selectedTabIndex,
  setTouchedPanels,
  includeSkippedIndexes
}: {
  upcomingTabIndex: number
  touchedPanels: number[]
  selectedTabIndex: number
  setTouchedPanels: (panels: number[]) => void
  includeSkippedIndexes?: boolean
}): void => {
  const movingBackwards = selectedTabIndex && upcomingTabIndex < selectedTabIndex
  if (touchedPanels.includes(upcomingTabIndex) && !movingBackwards) return /* istanbul ignore else */
  if (includeSkippedIndexes) {
    if (movingBackwards && selectedTabIndex) {
      // going backwards from last
      setTouchedPanels([...touchedPanels, selectedTabIndex])
    } else {
      const additionalTabs = range(0, upcomingTabIndex)
      setTouchedPanels([...touchedPanels, ...additionalTabs])
    }
  } else {
    setTouchedPanels([...touchedPanels, selectedTabIndex])
  }
}

export const shouldBlockNavigation = ({
  isSubmitting,
  isValid,
  isYamlView,
  yamlHandler,
  dirty,
  getIsDirtyForm
}: {
  isSubmitting: boolean
  isValid: boolean
  isYamlView: boolean
  yamlHandler?: YamlBuilderHandlerBinding
  dirty: boolean
  getIsDirtyForm: (parsedYaml: any) => boolean
}): boolean => {
  // isValid check for yaml will happen below
  const shouldBlockNav = !(isSubmitting && (isValid || isYamlView))

  if (isYamlView && yamlHandler) {
    try {
      const parsedYaml = parse(yamlHandler.getLatestYaml())
      if (!parsedYaml) {
        return shouldBlockNav
      }
      const isDirty = getIsDirtyForm(parsedYaml)
      return shouldBlockNav && isDirty
    } catch (e) {
      return shouldBlockNav
    }
  } else {
    return dirty ? shouldBlockNav : false
  }
}

export const renderYamlBuilder = ({
  loadingYamlView,
  yamlBuilderReadOnlyModeProps,
  convertFormikValuesToYaml,
  formikProps,
  setYamlHandler,
  invocationMap,
  schema
}: {
  loadingYamlView?: boolean
  yamlBuilderReadOnlyModeProps: YamlBuilderProps
  convertFormikValuesToYaml?: (formikPropsValues: any) => any
  formikProps: FormikProps<any>
  setYamlHandler: Dispatch<SetStateAction<YamlBuilderHandlerBinding | undefined>>
  invocationMap?: Map<RegExp, InvocationMapFunction>
  schema?: Record<string, any>
}): JSX.Element => {
  if (loadingYamlView) {
    return (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <PageSpinner />
      </div>
    )
  } else {
    return (
      <YAMLBuilder
        {...yamlBuilderReadOnlyModeProps}
        existingJSON={convertFormikValuesToYaml?.(formikProps.values)}
        isReadOnlyMode={false}
        showSnippetSection={false}
        bind={setYamlHandler}
        invocationMap={invocationMap}
        schema={schema}
      />
    )
  }
}
