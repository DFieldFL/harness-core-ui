import React from 'react'
import { Layout, Text, Icon, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { String, useStrings } from 'framework/exports'
import { PredefinedOverrideSets } from '@pipeline/components/PredefinedOverrideSets/PredefinedOverrideSets'
import { getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { PageConnectorResponse, StageElementWrapper } from 'services/cd-ng'
import css from '../ArtifactsSelection.module.scss'

export enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}
type CreationType = 'Dockerhub' | 'Gcr'

interface ArtifactListViewProps {
  isForPredefinedSets?: boolean
  stage: StageElementWrapper | undefined
  overrideSetIdentifier?: string
  primaryArtifact: any
  sideCarArtifact: any
  addNewArtifact: (view: number) => void
  editArtifact: (view: number, type: CreationType, index?: number) => void
  removePrimary: () => void
  removeSidecar: (index: number) => void
  fetchedConnectorResponse: PageConnectorResponse | undefined
  accountId: string
}

const ArtifactListView: React.FC<ArtifactListViewProps> = props => {
  const { getString } = useStrings()
  const { color } = getStatus(
    props.primaryArtifact?.spec?.connectorRef,
    props.fetchedConnectorResponse,
    props.accountId
  )
  return (
    <Layout.Vertical>
      {props.isForPredefinedSets && <PredefinedOverrideSets context="ARTIFACT" currentStage={props.stage} />}

      <Layout.Vertical spacing="small">
        <div className={cx(css.artifactList, css.listHeader)}>
          <span></span>
          <span>{getString('artifactRepository')}</span>
          <span> {getString('location')}</span>
          <span></span>
          <span></span>
        </div>

        <Layout.Vertical>
          <section>
            {props.primaryArtifact && (
              <section className={cx(css.artifactList, css.rowItem)} key={'Dockerhub'}>
                <div>
                  <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                    Primary
                  </Text>
                </div>

                <div className={css.server}>
                  <Text
                    inline
                    icon={getConnectorIconByType(props.primaryArtifact.type)}
                    iconProps={{ size: 18 }}
                    width={180}
                    lineClamp={1}
                    style={{ color: Color.BLACK, fontWeight: 900 }}
                  >
                    {props.primaryArtifact.type}
                  </Text>

                  <Text width={200} icon="full-circle" iconProps={{ size: 10, color }} />
                </div>
                <div>
                  <Text width={110} lineClamp={1} style={{ color: Color.GREY_500 }}>
                    {props.primaryArtifact?.spec?.imagePath}
                  </Text>
                </div>
                <div>{/* WIP artifact validation */}</div>
                {props.overrideSetIdentifier?.length === 0 && (
                  <span>
                    <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                      <Icon
                        name="Edit"
                        size={16}
                        onClick={() => props.editArtifact(ModalViewFor.PRIMARY, props.primaryArtifact.type)}
                      />
                      {/* <Icon
                              name="main-clone"
                              size={16}
                              style={{ cursor: 'pointer' }}
                              className={css.cloneIcon}
                              // onClick={() => cloneArtifact(manifest)}
                            /> */}
                      <Icon name="bin-main" size={25} onClick={props.removePrimary} />
                    </Layout.Horizontal>
                  </span>
                )}
              </section>
            )}
          </section>
          {props.sideCarArtifact?.length > 0 && (
            <section>
              {props?.sideCarArtifact.map(
                (
                  data: {
                    sidecar: {
                      type: string
                      identifier: string
                      spec: {
                        connectorRef: string
                        imagePath: string
                      }
                    }
                  },
                  index: number
                ) => {
                  const { sidecar } = data
                  const { color: sideCarConnectionColor } = getStatus(
                    sidecar?.spec?.connectorRef,
                    props.fetchedConnectorResponse,
                    props.accountId
                  )
                  return (
                    <section className={cx(css.artifactList, css.rowItem)} key={sidecar?.identifier + index}>
                      <div>
                        <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                          {getString('sidecar')}
                          <Text lineClamp={1} className={css.artifactId}>
                            ({getString('cf.targets.ID')}: {sidecar.identifier})
                          </Text>
                        </Text>
                      </div>
                      <div className={css.server}>
                        <Text
                          inline
                          icon={getConnectorIconByType(sidecar.type)}
                          iconProps={{ size: 18 }}
                          width={180}
                          lineClamp={1}
                          style={{ color: Color.BLACK, fontWeight: 900 }}
                        >
                          {sidecar.type}
                        </Text>

                        <Text width={200} icon="full-circle" iconProps={{ size: 10, color: sideCarConnectionColor }} />
                      </div>
                      <div>
                        <Text width={110} lineClamp={1} style={{ color: Color.GREY_500 }}>
                          {sidecar?.spec?.imagePath}
                        </Text>
                      </div>
                      <div>{/* WIP artifact validation */}</div>
                      {props.overrideSetIdentifier?.length === 0 && (
                        <span>
                          <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                            <Icon
                              name="Edit"
                              size={16}
                              onClick={() => {
                                props.editArtifact(ModalViewFor.SIDECAR, sidecar.type as CreationType, index)
                              }}
                            />
                            {/* <Icon
                                    name="main-clone"
                                    size={16}
                                    style={{ cursor: 'pointer' }}
                                    className={css.cloneIcon}
                                    // onClick={() => cloneArtifact(manifest)}
                                  /> */}
                            <Icon name="bin-main" size={25} onClick={() => props.removeSidecar(index)} />
                          </Layout.Horizontal>
                        </span>
                      )}
                    </section>
                  )
                }
              )}
            </section>
          )}
          {props.sideCarArtifact?.length > 0 && props.overrideSetIdentifier?.length === 0 && (
            <div className={css.paddingVertical}>
              <Text
                intent="primary"
                style={{ cursor: 'pointer' }}
                onClick={() => props.addNewArtifact(ModalViewFor.SIDECAR)}
              >
                <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
              </Text>
            </div>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical>
        {!props.primaryArtifact && props.overrideSetIdentifier?.length === 0 && (
          <div className={css.rowItem}>
            <Text onClick={() => props.addNewArtifact(ModalViewFor.PRIMARY)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addPrimary" />
            </Text>
          </div>
        )}
        {(!props.sideCarArtifact || props.sideCarArtifact?.length === 0) && props.overrideSetIdentifier?.length === 0 && (
          <div className={css.rowItem}>
            <Text onClick={() => props.addNewArtifact(ModalViewFor.SIDECAR)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
            </Text>
          </div>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ArtifactListView
