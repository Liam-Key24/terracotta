'use client'

interface MenuItem {
  name: string
  description?: string
  price?: string
}

interface MenuSectionProps {
  title: string
  items: MenuItem[]
  imagePath: string
  imageHeight?: string
  reverseOnMobile?: boolean
  itemLayout?: 'description' | 'price'
  gridCols?: 1 | 2
  imageBgPosition?: 'center' | 'bottom'
}

export default function MenuSection({
  title,
  items,
  imagePath,
  imageHeight = '50vh',
  reverseOnMobile = false,
  itemLayout = 'description',
  gridCols = 1,
  imageBgPosition = 'center',
}: MenuSectionProps) {
  const mobileDirection = reverseOnMobile ? 'flex-col-reverse' : 'flex-col'

  const sectionId = `menu-section-${title.toLowerCase().replace(/\s+/g, '-')}`

  const imageSection = (
    <div className="relative inset-0 w-full md:w-1/2" aria-label={`${title} menu section image`}>
      <div className="absolute inset-0 z-30 flex justify-center items-center">
        <h2 id={sectionId} className="text-3xl sm:text-4xl md:text-5xl text-white/80 px-4 text-center">
          {title}
        </h2>
      </div>
      {/* Mobile image */}
      <div
        className="relative inset-0 bg-cover rounded-lg md:hidden"
        style={{
          backgroundImage: `url(${imagePath})`,
          backgroundPosition: imageBgPosition,
          height: '12.5rem',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-xs rounded-lg md:hidden"
        style={{
          height: '12.5rem',
        }}
        aria-hidden="true"
      />
      {/* Desktop image */}
      <div className="hidden md:block relative">
        <div
          className="relative inset-0 bg-cover rounded-lg"
          style={{
            backgroundImage: `url(${imagePath})`,
            backgroundPosition: imageBgPosition,
            height: imageHeight,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-xs rounded-lg"
          style={{
            height: imageHeight,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )

  const itemsSection = (
    <section
      className={`w-full md:w-1/2 grid grid-cols-1 ${
        gridCols === 2 ? 'md:grid-cols-2' : ''
      } gap-3 md:gap-4 ${
        itemLayout === 'description'
          ? 'md:text-center place-content-center text-center'
          : 'place-content-center text-center'
      }`}
      aria-label={`${title} menu items`}
    >
      {items.map((item) => (
        <article
          key={item.name}
          className={
            itemLayout === 'price'
              ? 'w-full h-auto flex flex-row items-center justify-center text-orange-700 gap-2'
              : 'space-y-1'
          }
        >
          <h3 className="text-lg sm:text-xl md:text-2xl text-orange-700">{item.name}</h3>
          {itemLayout === 'description' && item.description && (
            <p className="text-xs sm:text-sm md:text-lg italic">{item.description}</p>
          )}
          {itemLayout === 'price' && item.price && (
            <p className="text-xs sm:text-sm md:text-lg italic text-orange-700/70">
              {item.price}
            </p>
          )}
        </article>
      ))}
    </section>
  )

  return (
    <article
      className={`w-full h-auto flex ${mobileDirection} md:flex-row md:space-x-6 lg:space-x-10 space-y-6 md:space-y-0`}
      aria-labelledby={sectionId}
    >
      {imageSection}
      {itemsSection}
    </article>
  )
}
