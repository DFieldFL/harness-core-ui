import { getRiskLabelStringId } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { TransactionMetric } from 'services/cv'

export function getRiskDisplayName(
  risk: TransactionMetric['risk'],
  getString: UseStringsReturn['getString']
): string | undefined {
  return getString(getRiskLabelStringId(risk))
}
