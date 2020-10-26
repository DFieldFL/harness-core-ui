import React, { useCallback } from 'react'
import { Layout, ButtonGroup, Button } from '@wings-software/uikit'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import cx from 'classnames'
import i18n from './CanvasButtons.i18n'
import css from './CanvasButtons.module.scss'

export enum CanvasButtonsActions {
  ZoomIn,
  ZoomOut,
  Reset,
  ZoomToFit
}

interface CanvasButtonsProps {
  engine: DiagramEngine
  className?: string
  callback?: (action: CanvasButtonsActions) => void
}

export const CanvasButtons: React.FC<CanvasButtonsProps> = ({ engine, callback, className = '' }) => {
  const zoomToFit = useCallback(() => {
    engine.zoomToFit()
    callback?.(CanvasButtonsActions.ZoomToFit)
  }, [engine, callback])

  const zoomReset = useCallback(() => {
    engine.getModel().setZoomLevel(100)
    engine.getModel().setOffset(0, 0)
    engine.repaintCanvas()
    callback?.(CanvasButtonsActions.ZoomToFit)
  }, [engine, callback])

  const zoomIn = useCallback(() => {
    const zoomLevel = engine.getModel().getZoomLevel()
    engine.getModel().setZoomLevel(zoomLevel + 20)
    engine.repaintCanvas()
    callback?.(CanvasButtonsActions.ZoomIn)
  }, [engine, callback])

  const zoomOut = useCallback(() => {
    const zoomLevel = engine.getModel().getZoomLevel()
    engine.getModel().setZoomLevel(zoomLevel - 20)
    engine.repaintCanvas()
    callback?.(CanvasButtonsActions.ZoomOut)
  }, [engine, callback])

  return (
    <span className={cx(css.canvasButtons, className)}>
      <Layout.Vertical spacing="medium" id="button-group">
        <ButtonGroup>
          <Button icon="canvas-position" tooltip={i18n.zoomToFit} onClick={zoomToFit} />
        </ButtonGroup>
        <ButtonGroup>
          <Button icon="canvas-selector" tooltip={i18n.reset} onClick={zoomReset} />
        </ButtonGroup>
        <span className={css.verticalButtons}>
          <ButtonGroup>
            <Button icon="zoom-in" tooltip={i18n.zoomIn} onClick={zoomIn} />
            <Button icon="zoom-out" tooltip={i18n.zoomOut} onClick={zoomOut} />
          </ButtonGroup>
        </span>
      </Layout.Vertical>
    </span>
  )
}
