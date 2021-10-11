import type { ChangeEventDTO } from 'services/cv'

export const createDetailsTitle = (type?: string, category?: string) => {
  switch (category) {
    case category:
      return `${type} ${category} `
    default:
      return ''
  }
}

export const getOnClickOptions = (detailsItem: { name: string | ChangeEventDTO['type']; url?: string }) => {
  if (typeof detailsItem !== 'string' && detailsItem?.url) {
    return {
      onClick: () => window.open(detailsItem?.url, '_blank')
    }
  }
  return {}
}
