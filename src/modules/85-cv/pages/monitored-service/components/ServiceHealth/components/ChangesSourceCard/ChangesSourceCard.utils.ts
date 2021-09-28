import { Color } from '@wings-software/uicore'
import { ChangeSourceCategoryName } from '@cv/pages/monitored-service/components/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { UseStringsReturn } from 'framework/strings'
import type { CategoryCountDetails, ChangeSummaryDTO } from 'services/cv'
import type { ChangeSourceCardData, CategoryCountMapInterface } from './ChangesSourceCard.types'
import { changeLabel } from './ChangesSourceCard.constants'

const labelByCategory = (categoryType: string, getString: UseStringsReturn['getString']): string => {
  switch (categoryType) {
    case ChangeSourceCategoryName.INFRASTRUCTURE:
      return getString('infrastructureText')
    case ChangeSourceCategoryName.DEPLOYMENT:
      return getString('deploymentText')
    case ChangeSourceCategoryName.ALERT:
      return getString('cv.changeSource.tooltip.incident')
    case changeLabel:
      return getString('changes')
    default:
      return ''
  }
}

const createChangeSourceCardData = (
  category: CategoryCountDetails,
  categoryType: string,
  getString: UseStringsReturn['getString']
): ChangeSourceCardData => {
  const count = category?.count && isNaN(category?.count) ? 0 : category.count || 0
  const previousCount =
    category?.countInPrecedingWindow && isNaN(category?.countInPrecedingWindow)
      ? 0
      : category?.countInPrecedingWindow || 0
  const categoryPercentage: number = ((count - previousCount) / previousCount) * 100
  return {
    count,
    id: categoryType,
    label: labelByCategory(categoryType, getString),
    percentage: isNaN(categoryPercentage) ? 0 : categoryPercentage === Infinity ? 100 : categoryPercentage
  }
}

export const zeroIfUndefined = (item: number | undefined) => item || 0

export const calculateChangePercentage = (
  changeSummary: ChangeSummaryDTO | undefined,
  getString: UseStringsReturn['getString']
): ChangeSourceCardData[] => {
  if (changeSummary && changeSummary?.categoryCountMap) {
    const { categoryCountMap } = changeSummary
    const { Infrastructure, Deployment, Alert } = categoryCountMap as CategoryCountMapInterface
    const total = {
      count:
        zeroIfUndefined(Infrastructure?.count) + zeroIfUndefined(Deployment?.count) + zeroIfUndefined(Alert?.count),
      countInPrecedingWindow:
        zeroIfUndefined(Infrastructure?.countInPrecedingWindow) +
        zeroIfUndefined(Deployment?.countInPrecedingWindow) +
        zeroIfUndefined(Alert?.countInPrecedingWindow)
    }
    return [
      createChangeSourceCardData(total, changeLabel, getString),
      createChangeSourceCardData(Deployment, ChangeSourceCategoryName.DEPLOYMENT, getString),
      createChangeSourceCardData(Infrastructure, ChangeSourceCategoryName.INFRASTRUCTURE, getString),
      createChangeSourceCardData(Alert, ChangeSourceCategoryName.ALERT, getString)
    ]
  }
  return []
}

export const getTickerColor = (percentage: number): Color => (percentage > 0 ? Color.GREEN_600 : Color.RED_500)
