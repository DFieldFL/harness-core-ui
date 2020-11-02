import React from 'react'
import { parse } from 'yaml'
import { Prompt, useHistory } from 'react-router-dom'
import type { IconName } from '@blueprintjs/core'
import type * as History from 'history'
import { YamlEntity } from '@common/constants/YamlConstants'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { addIconInfoToSnippets } from '@common/components/YAMLBuilder/YAMLBuilderUtils'
import { YAMLService } from '@common/services'
import type { SnippetInterface } from '@common/interfaces/SnippetInterface'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { useToaster } from '../../../../10-common/components/Toaster/useToaster'
import css from './PipelineYamlView.module.scss'

const PipelineYamlView: React.FC = () => {
  const {
    state: { pipeline },
    updatePipeline,
    stepsFactory,
    setYamlHandler: setYamlHandlerContext
  } = React.useContext(PipelineContext)
  const { showError } = useToaster()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  React.useEffect(() => {
    fetchSnippets()
  })
  const history = useHistory()
  const [isYamlUpdated, setYamlUpdated] = React.useState(false)
  const [snippets, setSnippets] = React.useState<SnippetInterface[]>()

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  const fetchSnippets = (query?: string): void => {
    const { error, response: snippetsList } = YAMLService.fetchSnippets(YamlEntity.PIPELINE, query) || {}
    if (error) {
      showError(error)
      return
    }
    addIconInfoToSnippets('command-shell-script' as IconName, snippetsList)
    setSnippets(snippetsList)
  }

  return (
    <div className={css.yamlBuilder}>
      <Prompt
        when={true}
        message={(nextLocation: History.Location) => {
          if (yamlHandler && !isYamlUpdated) {
            updatePipeline(parse(yamlHandler.getLatestYaml()).pipeline).then(() => {
              setYamlUpdated(true)
              history.push(nextLocation.pathname)
            })
            return false
          }
          return true
        }}
      />
      <YAMLBuilder
        fileName="DeploymentPipeline.yaml"
        entityType={YamlEntity.PIPELINE}
        existingJSON={{ pipeline }}
        bind={setYamlHandler}
        height={'calc(100vh - 200px)'}
        snippets={snippets}
        onSnippetSearch={fetchSnippets}
        invocationMap={stepsFactory.getInvocationMap()}
        showSnippetSection={false}
      />
    </div>
  )
}

export default PipelineYamlView
