import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Color,
  Layout,
  Text,
  FlexExpander,
  Button,
  Container,
  Popover,
  Icon,
  Heading,
  Collapse,
  Formik,
  FormikForm as Form,
  FormInput,
  useModalHook,
  SelectOption
} from '@wings-software/uikit'
import moment from 'moment'
import { Menu, Dialog, Classes } from '@blueprintjs/core'
import type { IconName } from '@blueprintjs/core'
import { FieldArray } from 'formik'
import type { FeatureFlagResponseResponse } from 'services/cf'
import { FlagTypeVariations } from '../../components/CreateFlagDialog/FlagDialogUtils'
import InputDescOptional from '../../components/CreateFlagWizard/common/InputDescOptional'
import i18n from './FlagActivationDetails.i18n'
import css from './FlagActivationDetails.module.scss'

interface ListPrerequisitesOptionElement {
  prerequisitesFlag: string
  prerequisitesVariation: string
}

const editCardCollapsedProps = {
  collapsedIcon: 'main-chevron-right' as IconName,
  expandedIcon: 'main-chevron-down' as IconName,
  isOpen: false,
  isRemovable: false,
  className: 'collapse'
}

interface FlagActivationDetailsProps {
  singleFlag: FeatureFlagResponseResponse | null
}

const FlagActivationDetails: React.FC<FlagActivationDetailsProps> = props => {
  const { singleFlag } = props

  const [editOpenedMenu, setEditOpenedMenu] = useState(false)
  const [showPrerequisites, setShowPrerequisites] = useState(false)
  const [listPrerequisites, setListPrequisites] = useState<ListPrerequisitesOptionElement[]>([])
  const [editDefaultValuesModal, setEditDefaultValuesModal] = useState<SelectOption[]>([])

  const history = useHistory()

  const isBooleanFlag = singleFlag?.data?.kind === FlagTypeVariations.booleanFlag

  const setDefaultFlags = (): void => {
    let localVars: SelectOption[] = []
    if (singleFlag?.data?.variations.length) {
      // FIXME: Check the TS error about incompatible types
      localVars = singleFlag.data.variations.map(elem => {
        return { label: elem.identifier as string, value: elem.value as any }
      })
    }
    setEditDefaultValuesModal(localVars)
  }

  const [openModalEditVariations, hideModalEditVariations] = useModalHook(
    () => (
      <Dialog onClose={hideModalEditVariations} title={''} isOpen={true} style={{ width: '800px' }}>
        <Layout.Vertical padding={{ left: 'xlarge', right: 'large' }}>
          <Heading level={2} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
            {i18n.editVariations.editVariationHeading}
          </Heading>
          <Container>
            <Formik
              initialValues={{
                variations: singleFlag?.data?.variations,
                defaultOnVariation: singleFlag?.data?.defaultOnVariation,
                defaultOffVariation: singleFlag?.data?.defaultOffVariation
              }}
              onSubmit={vals => alert(JSON.stringify(vals, null, 2))}
            >
              {formikProps => (
                <Form>
                  <Layout.Vertical>
                    <Container>
                      {isBooleanFlag ? (
                        <>
                          <Layout.Horizontal className={css.variationsContainer}>
                            <FormInput.Text name="variations[0].identifier" label={i18n.editVariations.true} />
                            <InputDescOptional
                              text={i18n.descOptional}
                              inputName="variations[0].description"
                              inputPlaceholder={''}
                              isOpen={singleFlag?.data?.variations[0].description ? true : false}
                            />
                          </Layout.Horizontal>
                          <Layout.Horizontal className={css.variationsContainer}>
                            <FormInput.Text name="variations[1].identifier" label={i18n.editVariations.false} />
                            <InputDescOptional
                              text={i18n.descOptional}
                              inputName="variations[1].description"
                              inputPlaceholder={''}
                              isOpen={singleFlag?.data?.variations[1].description ? true : false}
                            />
                          </Layout.Horizontal>
                        </>
                      ) : (
                        formikProps?.values?.variations?.map((elem, index) => (
                          <Layout.Horizontal key={`${elem.identifier}-${index}`}>
                            <FormInput.Text
                              name={`variations.${index}.identifier`}
                              label={`${i18n.variation} ${index + 1}`}
                              style={{ marginRight: 'var(--spacing-small)' }}
                            />
                            <FormInput.Text
                              name={`variations.${index}.name`}
                              label={i18n.nameLabelOptional}
                              placeholder={i18n.nameLabel}
                              style={{ marginRight: 'var(--spacing-small)' }}
                            />
                            <InputDescOptional
                              text={i18n.descOptional}
                              inputName={`variations.${index}.description`}
                              inputPlaceholder={i18n.editVariations.variationAbout}
                              isOpen={singleFlag?.data?.variations[index].description ? true : false}
                            />
                          </Layout.Horizontal>
                        ))
                      )}
                    </Container>

                    <Container>
                      <Layout.Vertical margin={{ top: 'xlarge' }}>
                        <Layout.Horizontal>
                          <Text font={{ weight: 'bold' }} color={Color.BLACK} margin={{ right: 'xsmall' }}>
                            {i18n.editVariations.defaultRules}
                          </Text>
                          <Text
                            icon="info-sign"
                            iconProps={{ size: 10, color: Color.BLUE_500 }}
                            tooltip="To be added..."
                            tooltipProps={{ isDark: true }}
                          />
                        </Layout.Horizontal>

                        <Text margin={{ bottom: 'large' }}>{i18n.editVariations.defaultRulesDesc}</Text>

                        <Layout.Horizontal className={css.newEnvRulesContainer}>
                          <Text margin={{ right: 'medium' }} width="150px">
                            {i18n.editVariations.defaultFlagOn}
                          </Text>
                          <FormInput.Select
                            name="defaultOnVariation"
                            items={editDefaultValuesModal}
                            className={css.selectEnv}
                          />
                        </Layout.Horizontal>

                        <Layout.Horizontal className={css.newEnvRulesContainer}>
                          <Text margin={{ right: 'medium' }} width="150px">
                            {i18n.editVariations.defaultFlagOff}
                          </Text>
                          <FormInput.Select
                            name="defaultOffVariation"
                            items={editDefaultValuesModal}
                            className={css.selectEnv}
                          />
                        </Layout.Horizontal>
                      </Layout.Vertical>
                    </Container>
                    <Layout.Horizontal padding={{ top: 'large', bottom: 'large' }}>
                      <Button text={i18n.save} intent="primary" margin={{ right: 'small' }} type="submit" />
                      <Button onClick={hideModalEditVariations} text={i18n.cancel} />
                    </Layout.Horizontal>
                  </Layout.Vertical>
                </Form>
              )}
            </Formik>
          </Container>
        </Layout.Vertical>
      </Dialog>
    ),
    [editDefaultValuesModal]
  )

  const [openModalPrerequisites, hideModalPrerequisites] = useModalHook(() => (
    <Dialog title={i18n.addPrerequisites.addPrerequisitesHeading} onClose={hideModalPrerequisites} isOpen={true}>
      <Layout.Vertical padding={{ left: 'large', right: 'medium' }}>
        <Text margin={{ top: 'medium', bottom: 'xlarge' }}>{i18n.addPrerequisites.addPrerequisitesDesc}</Text>
        <Formik
          initialValues={{
            prerequisitesDialog: [{ prerequisitesFlag: '', prerequisitesVariation: '' }]
          }}
          onSubmit={vals => {
            setShowPrerequisites(true)
            setListPrequisites(vals.prerequisitesDialog)
            alert(JSON.stringify(vals, null, 2))
          }}
        >
          {formikProps => (
            <Form>
              <FieldArray name="prerequisitesDialog">
                {arrayHelpers => {
                  return (
                    <>
                      {formikProps.values.prerequisitesDialog.map((_, i) => (
                        <Layout.Horizontal flex key={i}>
                          <FormInput.Select
                            name={`prerequisitesDialog.${i}.prerequisitesFlag`}
                            placeholder={i18n.addPrerequisites.selectFlag}
                            items={[{ label: 'Placeholder', value: 'placeholder' }]}
                          />
                          <FormInput.Select
                            name={`prerequisitesDialog.${i}.prerequisitesVariation`}
                            placeholder={i18n.addPrerequisites.selectVariation}
                            items={[{ label: 'Placeholder', value: 'placeholder' }]}
                          />
                        </Layout.Horizontal>
                      ))}
                      <Button
                        minimal
                        intent="primary"
                        text={i18n.prerequisites}
                        icon="small-plus"
                        onClick={() => {
                          arrayHelpers.push({ prerequisitesFlag: '', prerequisitesVariation: '' })
                        }}
                      />
                    </>
                  )
                }}
              </FieldArray>
              <Layout.Horizontal padding={{ top: 'large', bottom: 'large' }} border={{ bottom: true }}>
                <Button text={i18n.save} intent="primary" margin={{ right: 'small' }} type="submit" />
                <Button text={i18n.cancel} onClick={hideModalPrerequisites} />
              </Layout.Horizontal>
            </Form>
          )}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  ))

  const [openEditDetailsModal, hideEditDetailsModal] = useModalHook(() => (
    <Dialog onClose={hideEditDetailsModal} isOpen={true} title={''}>
      <Formik
        initialValues={{
          name: singleFlag?.data?.name,
          description: singleFlag?.data?.description,
          tags: singleFlag?.data?.tags?.map(elem => elem.name),
          permanent: singleFlag?.data?.permanent
        }}
        onSubmit={vals => alert(JSON.stringify(vals, null, 2))}
      >
        {() => (
          <Form>
            <Layout.Vertical className={css.editDetailsModalContainer}>
              <Text>{i18n.editDetails.editDetailsHeading}</Text>

              <FormInput.Text name="name" label={i18n.nameLabel} />

              <FormInput.TextArea name="description" label={i18n.descOptional} />

              <FormInput.TagInput
                name="tags"
                label={i18n.editDetails.tags}
                items={[]}
                labelFor={nameTag => nameTag as string}
                itemFromNewTag={newTag => newTag}
                tagInputProps={{ showAddTagButton: true, allowNewTag: true }}
              />

              <Layout.Horizontal padding={{ top: 'medium', bottom: 'medium' }}>
                <FormInput.CheckBox
                  name="permanent"
                  label={i18n.editDetails.permaFlag}
                  className={css.checkboxEditDetails}
                />
                <Text
                  icon="info-sign"
                  iconProps={{ color: Color.BLUE_500, size: 12 }}
                  tooltip="To be added..."
                  tooltipProps={{ isDark: true }}
                />
              </Layout.Horizontal>

              <Layout.Horizontal>
                <Button intent="primary" text={i18n.save} type="submit" />
                <Button minimal text={i18n.cancel} onClick={hideEditDetailsModal} />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Dialog>
  ))

  return (
    <>
      <Layout.Horizontal>
        <Text color={Color.BLUE_500} onClick={() => history.goBack()} style={{ cursor: 'pointer' }}>
          {i18n.flag} /
        </Text>
        <FlexExpander />
        <span>
          <Icon name="pin" />
        </span>
        <Popover
          isOpen={editOpenedMenu}
          onInteraction={nextOpenState => {
            setEditOpenedMenu(nextOpenState)
          }}
          className={Classes.DARK}
        >
          <Button
            minimal
            icon="more"
            onClick={e => {
              e.stopPropagation()
              setEditOpenedMenu(true)
            }}
          />
          <Menu style={{ minWidth: 'unset' }}>
            <Menu.Item icon="edit" text={i18n.edit} onClick={openEditDetailsModal} />
            <Menu.Divider />
            <Menu.Item icon="archive" text={i18n.archive} onClick={() => alert('To be implemented...')} />
          </Menu>
        </Popover>
      </Layout.Horizontal>

      <Container>
        <Heading color={Color.BLACK} margin={{ bottom: 'medium' }}>
          {singleFlag?.data?.name}
        </Heading>
        <Text margin={{ bottom: 'medium' }}>{singleFlag?.data?.description}</Text>
        <Text font={{ size: 'small' }}>
          <span style={{ backgroundColor: 'var(--blue-300)', padding: 'var(--spacing-xsmall)', borderRadius: '7px' }}>
            {singleFlag?.data?.identifier}
          </span>
        </Text>
        <Container className={css.tagsFlagActivationDetails}>
          {singleFlag?.data?.tags?.map((elem, i) => (
            <Text
              key={`flagDetails-${i}`}
              background={Color.GREY_300}
              color={Color.GREY_800}
              margin={{ right: 'xsmall' }}
              padding={{ top: 'small', bottom: 'small', left: 'xsmall', right: 'xsmall' }}
            >
              {elem.value}
            </Text>
          ))}
        </Container>

        <Layout.Horizontal flex margin={{ top: 'medium' }}>
          <Layout.Vertical>
            <Layout.Horizontal flex>
              <Text color={Color.BLACK} font={{ weight: 'bold' }} margin={{ right: 'xsmall' }}>
                {i18n.created}
              </Text>
              <Text font={{ size: 'small' }} color={Color.GREY_400}>
                {moment(singleFlag?.data?.createdAt).format('MMMM D, YYYY hh:mm A')}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal flex>
              <Text color={Color.BLACK} font={{ weight: 'bold' }} margin={{ right: 'xsmall' }}>
                {i18n.modified}
              </Text>
              <Text font={{ size: 'small' }} color={Color.GREY_400}>
                {moment(singleFlag?.data?.modifiedAt).format('MMMM D, YYYY hh:mm A')}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
          <FlexExpander />
          <Layout.Vertical>
            <Layout.Horizontal>
              <Icon name="user" />
              <Icon name="plus" />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>

        <Layout.Vertical padding="large" margin={{ top: 'large' }} style={{ boxShadow: '0 0 10px #ccc' }}>
          <Layout.Horizontal flex={{ align: 'center-center' }} margin={{ bottom: 'medium' }}>
            <Text color={Color.BLACK}>{i18n.variations}</Text>
            <Text
              tooltip="To be added..."
              tooltipProps={{
                isDark: true
              }}
              rightIcon="info-sign"
              rightIconProps={{ size: 14, color: Color.BLUE_500 }}
            />
            <FlexExpander />
            <Button
              minimal
              intent="primary"
              icon="edit"
              onClick={() => {
                openModalEditVariations()
                setDefaultFlags()
              }}
            />
          </Layout.Horizontal>

          <Layout.Vertical>
            <Text
              border={{ bottom: true, color: Color.GREY_300 }}
              margin={{ bottom: 'medium' }}
              padding={{ bottom: 'xsmall' }}
            >
              {singleFlag?.data?.kind === FlagTypeVariations.booleanFlag ? i18n.boolean : i18n.multivariate} (
              {singleFlag?.data?.variations.length} variations)
            </Text>
            <Text margin={{ bottom: 'medium' }}>{singleFlag?.data?.defaultOnVariation}</Text>
            <Text>{singleFlag?.data?.defaultOffVariation}</Text>
          </Layout.Vertical>
        </Layout.Vertical>

        <Container className={css.collapseFeatures}>
          <Collapse {...editCardCollapsedProps} heading={i18n.prerequisitesWithDesc}>
            <Layout.Horizontal flex margin={{ bottom: 'xsmall' }}>
              <Text width="50%">{i18n.flag}</Text>
              <Text width="50%">{i18n.variation}</Text>
            </Layout.Horizontal>
            <Layout.Vertical className={css.collapseFeaturesPrerequisites}>
              {showPrerequisites &&
                listPrerequisites.map((elem, i) => (
                  <Layout.Horizontal key={i} flex padding="medium">
                    <Text>{elem.prerequisitesFlag}</Text>
                    <Text>{elem.prerequisitesVariation}</Text>
                    {/* TODO: In the future, replace this with Popover */}
                    <Icon name="more" color={Color.GREY_500} />
                  </Layout.Horizontal>
                ))}
              <Button
                minimal
                intent="primary"
                icon="small-plus"
                text={i18n.prerequisites}
                onClick={openModalPrerequisites}
              />
            </Layout.Vertical>
          </Collapse>
        </Container>

        <Container className={css.collapseFeatures}>
          <Collapse {...editCardCollapsedProps} heading={i18n.workflowsWithDesc}>
            <Text>To be implemented...</Text>
          </Collapse>
        </Container>
      </Container>
    </>
  )
}

export default FlagActivationDetails
