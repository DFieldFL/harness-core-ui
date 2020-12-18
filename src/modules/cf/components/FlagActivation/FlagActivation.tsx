import React, { useEffect, useState } from 'react'
import { isEqual, isNil } from 'lodash-es'
import {
  Layout,
  Color,
  Container,
  Text,
  Switch,
  Tabs,
  Tab,
  Button,
  FlexExpander,
  Select,
  useModalHook,
  SelectOption,
  Formik,
  FormikForm as Form
} from '@wings-software/uikit'
import { Dialog } from '@blueprintjs/core'
import { Feature, FeatureState, usePatchFeatureFlag, ServingRule, Clause, Serve, VariationMap } from 'services/cf'
import { SharedQueryParams, extraOperators } from '@cf/constants'
import FlagElemTest from '../CreateFlagWizard/FlagElemTest'
import TabTargeting from '../EditFlagTabs/TabTargeting'
import TabActivity from '../EditFlagTabs/TabActivity'
import patch, { ClauseData, getDiff } from '../../utils/instructions'
import i18n from './FlagActivation.i18n'
import css from './FlagActivation.module.scss'

interface FlagActivationProps {
  project: string
  environments: SelectOption[]
  environment: SelectOption | null
  flagData: Feature | undefined
  isBooleanFlag: boolean
  onEnvChange: any
  refetchFlag: any
}

interface Values {
  [key: string]: any
  state: string
  offVariation: string
  defaultServe: Serve
  customRules: ServingRule[]
  variationMap: VariationMap[]
}

const fromVariationMapToObj = (variationMap: VariationMap[]) =>
  variationMap.reduce((acc: any, vm: VariationMap) => {
    if (acc[vm.variation]) {
      acc[vm.variation].targets = acc[vm.variation].targets.concat(vm.targets || [])
      acc[vm.variation].targetSegments = acc[vm.variation].targetSegments.concat(vm.targetSegments || [])
    } else {
      acc[vm.variation] = { targets: vm.targets, targetSegments: vm.targetSegments }
    }
    return acc
  }, {})

export enum envActivation {
  activeOff = 'off',
  activeOn = 'on'
}

