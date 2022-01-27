/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Text,
  Icon,
  Color,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  FontVariation
} from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { SidecarArtifactWrapper } from 'services/cd-ng'
import { ArtifactIconByType } from '../ArtifactHelper'
import type { ArtifactListViewProps, ArtifactType } from '../ArtifactInterface'
import css from '../ArtifactsSelection.module.scss'

export enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}

const ArtifactListView: React.FC<ArtifactListViewProps> = ({
  accountId,
  fetchedConnectorResponse,
  primaryArtifact,
  sideCarArtifact,
  isReadonly,
  editArtifact,
  overrideSetIdentifier,
  removePrimary,
  removeSidecar,
  addNewArtifact
}) => {
  const { getString } = useStrings()
  const { color: primaryConnectorColor } = getStatus(
    primaryArtifact?.spec?.connectorRef,
    fetchedConnectorResponse,
    accountId
  )
  const primaryConnectorName = getConnectorNameFromValue(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse)

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
        {!!(sideCarArtifact?.length || primaryArtifact?.type) && (
          <div className={cx(css.artifactList, css.listHeader)}>
            <span></span>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            <span></span>
          </div>
        )}

        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>
            {primaryArtifact && (
              <section className={cx(css.artifactList, css.rowItem)} key={'Dockerhub'}>
                <div>
                  <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                    {getString('primary')}
                  </Text>
                </div>
                <div className={css.connectorNameField}>
                  <Icon padding={{ right: 'small' }} name={ArtifactIconByType[primaryArtifact.type]} size={18} />
                  <Text
                    tooltip={
                      <Container className={css.borderRadius} padding="medium">
                        <div>
                          <Text font="small" color={Color.GREY_100}>
                            {primaryConnectorName}
                          </Text>
                          <Text font="small" color={Color.GREY_300}>
                            {primaryArtifact.spec?.connectorRef}
                          </Text>
                        </div>
                      </Container>
                    }
                    tooltipProps={{ isDark: true }}
                    alwaysShowTooltip
                    className={css.connectorName}
                    lineClamp={1}
                  >
                    {primaryConnectorName ?? primaryArtifact.spec?.connectorRef}
                  </Text>

                  {getMultiTypeFromValue(primaryArtifact.spec?.connectorRef) === MultiTypeInputType.FIXED && (
                    <Icon name="full-circle" size={8} color={primaryConnectorColor} />
                  )}
                </div>
                <div>
                  <Text width={340} lineClamp={1} style={{ color: Color.GREY_500 }}>
                    <span className={css.noWrap}>{primaryArtifact?.spec?.imagePath}</span>
                  </Text>
                </div>
                {overrideSetIdentifier?.length === 0 && !isReadonly && (
                  <Layout.Horizontal>
                    <Button
                      icon="Edit"
                      minimal
                      iconProps={{ size: 18 }}
                      onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact.type)}
                    />
                    <Button iconProps={{ size: 18 }} minimal icon="main-trash" onClick={removePrimary} />
                  </Layout.Horizontal>
                )}
              </section>
            )}
          </section>
          {sideCarArtifact && sideCarArtifact?.length > 0 && (
            <section>
              {sideCarArtifact?.map((data: SidecarArtifactWrapper, index: number) => {
                const { sidecar } = data
                const { color: sideCarConnectionColor } = getStatus(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse,
                  accountId
                )
                const sidecarConnectorName = getConnectorNameFromValue(
                  sidecar?.spec?.connectorRef,
                  fetchedConnectorResponse
                )

                return (
                  <section className={cx(css.artifactList, css.rowItem)} key={`${sidecar?.identifier}-${index}`}>
                    <div>
                      <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                        {getString('sidecar')}
                        <Text lineClamp={1} className={css.artifactId}>
                          ({getString('common.ID')}: {sidecar?.identifier})
                        </Text>
                      </Text>
                    </div>

                    <div className={css.connectorNameField}>
                      <Icon
                        padding={{ right: 'small' }}
                        name={ArtifactIconByType[sidecar?.type as ArtifactType]}
                        size={18}
                      />
                      <Text
                        className={css.connectorName}
                        lineClamp={1}
                        tooltip={
                          <Container className={css.borderRadius} padding="medium">
                            <div>
                              <Text font="small" color={Color.GREY_100}>
                                {sidecarConnectorName}
                              </Text>
                              <Text font="small" color={Color.GREY_300}>
                                {sidecar?.spec?.connectorRef}
                              </Text>
                            </div>
                          </Container>
                        }
                        tooltipProps={{ isDark: true }}
                        alwaysShowTooltip
                      >
                        {sidecarConnectorName ?? sidecar?.spec?.connectorRef}
                      </Text>
                      {getMultiTypeFromValue(sidecar?.spec?.connectorRef) === MultiTypeInputType.FIXED && (
                        <Icon name="full-circle" size={8} color={sideCarConnectionColor} />
                      )}
                    </div>
                    <div className={css.locationField}>
                      <Text width={340} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        <span className={css.noWrap}>{sidecar?.spec?.imagePath}</span>
                      </Text>
                    </div>
                    {overrideSetIdentifier?.length === 0 && !isReadonly && (
                      <span>
                        <Layout.Horizontal>
                          <Button
                            icon="Edit"
                            minimal
                            iconProps={{ size: 18 }}
                            onClick={() => {
                              editArtifact(ModalViewFor.SIDECAR, sidecar?.type as ArtifactType, index)
                            }}
                          />
                          <Button
                            iconProps={{ size: 18 }}
                            icon="main-trash"
                            minimal
                            onClick={() => removeSidecar(index)}
                          />
                        </Layout.Horizontal>
                      </span>
                    )}
                  </section>
                )
              })}
            </section>
          )}
        </Layout.Vertical>
      </Layout.Vertical>

      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {!primaryArtifact && overrideSetIdentifier?.length === 0 && !isReadonly && (
          <Button
            className={css.addArtifact}
            id="add-artifact"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={() => addNewArtifact(ModalViewFor.PRIMARY)}
            text={getString('pipelineSteps.serviceTab.artifactList.addPrimary')}
          />
        )}
        {!overrideSetIdentifier?.length && !isReadonly && (
          <Button
            className={css.addArtifact}
            id="add-artifact"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}
            text={getString('pipelineSteps.serviceTab.artifactList.addSidecar')}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ArtifactListView
