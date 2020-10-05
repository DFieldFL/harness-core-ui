import type {
  DiagramModelOptions as DiagramModelCoreOptions,
  BaseModel,
  LayerModel
} from '@projectstorm/react-canvas-core'
import { isNil } from 'lodash-es'
import {
  DiagramModel as DiagramModelCore,
  DiagramModelGenerics as DiagramModelGenericsCore,
  NodeLayerModel
} from '@projectstorm/react-diagrams-core'
import type { Point } from '@projectstorm/geometry'
import { DefaultLinkModel } from '../link/DefaultLinkModel'
import { DefaultNodeModel } from '../node/DefaultNodeModel'
import { StepGroupNodeLayerModel } from '../node-layer/StepGroupNodeLayerModel'
import { EmptyNodeModel } from '../node/EmptyNode/EmptyNodeModel'
import { PortName } from '../Constants'
import css from './DiagramModel.module.scss'

export interface DiagramModelOptions extends DiagramModelCoreOptions {
  autoPosition?: boolean
  startX?: number
  startY?: number
  gap?: number
}

export interface DiagramModelGenerics extends DiagramModelGenericsCore {
  OPTIONS: DiagramModelOptions
}

export class DiagramModel<G extends DiagramModelGenerics = DiagramModelGenerics> extends DiagramModelCore<G> {
  autoPosition: boolean
  startX: number
  startY: number
  gap: number
  stepGroupLayers: StepGroupNodeLayerModel[] = []

  constructor(options: G['OPTIONS'] = {}) {
    super(options)
    options.gridSize = 100
    this.autoPosition = options.autoPosition || true
    this.startX = options.startX || 100
    this.startY = options.startY || 100
    this.gap = options.gap || 200
  }

  clearAllLinksForNode(id: string): void {
    const node = this.getNodeFromId(id)
    if (node) {
      const ports = node.getPorts()
      for (const portKey in ports) {
        const port = ports[portKey]
        const links = port.getLinks()
        for (const keyLink in links) {
          const link = links[keyLink]
          link.remove()
        }
      }
    }
  }

  clearAllNodesAndLinks(): void {
    const links = this.getActiveLinkLayer().getLinks()
    for (const key in links) {
      const link = links[key]
      link.remove()
    }
    const nodes = this.getActiveNodeLayer().getNodes()
    for (const key in nodes) {
      const node = nodes[key]
      node.remove()
    }
    this.stepGroupLayers.forEach(layer => layer.remove())
  }

  addLayer(layer: LayerModel): void {
    super.addLayer(layer)
    this.layers = this.layers.sort((lay: LayerModel) => (lay.getOptions().isSvg ? 1 : -1))
  }

  useStepGroupLayer(stepGroupLayers: StepGroupNodeLayerModel): void {
    if (this.stepGroupLayers.indexOf(stepGroupLayers) === -1) {
      this.stepGroupLayers.push(stepGroupLayers)
      this.addLayer(stepGroupLayers)
    }
    this.activeNodeLayer = stepGroupLayers
  }

  useNormalLayer(): void {
    const layers = this.getNodeLayers()
    layers.forEach(layer => {
      if (layer instanceof NodeLayerModel) {
        this.activeNodeLayer = layer
      }
    })
  }

  checkNodeNotAdded(node: DefaultNodeModel | undefined): boolean {
    const nodeId = node?.getID()
    const nodeRendered = this.getNode(nodeId || '')
    return isNil(nodeRendered)
  }

  protected connectedParentToNode(
    node: DefaultNodeModel,
    parent: DefaultNodeModel,
    allowAdd = true,
    strokeDasharray = 0,
    color = 'var(--diagram-link)',
    highestMidX?: number
  ): void {
    const inPort = node.getPort(PortName.In) || node.addInPort(PortName.In)
    const links = inPort.getLinks()
    let isConnectedToParent = false
    for (const linkId in links) {
      const link = links[linkId] as DefaultLinkModel
      const nodeId = link.getSourcePort().getNode().getID()
      if (nodeId === parent.getID()) {
        isConnectedToParent = true
        link.setColorOfLink(color)
      }
    }
    if (!isConnectedToParent) {
      const parentPort = parent.getPort(PortName.Out) || parent.addOutPort(PortName.Out)
      if (parentPort && inPort) {
        const link = new DefaultLinkModel({ allowAdd, strokeDasharray, color, midXAngle: highestMidX })
        link.setSourcePort(parentPort)
        link.setTargetPort(inPort)
        this.addLink(link)
      }
    }
  }

  protected connectMultipleParentsToNode(
    node: DefaultNodeModel,
    parents: DefaultNodeModel[],
    allowAdd = true,
    strokeDasharray = 0,
    color = 'var(--diagram-link)'
  ): void {
    let highestMidX = 0
    parents.forEach(parent => {
      const inPort = node.getPort(PortName.In) || node.addInPort(PortName.In)
      const parentPort = parent.getPort(PortName.Out) || parent.addOutPort(PortName.Out)
      const midX =
        parent instanceof EmptyNodeModel
          ? (inPort.getPosition().x + parentPort.getPosition().x) / 2
          : (inPort.getPosition().x + parentPort.getPosition().x + this.gap / 2) / 2
      if (midX > highestMidX) {
        highestMidX = midX
      }
    })
    parents.forEach(parent => {
      this.connectedParentToNode(node, parent, allowAdd, strokeDasharray, color, highestMidX)
    })
  }

  getNodeLinkAtPosition(position: Point): BaseModel | undefined {
    const nodes = this.getActiveNodeLayer().getNodes()
    const nearByNodes: DefaultNodeModel[] = []
    for (const key in nodes) {
      const node = nodes[key] as DefaultNodeModel
      const dom = document.querySelector(`[data-nodeid="${node.getID()}"]`)
      if (node.getBoundingBox().containsPoint(position)) {
        nearByNodes.push(node)
      }
      dom?.classList.remove(css.selected)
    }

    const links = this.getActiveLinkLayer().getLinks()
    const nearByLinks: DefaultLinkModel[] = []
    for (const key in links) {
      const link = links[key] as DefaultLinkModel
      const dom = document.querySelector(`[data-linkid="${link.getID()}"]`)
      if (link.getBoundingBox().containsPoint(position)) {
        nearByLinks.push(link)
      }
      dom?.classList.remove(css.selectedLink)
    }
    if (nearByNodes.length === 1) {
      return nearByNodes[0]
    } else if (nearByLinks.length === 1) {
      return nearByLinks[0]
    }
    return undefined
  }

  highlightNodesAndLink(position: Point): BaseModel | undefined {
    const nodeLink = this.getNodeLinkAtPosition(position)
    if (nodeLink instanceof DefaultNodeModel) {
      const dom = document.querySelector(`[data-nodeid="${nodeLink.getID()}"]`)
      dom?.classList.add(css.selected)
    } else if (nodeLink instanceof DefaultLinkModel) {
      const dom = document.querySelector(`[data-linkid="${nodeLink.getID()}"]`)
      dom?.classList.add(css.selectedLink)
    }
    return nodeLink
  }

  getGroupLayer(id: string): StepGroupNodeLayerModel | undefined {
    return this.stepGroupLayers.filter(layer => layer.getID() === id)[0]
  }

  getNodeFromId(id: string): DefaultNodeModel | undefined {
    let node: DefaultNodeModel | undefined = undefined
    this.layers.forEach(layer => {
      if (layer instanceof NodeLayerModel || layer instanceof StepGroupNodeLayerModel) {
        const nodes = layer.getNodes()
        if (nodes[id]) {
          node = nodes[id]
        }
      }
    })
    return node
  }
}
