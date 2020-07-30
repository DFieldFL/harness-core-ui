import React from 'react'
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core'
import { Button } from '@wings-software/uikit'
import cx from 'classnames'
import type { DefaultPortModel } from './DefaultPortModel'
import css from './DefaultPort.module.scss'

export interface DefaultPortLabelProps {
  port: DefaultPortModel
  engine: DiagramEngine
}

export const DefaultPortLabel = (props: DefaultPortLabelProps): JSX.Element => {
  return (
    <div
      className={cx(
        css.port,
        { [css.portIn]: props.port.getOptions().in },
        { [css.portOut]: !props.port.getOptions().in }
      )}
    >
      <PortWidget engine={props.engine} port={props.port}>
        <Button intent="primary" className={css.portBtn} minimal icon="circle" iconProps={{ size: 8 }} />
      </PortWidget>
    </div>
  )
}
