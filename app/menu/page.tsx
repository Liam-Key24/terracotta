'use client'

import { useState } from 'react'

import { foodData } from '../data/foodData'
import { drinksData } from '../data/drinksData'

import MenuSectionWrapper from './component/MenuSectionWrapper'
import { CtaLinkButton } from '../components/CtaLinkButton'
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'

export default function Menu() {
  const [activeTab, setActiveTab] = useState<'menu' | 'wine' | 'drink'>('menu')

  const tabs = [
    { id: 'menu', label: 'Menu' },
    { id: 'wine', label: 'Wine' },
    { id: 'drink', label: 'Drink' },
  ]
  const wineItems = ['red-wine', 'white-wine', 'rose-sangria', 'sparkling-champagne']
  const drinkItems = ['soft-drinks', 'cocktails', 'beers']

  return (
    <div className="mt-20 md:mt-40 space-y-8 md:space-y-20">
      <nav
        role="tablist"
        aria-label="Menu categories"
        className="flex justify-evenly"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => setActiveTab(tab.id as 'menu' | 'wine' | 'drink')}
            className={`text-3xl md:text-5xl text-center cursor-pointer transition ${
              activeTab === tab.id ? 'text-[#631732]' : ''
            }`}
          >
            <h1>{tab.label}</h1>
          </button>
        ))}
      </nav>

      <div className="space-y-5" role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
        {activeTab === 'menu' && foodData.map((item) => (
          <MenuSectionWrapper key={item.id} data={item} />
        ))}

        {activeTab === 'wine' && wineItems.map((id) => {
          const item = drinksData.find((d) => d.id === id)
          return item ? <MenuSectionWrapper key={id} data={item} /> : null
        })}

        {activeTab === 'drink' && drinkItems.map((id) => {
          const item = drinksData.find((d) => d.id === id)
          return item ? <MenuSectionWrapper key={id} data={item} /> : null
        })}
      </div>

      <div className="flex items-center justify-between w-full px-4 text-white">
        <button
          onClick={() => {
            if (activeTab === 'menu') setActiveTab('drink')
            if (activeTab === 'wine') setActiveTab('menu')
            if (activeTab === 'drink') setActiveTab('wine')
          }}
          disabled={activeTab === 'menu'}
          className="p-2 bg-[#631732]/80 border shadow-lg shadow-black/10 backdrop-blur-xl rounded-2xl hover:bg-[#631732]/90 hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:invisible"
        >
          <ArrowLeftIcon className='w-4 h-4 md:w-12 '/>
        </button>
        <div className="flex justify-center space-x-2 my-5" aria-label="Action buttons">
        <CtaLinkButton
          href="/#form"
          label="Book table"
          ariaLabel="Book a table"
          className="group w-32 md:w-56 h-fit py-2 md:p-3 flex items-center justify-center space-x-2 rounded-2xl bg-[#631732]/70 text-white"
          labelClassName="text-lg md:text-2xl pl-1"
        />
        <CtaLinkButton
          href="/contact"
          label="Contact"
          ariaLabel="Contact us"
          className="group w-32 md:w-56 h-fit py-2 md:p-3 flex items-center justify-center space-x-2 rounded-2xl bg-[#631732]/70 text-white"
        />
      </div>
        <button
          onClick={() => {
            if (activeTab === 'menu') setActiveTab('wine')
            if (activeTab === 'wine') setActiveTab('drink')
            if (activeTab === 'drink') setActiveTab('menu')
          }}
          disabled={activeTab === 'drink'}
          className="p-2 bg-[#631732]/80 border shadow-lg shadow-black/10 backdrop-blur-xl rounded-2xl hover:bg-[#631732]/90 hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:invisible  "
        >
          <ArrowRightIcon className='w-4 h-4 md:w-12 '/>
        </button>
      </div>

     

      <div className="w-4/5 mx-auto">
        <p className="text-xs opacity-80 text-center italic" role="note">
          Please note that while we take great care in our kitchen, we cannot guarantee that any
          dish is completely free from allergens or cross contamination. If you have any food
          allergies or dietary requirements, please speak to a member of our team before ordering
          or contact us.
        </p>
      </div>
    </div>
  )
}
