'use client'

import MenuSection from './MenuSection'

interface MenuData {
  id: string
  title: string
  items: Array<{ name: string; description?: string; price?: string }>
  imagePath: string
  imageHeight: string
  itemLayout: string
  gridCols: number
  imageBgPosition: string
}

interface MenuSectionWrapperProps {
  data: MenuData | undefined
}

export default function MenuSectionWrapper({ data }: MenuSectionWrapperProps) {
  if (!data) return null

  return (
    <MenuSection
      title={data.title}
      items={data.items}
      imagePath={data.imagePath}
      imageHeight={data.imageHeight}
      itemLayout={data.itemLayout as 'description' | 'price'}
      gridCols={data.gridCols as 1 | 2}
      imageBgPosition={data.imageBgPosition as 'center' | 'bottom'}
    />
  )
}
