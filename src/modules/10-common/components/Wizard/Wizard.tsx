import React, { useEffect } from 'react'
import { Layout, Tabs, Tab, Button, Formik, FormikForm, Heading, Text } from '@wings-software/uikit'
import type { IconName } from '@wings-software/uikit'
import { useStrings } from 'framework/exports'
import { useToaster } from '@common/exports'
import { renderTitle, setNewTouchedPanel } from './WizardUtils'
import css from './Wizard.module.scss'

export interface PanelInterface {
  id: string
  tabTitle?: string
  tabTitleComponent?: JSX.Element
  iconName?: IconName
  requiredFields?: string[]
  checkValidPanel?: (formiKValues: any) => boolean
}
export interface WizardMapInterface {
  wizardLabel?: string
  panels: PanelInterface[]
}

interface FormikPropsInterface {
  initialValues: any
  validationSchema?: any
  validateOnBlur?: boolean
  validateOnChange?: boolean
  enableReinitialize?: boolean
  onSubmit: (val: any) => void
}
interface WizardProps {
  wizardMap: WizardMapInterface
  formikInitialProps: FormikPropsInterface
  onHide: () => void
  defaultTabId?: string
  tabWidth?: string
  includeTabNumber?: boolean
  submitLabel?: string
  isEdit?: boolean
  children?: JSX.Element[]
  disableSubmit?: boolean
  errorToasterMessage?: string
}

const Wizard: React.FC<WizardProps> = ({
  wizardMap,
  onHide,
  submitLabel,
  tabWidth,
  defaultTabId,
  includeTabNumber = true,
  formikInitialProps,
  children,
  isEdit = false,
  disableSubmit,
  errorToasterMessage
}) => {
  const { wizardLabel } = wizardMap
  const defaultWizardTabId = wizardMap.panels[0].id
  const tabsMap = wizardMap?.panels?.map(panel => panel.id)
  const initialIndex = defaultTabId ? tabsMap.findIndex(tabsId => defaultTabId === tabsId) : 0
  const [selectedTabId, setSelectedTabId] = React.useState<string>(defaultTabId || defaultWizardTabId)
  const [touchedPanels, setTouchedPanels] = React.useState<number[]>([])
  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number>(initialIndex)
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const lastTab = selectedTabIndex === tabsMap.length - 1
  const { getString } = useStrings()
  const handleTabChange = (data: string): void => {
    const tabsIndex = tabsMap.findIndex(tab => tab === data)
    setSelectedTabId(data)
    setSelectedTabIndex(tabsIndex)
    setNewTouchedPanel({
      upcomingTabIndex: tabsIndex,
      selectedTabIndex,
      touchedPanels,
      setTouchedPanels,
      includeSkippedIndexes: true
    })
  }
  const { showError } = useToaster()

  useEffect(() => {
    if (errorToasterMessage) {
      showError(errorToasterMessage)
    }
  }, [showError, errorToasterMessage])

  return (
    <section className={css.wizardShell} ref={layoutRef}>
      {wizardLabel && (
        <Heading
          style={{ position: 'fixed', top: '35px', paddingLeft: 'var(--spacing-large)' }}
          padding="small"
          level={2}
        >
          {wizardLabel}
        </Heading>
      )}
      <div className={css.headerLine}></div>
      <Layout.Horizontal spacing="large" className={css.tabsContainer}>
        <Formik {...formikInitialProps}>
          {formikProps => (
            <FormikForm>
              <Tabs id="Wizard" onChange={handleTabChange} selectedTabId={selectedTabId}>
                {wizardMap.panels.map((_panel, panelIndex) => {
                  const { id, tabTitle, tabTitleComponent, requiredFields = [], checkValidPanel } = _panel
                  return (
                    <Tab
                      key={id}
                      id={id}
                      style={{ width: tabWidth ? tabWidth : 'auto' }}
                      title={renderTitle({
                        tabTitle,
                        tabTitleComponent,
                        requiredFields,
                        checkValidPanel,
                        panelIndex,
                        touchedPanels,
                        isEdit,
                        includeTabNumber,
                        formikValues: formikProps.values
                      })}
                      panel={
                        children?.[panelIndex] && React.cloneElement(children[panelIndex], { formikProps, isEdit })
                      }
                    />
                  )
                })}
              </Tabs>
              <Layout.Horizontal spacing="medium" className={css.footer}>
                {selectedTabIndex !== 0 && (
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    minimal
                    onClick={() => {
                      const upcomingTabIndex = selectedTabIndex - 1
                      setSelectedTabId(tabsMap[upcomingTabIndex])
                      setSelectedTabIndex(upcomingTabIndex)
                      setNewTouchedPanel({ selectedTabIndex, upcomingTabIndex, touchedPanels, setTouchedPanels })
                    }}
                  />
                )}
                {!lastTab && (
                  <Button
                    text={getString('continue')}
                    intent="primary"
                    rightIcon="chevron-right"
                    onClick={() => {
                      const upcomingTabIndex = selectedTabIndex + 1
                      setSelectedTabId(tabsMap[upcomingTabIndex])
                      setSelectedTabIndex(upcomingTabIndex)
                      setNewTouchedPanel({ selectedTabIndex, upcomingTabIndex, touchedPanels, setTouchedPanels })
                    }}
                  />
                )}
                {lastTab && (
                  <Button
                    text={submitLabel || getString('submit')}
                    intent="primary"
                    rightIcon="chevron-right"
                    type="submit"
                    disabled={disableSubmit}
                  />
                )}
                <Text className={css.cancel} onClick={onHide}>
                  {getString('cancel')}
                </Text>
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Layout.Horizontal>
      <div className={css.footerLine}></div>
    </section>
  )
}

export default Wizard
