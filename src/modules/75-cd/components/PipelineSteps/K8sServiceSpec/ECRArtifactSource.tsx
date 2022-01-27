/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { cloneDeep, defaultTo, get } from 'lodash-es'
import { parse } from 'yaml'
import { Menu } from '@blueprintjs/core'

import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useMutateAsGet } from '@common/hooks'
import { ErrorHandler, ErrorHandlerProps } from '@common/components/ErrorHandler/ErrorHandler'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { PipelineInfoConfig, useGetBuildDetailsForEcrWithYaml } from 'services/cd-ng'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import ExperimentalInput from './K8sServiceSpecForms/ExperimentalInput'
import { clearRuntimeInputValue, isFieldRuntime } from './K8sServiceSpecHelper'
import css from './K8sServiceSpec.module.scss'

interface ECRRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}

const Content = (props: ECRRenderContent): JSX.Element => {
  const {
    getString,
    isPrimaryArtifactsRuntime,
    template,
    artifacts,
    formik,
    path,
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    readonly,
    repoIdentifier,
    pipelineIdentifier,
    branch,
    stageIdentifier,
    expressions,
    isTagsSelectionDisabled
  } = props

  const getYamlData = (): PipelineInfoConfig =>
    clearRuntimeInputValue(
      cloneDeep(
        parse(
          JSON.stringify({
            pipeline: formik?.values
          }) || ''
        )
      )
    )

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const {
    data: ecrTagsData,
    loading: fetchingTags,
    refetch: fetchTags,
    error: fetchTagsError
  } = useMutateAsGet(useGetBuildDetailsForEcrWithYaml, {
    body: yamlStringify(getYamlData()),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      imagePath:
        getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.imagePath
          : initialValues.artifacts?.primary?.spec?.imagePath,
      connectorRef:
        getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.connectorRef
          : initialValues.artifacts?.primary?.spec?.connectorRef,
      region:
        getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.region
          : initialValues.artifacts?.primary?.spec?.region,
      pipelineIdentifier,
      fqnPath: isPropagatedStage
        ? `pipeline.stages.${stageIdentifier}.spec.serviceConfig.stageOverrides.artifacts.primary.spec.tag`
        : `pipeline.stages.${stageIdentifier}.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.tag`
    },
    lazy: true
  })

  const [tagsList, setTagsList] = useState<SelectOption[]>([])
  useEffect(() => {
    if (Array.isArray(ecrTagsData?.data?.buildDetailsList)) {
      const toBeSetTagsList = ecrTagsData?.data?.buildDetailsList?.map(({ tag }) => ({
        label: defaultTo(tag, ''),
        value: defaultTo(tag, '')
      }))
      if (toBeSetTagsList) {
        setTagsList(toBeSetTagsList)
      }
    }
  }, [ecrTagsData])

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = defaultTo(regionData?.resource, []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name
  }))

  const onChange = (): void => {
    const tagPath = `${path}.artifacts.primary.spec.tag`
    const tagValue = get(formik?.values, tagPath, '')
    if (getMultiTypeFromValue(tagValue) === MultiTypeInputType.FIXED && tagValue?.length) {
      formik?.setFieldValue(tagPath, '')
    }
  }

  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Artifacts`}>
      <div className={css.subheading}>
        {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}{' '}
      </div>

      <div className={cx(css.nestedAccordions, css.artifactsAccordion)}>
        <Text className={css.inputheader}>{getString('primaryArtifactText')}</Text>
        {isPrimaryArtifactsRuntime && (
          <Layout.Vertical key="primary" className={css.inputWidth}>
            {isFieldRuntime('artifacts.primary.spec.connectorRef', template) && (
              <FormMultiTypeConnectorField
                name={`${path}.artifacts.primary.spec.connectorRef`}
                label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                selected={get(initialValues, 'artifacts.primary.spec.connectorRef', '')}
                placeholder={''}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                width={384}
                setRefValue
                disabled={readonly}
                multiTypeProps={{
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                  expressions
                }}
                onChange={onChange}
                className={css.connectorMargin}
                type="Aws"
                gitScope={{
                  repo: defaultTo(repoIdentifier, ''),
                  branch: defaultTo(branch, ''),
                  getDefaultFromOtherRepo: true
                }}
              />
            )}

            {isFieldRuntime('artifacts.primary.spec.region', template) && (
              <ExperimentalInput
                formik={formik}
                multiTypeInputProps={{
                  onChange: onChange,
                  selectProps: {
                    usePortal: true,
                    addClearBtn: true && !readonly,
                    items: regions
                  },
                  expressions,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                }}
                useValue
                disabled={readonly}
                selectItems={regions}
                label={getString('regionLabel')}
                name={`${path}.artifacts.primary.spec.region`}
              />
            )}

            {isFieldRuntime('artifacts.primary.spec.imagePath', template) && (
              <FormInput.MultiTextInput
                label={getString('pipeline.imagePathLabel')}
                disabled={readonly}
                multiTextInputProps={{
                  expressions,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                }}
                name={`${path}.artifacts.primary.spec.imagePath`}
                onChange={onChange}
              />
            )}

            {isFieldRuntime('artifacts.primary.spec.tag', template) && (
              <Layout.Vertical>
                <ExperimentalInput
                  formik={formik}
                  disabled={readonly || isTagsSelectionDisabled(props)}
                  selectItems={tagsList}
                  useValue
                  multiTypeInputProps={{
                    onFocus: (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (
                        e?.target?.type !== 'text' ||
                        (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                      ) {
                        return
                      }
                      if (!isTagsSelectionDisabled(props)) {
                        fetchTags()
                      }
                    },
                    selectProps: {
                      items: tagsList,
                      usePortal: true,
                      addClearBtn: !(readonly || isTagsSelectionDisabled(props)),
                      itemRenderer: (item: SelectOption, { handleClick }: { handleClick: () => void }) => {
                        return (
                          <div key={item.label.toString()}>
                            <Menu.Item
                              text={
                                <Layout.Horizontal spacing="small">
                                  <Text>{item.label}</Text>
                                </Layout.Horizontal>
                              }
                              disabled={fetchingTags}
                              onClick={handleClick}
                            />
                          </div>
                        )
                      },
                      allowCreatingNewItems: true,
                      popoverClassName: css.selectPopover
                    },
                    expressions,
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                  }}
                  label={getString('tagLabel')}
                  name={`${path}.artifacts.primary.spec.tag`}
                />
                {fetchTagsError ? (
                  <ErrorHandler responseMessages={(fetchTagsError.data as ErrorHandlerProps)?.responseMessages} />
                ) : null}
              </Layout.Vertical>
            )}
            {isFieldRuntime('artifacts.primary.spec.tagRegex', template) && (
              <FormInput.MultiTextInput
                disabled={readonly}
                multiTextInputProps={{
                  expressions,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                }}
                label={getString('tagRegex')}
                name={`${path}.artifacts.primary.spec.tagRegex`}
              />
            )}
          </Layout.Vertical>
        )}
      </div>
    </div>
  )
}

export class ECRArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = 'Ecr'
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { artifacts, initialValues } = props
    const isImagePathPresent =
      getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
        ? artifacts?.primary?.spec?.imagePath
        : initialValues.artifacts?.primary?.spec?.imagePath
    const isConnectorPresent =
      getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
        ? artifacts?.primary?.spec?.connectorRef
        : initialValues.artifacts?.primary?.spec?.connectorRef
    const isRegionPresent =
      getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
        ? artifacts?.primary?.spec?.region
        : initialValues.artifacts?.primary?.spec?.region
    return !(isImagePathPresent && isConnectorPresent && isRegionPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
