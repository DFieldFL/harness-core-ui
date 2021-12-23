import type { CountServiceDTO } from 'services/cv'
import type { DependencyData } from '@cv/components/DependencyGraph/DependencyGraph.types'
import type { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import type { NewMonitoredServiceListItemDTO } from '../MonitoredServiceListView/MonitoredServiceListView.types'

// ServiceDependencyGraph

export interface ServiceDependencyGraphProps {
  isPageView?: boolean
  serviceIdentifier?: string
  environmentIdentifier?: string
  selectedFilter?: FilterTypes
  onFilter?: (type: FilterTypes) => void
  createButton?: JSX.Element
  serviceCountData?: CountServiceDTO | null
  serviceCountLoading?: boolean
  serviceCountErrorMessage?: string
  refetchServiceCountData?: () => void
}

export interface ServicePoint {
  sticky?: {
    element: any
  }
  serviceRef?: string
  environmentRef?: string
  destroySticky: () => void
}

// SummaryCard

export interface SummaryCardProps {
  isPageView?: boolean
  point?: ServicePoint
  onToggleService: (identifier: string, checked: boolean) => Promise<void>
  onDeleteService: (identifier: string) => Promise<void>
}

export interface SummaryCardContentProps extends Omit<SummaryCardProps, 'point'> {
  monitoredService: NewMonitoredServiceListItemDTO
}

export interface ServiceActionsProps extends Omit<SummaryCardContentProps, 'isPageView'> {
  onEditService: () => void
}

// CardView

export interface CardViewProps {
  point?: ServicePoint
  setPoint: (point?: ServicePoint) => void
  loading?: boolean
  errorMessage?: string
  retryOnError: () => void
  monitoredServiceDependencyData: DependencyData | null
  onToggleService: (identifier: string, checked: boolean) => Promise<void>
  onDeleteService: (identifier: string) => Promise<void>
}

// PageView

export interface PageViewProps extends CardViewProps {
  selectedFilter?: FilterTypes
  onFilter?: (type: FilterTypes) => void
  serviceCountData?: CountServiceDTO | null
  createButton?: JSX.Element
}

export type PageViewContentProps = Omit<CardViewProps, 'loading' | 'errorMessage' | 'retryOnError'>
