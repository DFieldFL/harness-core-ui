import React from 'react'
import cssDefault from '../DefaultNode.module.scss'
import css from './DiamondNode.module.scss'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import type { DiamondNodeModel } from './DiamondNodeModel'
import { DefaultPortLabel } from '../../port/DefaultPortLabelWidget'
import type { DefaultPortModel } from '../../port/DefaultPortModel'
import { Icon, Text } from '@wings-software/uikit'
import cx from 'classnames'

export interface DiamondNodeProps {
  node: DiamondNodeModel
  engine: DiagramEngine
}

const generatePort = (port: DefaultPortModel, props: DiamondNodeProps): JSX.Element => {
  return <DefaultPortLabel engine={props.engine} port={port} key={port.getID()} />
}

export const DiamondNodeWidget = (props: DiamondNodeProps): JSX.Element => {
  const options = props.node.getOptions()
  return (
    <div className={cssDefault.defaultNode}>
      <div
        className={cx(cssDefault.defaultCard, css.diamond, { [cssDefault.selected]: props.node.isSelected() })}
        style={{ backgroundColor: options.backgroundColor }}
      >
        {options.icon && <Icon size={28} name={options.icon} />}
        {props.node.getInPorts().map(port => generatePort(port, props))}
        {props.node.getOutPorts().map(port => generatePort(port, props))}
      </div>
      <Text
        font={{ size: 'normal', align: 'center' }}
        style={{ cursor: 'pointer' }}
        padding="small"
        width={125}
        lineClamp={1}
      >
        {options.name}
      </Text>
    </div>
  )
}
