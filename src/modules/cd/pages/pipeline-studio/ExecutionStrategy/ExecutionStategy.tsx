import React, { useState, useEffect } from 'react'
import YAML from 'yaml'
import { Text, Icon, Layout, Button, Card, IconName } from '@wings-software/uikit'
import { get } from 'lodash-es'
import { useGet } from 'restful-react'
import cx from 'classnames'
import i18n from './ExecutionStrategy.i18n'
import { getConfig } from '../../../../../services/config'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import BlueGreen from './images/BlueGreen.png'
import Rolling from './images/Rolling.png'
import Canary from './images/Canary.png'
import BlankCanvas from './images/BlankCanvas.png'
import css from './ExecutionStrategy.module.scss'

export interface ExecutionStrategyProps {
  selectedStage: object
}

const iconMap: { [key: string]: IconName } = {
  Rolling: 'rolling',
  Canary: 'canary',
  BlueGreen: 'bluegreen',
  BlankCanvas: 'step-group'
}

const infoByType: { [key: string]: string } = {
  BlueGreen:
    'With Blue/Green Deployment, two identical environments called blue (staging) and green (production) run simultaneously with different versions or service/artifact. QA and UAT are typically done on the blue environment. When satisfied, traffic is flipped (via a load balancer) from the green environment (current version) to the blue environment (new version). You can then decommission the old environment once deployment is successful.',
  Rolling:
    'In a Rolling Deployment Strategy, the deployed artifact will be spun up incrementally until the desired count is met. As new ones spin up, the older version gets terminated.',
  Canary:
    'In a Canary Deployment, the new artifact is deployed in the target environment and is incrementally updated based on the testing and verification in each phase.',
  BlankCanvas:
    'With a blank canvas, you get to orchestrate your deployment with any combination of steps from the palette. It allows maximum flexibility - only recommended for advanced users.'
}

const imageByType: { [key: string]: string } = {
  BlueGreen,
  Rolling,
  Canary,
  BlankCanvas
}

export const ExecutionStrategy: React.FC<ExecutionStrategyProps> = ({ selectedStage }): JSX.Element => {
  const {
    state: { pipeline, pipelineView },
    updatePipeline,
    updatePipelineView
  } = React.useContext(PipelineContext)

  const [strategiesByDeploymentType, setStrategies] = useState([])
  const [isSubmitDisabled, disableSubmit] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState('Rolling')
  const serviceDefinationType = get(selectedStage, 'stage.spec.service.serviceDefinition.type', 'Kubernetes')

  const { data: strategies } = useGet({
    path: `/pipelines/strategies`,
    base: getConfig('ng/api')
  })

  useEffect(() => {
    const _strategies = strategies?.data
    if (_strategies) {
      setStrategies(_strategies[serviceDefinationType])
    }
  }, [strategies?.data])

  const BlankCanvasType = 'BlankCanvas'

  const { data: yamlSnippet, error } = useGet({
    path: `/pipelines/strategies/yaml-snippets?serviceDefinitionType=${serviceDefinationType}&strategyType=${selectedStrategy}`,
    base: getConfig('ng/api')
  })

  useEffect(() => {
    if (error && selectedStrategy !== BlankCanvasType) {
      disableSubmit(true)
    } else {
      disableSubmit(false)
    }
  }, [error])

  useEffect(() => {
    if (yamlSnippet?.data && selectedStrategy !== BlankCanvasType) {
      const selectedStageSpec = get(selectedStage, 'stage.spec', null)
      const jsonFromYaml = YAML.parse(yamlSnippet?.data)
      selectedStageSpec['execution'] = jsonFromYaml['execution']
      updatePipeline(pipeline)
    } else {
      const selectedStageSpec = get(selectedStage, 'stage.spec', null)
      const jsonFromYaml = {
        execution: {
          steps: [],
          rollbackSteps: []
        }
      }
      selectedStageSpec['execution'] = jsonFromYaml['execution']
      updatePipeline(pipeline)
    }
  }, [yamlSnippet?.data, selectedStrategy])

  return (
    <Layout.Vertical padding="xxlarge" spacing="large">
      <Layout.Horizontal>
        <Text font={{ size: 'medium' }} style={{ color: 'var(--grey-600)' }}>
          {i18n.heading}
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal>
        <Layout.Vertical width={500}>
          <section className={css.patterns}>
            <Text style={{ color: 'var(--grey-600)' }}>{i18n.commonPatterns}</Text>
            <section className={css.strategies}>
              {strategiesByDeploymentType.map((v: string) => (
                // <div>{v}</div>
                <Card
                  className={cx(css.card, selectedStrategy === v && css.active)}
                  elevation={0}
                  key={v}
                  interactive={true}
                  onClick={() => setSelectedStrategy(v)}
                >
                  <Icon name={iconMap[v] as IconName} size={24} />
                  <section className={css.strategyName}>{v.replace(/([a-z])([A-Z])/g, '$1 $2')}</section>
                  <section className={css.strategyType}>{i18n.strategyType}</section>
                </Card>
              ))}
            </section>
          </section>
          <section className={css.patterns}>
            <Text style={{ color: 'var(--grey-600)' }}>{i18n.letMeExplore}</Text>
            <section className={css.strategies}>
              <Card
                className={cx(css.card, selectedStrategy === BlankCanvasType && css.active)}
                elevation={0}
                interactive={true}
                onClick={() => setSelectedStrategy(BlankCanvasType)}
              >
                <Icon name={iconMap[BlankCanvasType] as IconName} size={24} />
                <section className={css.strategyName} style={{ marginTop: 'var(--spacing-large)' }}>
                  {i18n.blankCanvas}
                </section>
              </Card>
            </section>
          </section>
          <Button
            intent="primary"
            text={i18n.selectBtn}
            className={css.selectBtn}
            onClick={() =>
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.ExecutionStrategy }
              })
            }
            disabled={isSubmitDisabled}
          />
        </Layout.Vertical>
        <Layout.Vertical width={500}>
          <section className={css.preview}>
            <Text style={{ color: 'var(--grey-600)' }}>{i18n.preview}</Text>
            <section className={css.previewContainer}>
              <Layout.Horizontal padding="xlarge" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Text font={{ size: 'medium' }} style={{ color: 'var(--grey-700)' }}>
                  {selectedStrategy.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </Text>
                <Icon name={iconMap[selectedStrategy] as IconName} size={24} />
              </Layout.Horizontal>
              <section className={css.info}>{infoByType[selectedStrategy]}</section>
              <section className={css.image}>
                <img src={imageByType[selectedStrategy]} />
              </section>
            </section>
          </section>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