const FlagActivation: React.FC<FlagActivationProps> = props => {
  const { flagData, project, environments, environment, isBooleanFlag, refetchFlag } = props

  const [editEnvActivation, seteditEnvActivation] = useState<FeatureState | undefined>(flagData?.envProperties?.state)
  const [editing, setEditing] = useState(false)
  const dirty = editEnvActivation !== flagData?.envProperties?.state
  const { mutate: patchFeature } = usePatchFeatureFlag({
    identifier: flagData?.identifier as string,
    queryParams: {
      project: project as string,
      environment: environment?.value as string,
      ...SharedQueryParams
    }
  })

  const toggleFlag = () => {
    seteditEnvActivation(
      editEnvActivation === envActivation.activeOff ? envActivation.activeOn : envActivation.activeOff
    )
  }

  const onChangeSwitchEnv = (_: string, formikProps: any): void => {
    toggleFlag()
    formikProps.setFieldValue(
      'state',
      editEnvActivation === envActivation.activeOff ? envActivation.activeOn : envActivation.activeOff
    )
  }

  const onCancelEditHandler = (): void => {
    setEditing(false)
    patch.feature.reset()
  }

  const initialValues: Values = {
    state: flagData?.envProperties?.state as string,
    onVariation: flagData?.envProperties?.defaultServe.variation
      ? flagData?.envProperties?.defaultServe.variation
      : flagData?.envProperties?.defaultServe.distribution
      ? 'percentage'
      : flagData?.defaultOnVariation,
    offVariation: flagData?.envProperties?.offVariation as string,
    defaultServe: flagData?.envProperties?.defaultServe as Serve,
    customRules: flagData?.envProperties?.rules ?? [],
    variationMap: flagData?.envProperties?.variationMap ?? []
  }

  const onSaveChanges = (values: Values): void => {
    if (values.state !== initialValues.state) {
      patch.feature.addInstruction(patch.creators.setFeatureFlagState(values?.state as FeatureState))
    }
    if (!isEqual(values.offVariation, initialValues.offVariation)) {
      patch.feature.addInstruction(patch.creators.updateOffVariation(values.offVariation as string))
    }
    if (!isEqual(values.onVariation, initialValues.onVariation)) {
      if (values.onVariation !== 'percentage') {
        patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(values.onVariation as string))
      }
    }
    if (!isEqual(values.defaultServe, initialValues.defaultServe)) {
      patch.feature.addInstruction(
        patch.creators.updateDefaultServeByBucket(
          values.defaultServe.distribution?.bucketBy || '',
          values.defaultServe.distribution?.variations || []
        )
      )
    }
    if (!isEqual(values.customRules, initialValues.customRules)) {
      const toClauseData = (c: Clause): ClauseData => {
        if (c.op === extraOperators.customRules.matchSegment) {
          return {
            op: c.op,
            values: c.values
          }
        } else {
          return {
            attribute: c.attribute as string,
            op: c.op,
            values: c.values
          }
        }
      }

      patch.feature.addAllInstructions(
        initialValues.customRules
          .filter(rule => !values.customRules.find(r => r.ruleId === rule.ruleId))
          .map(r => patch.creators.removeRule(r.ruleId))
      )

      patch.feature.addAllInstructions(
        values.customRules
          .filter(rule => !rule.ruleId)
          .map(rule => patch.creators.addRule(rule.priority, rule.serve, rule.clauses.map(toClauseData)))
      )

      values.customRules
        .filter(rule => rule.ruleId)
        .map(rule => [initialValues.customRules.find(r => r.ruleId === rule.ruleId), rule])
        .filter(([initial, current]) => !isEqual(initial, current))
        .map(([initial, current]) => {
          current?.clauses
            .filter(c => !c.id)
            .forEach(c => patch.feature.addInstruction(patch.creators.addClause(current.ruleId, toClauseData(c))))

          initial?.clauses
            .filter(c => !current?.clauses.find(cl => cl.id === c.id))
            .forEach(c => patch.feature.addInstruction(patch.creators.removeClause(initial.ruleId, c.id)))

          initial?.clauses
            .reduce((acc: any, prev) => {
              const currentValue = current?.clauses.find(c => c.id === prev.id)
              if (currentValue && !isEqual(prev, currentValue)) {
                return [...acc, [prev, currentValue]]
              }
              return acc
            }, [])
            .forEach(([c, updated]: [Clause, Clause]) =>
              patch.feature.addInstruction(patch.creators.updateClause(initial.ruleId, c.id, toClauseData(updated)))
            )
        })
    }

    if (!isEqual(values.variationMap, initialValues.variationMap)) {
      const initial = fromVariationMapToObj(initialValues.variationMap)
      const updated = fromVariationMapToObj(values.variationMap)

      const variations = Array.from(new Set(Object.keys(initial).concat(Object.keys(updated))))
      variations.forEach((variation: string) => {
        const [added, removed] = getDiff<string, string>(
          initial[variation]?.targets || [],
          updated[variation]?.targets || []
        )
        if (added.length > 0) {
          patch.feature.addInstruction(patch.creators.addTargetsToVariationTargetMap(variation, added))
        }
        if (removed.length > 0) {
          patch.feature.addInstruction(patch.creators.removeTargetsToVariationTargetMap(variation, removed))
        }
      })
    }

    patch.feature
      .onPatchAvailable(data => {
        patchFeature(data)
          .then(() => {
            patch.feature.reset()
            refetchFlag()
          })
          .catch(() => {
            patch.feature.reset()
          })
      })
      .onEmptyPatch(() => setEditing(false))
  }

  type RuleErrors = { [K: number]: { [P: number]: 'required' } }
  const validateRules = (rules: ServingRule[]): [RuleErrors, boolean] => {
    const errors: RuleErrors = {}
    let valid = true
    rules.forEach((rule: ServingRule, ruleIdx: number) => {
      rule.clauses.map((clause: Clause, clauseIdx: number) => {
        if (clause.values.length === 0) {
          if (!errors[ruleIdx]) {
            errors[ruleIdx] = {}
          }
          errors[ruleIdx][clauseIdx] = 'required'
          valid = false
        }
      })
    })
    return [errors, valid]
  }
  type FormErrors = {
    rules?: RuleErrors
  }
  const validateForm = (values: Values) => {
    const errors: FormErrors = {}

    const [rules, valid] = validateRules(values.customRules)
    if (!valid) {
      errors.rules = rules
    }

    return errors
  }

  const [openModalTestFlag, hideModalTestFlag] = useModalHook(() => (
    <Dialog onClose={hideModalTestFlag} isOpen={true} className={css.testFlagDialog}>
      <Container className={css.testFlagDialogContainer}>
        <FlagElemTest name="" fromWizard={false} />
        <Button
          minimal
          icon="small-cross"
          iconProps={{ size: 20 }}
          onClick={hideModalTestFlag}
          style={{ top: 0, right: '15px', position: 'absolute' }}
        />
      </Container>
    </Dialog>
  ))

  useEffect(() => {
    if (isNil(environment)) {
      props.onEnvChange(environments[0])
    }
  }, [environment])

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={onSaveChanges}
    >
      {formikProps => (
        <Form>
          <Layout.Horizontal flex background={Color.BLUE_300} padding="large">
            <Text margin={{ right: 'medium' }} font={{ weight: 'bold' }}>
              {i18n.env.toUpperCase()}
            </Text>
            <Select
              items={environments}
              className={css.envSelect}
              value={environment ?? environments[0]}
              onChange={props.onEnvChange}
            />
            <FlexExpander />
            <Switch
              label={i18n.changeEditEnv(editEnvActivation as string)}
              onChange={event => {
                onChangeSwitchEnv(event.currentTarget.value, formikProps)
              }}
              alignIndicator="right"
              large={true}
              checked={editEnvActivation === envActivation.activeOn}
            />
          </Layout.Horizontal>
          <Container className={css.tabContainer}>
            {flagData ? (
              <>
                <Tabs id="editFlag">
                  <Tab
                    id="targeting"
                    title={i18n.targeting}
                    panel={
                      <TabTargeting
                        formikProps={formikProps}
                        editing={editing}
                        refetch={refetchFlag}
                        targetData={flagData}
                        isBooleanTypeFlag={isBooleanFlag}
                        projectIdentifier={project}
                        environmentIdentifier={environment?.value as string}
                        setEditing={setEditing}
                      />
                    }
                  />
                  <Tab id="activity" title={i18n.activity} panel={<TabActivity />} />
                </Tabs>
                <Button
                  icon="code"
                  minimal
                  intent="primary"
                  onClick={openModalTestFlag}
                  className={css.tabContainerTestFlagBtn}
                />
              </>
            ) : (
              <Text>No Data</Text>
            )}
          </Container>
          {(editing || dirty) && (
            <Layout.Horizontal className={css.editBtnsGroup} padding="medium">
              <Button
                intent="primary"
                text={i18n.saveChange}
                margin={{ right: 'small' }}
                onClick={formikProps.submitForm}
              />
              <Button minimal text={i18n.cancel} onClick={onCancelEditHandler} />
            </Layout.Horizontal>
          )}
        </Form>
      )}
    </Formik>
  )
}

export default FlagActivation
