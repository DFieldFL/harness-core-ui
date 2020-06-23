import * as React from 'react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import type { CreateNewModel } from './CreateNewModel'
import { Icon } from '@blueprintjs/core'
import css from './CreateNew.module.scss'
import cssDefault from '../DefaultNode.module.scss'

import cx from 'classnames'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import { Text } from '@wings-software/uikit'

export interface CreateNewWidgetProps {
  node: CreateNewModel
  engine: DiagramEngine
}
const generatePort = (port: DefaultPortModel, props: CreateNewWidgetProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

export const CreateNewWidget: React.FC<CreateNewWidgetProps> = (props): JSX.Element => {
  const options = props.node.getOptions()
  return (
    <div className={cx(cssDefault.defaultNode, css.createNode)}>
      <div
        className={cx(cssDefault.defaultCard, css.createNew, { [cssDefault.selected]: props.node.isSelected() })}
        style={{ backgroundColor: options.backgroundColor, width: options.width, height: options.height }}
      >
        <div>
          <Icon icon="plus" iconSize={10} color={'var(--diagram-grey)'} />

          <div>
            <div>{props.node.getInPorts().map(port => generatePort(port, props))}</div>
            <div>{props.node.getOutPorts().map(port => generatePort(port, props))}</div>
          </div>
        </div>
        {options.name && (
          <Text
            font={{ size: 'small', align: 'center' }}
            className={css.label}
            padding="xsmall"
            width={props.node.width - 10}
            lineClamp={1}
          >
            {options.name}
          </Text>
        )}
      </div>
    </div>
  )
}
