'use client'

import { useState } from 'react'

import TapasMenu from './component/tapasComponent'
import PizzaMenu from './component/pizzaComponent'
import PaellaMenu from './component/paellaComponent'
import TradMenu from './component/traditionalCompnt'
import SaladMenu from './component/saladComponent'
import DessertMenu from './component/dessertComponent'

import CocktailMenu from './component/cocktailComponent'
import RedWineMenu from './component/RedWineComponent'
import WhiteWineMenu from './component/whiteWineComponent'
import RoseSangriaMenu from './component/roseWineComponent'
import SparklingChampagneMenu from './component/sparkWineComponent'
import BeersMenu from './component/BeerComponent'
import SoftDrinksMenu from './component/SoftDrinkComponent'

import BookTableBtnPage from '../components/bookTablebtn-page'
import Contact from '../components/contactBtn'

export default function Menu() {
  const [activeTab, setActiveTab] = useState<'menu' | 'wine' | 'drink'>('menu')

  const tabs = [
    { id: 'menu', label: 'Menu' },
    { id: 'wine', label: 'Wine' },
    { id: 'drink', label: 'Drink' },
  ]

  return (
    <div className="mt-20 md:mt-40 space-y-8 md:space-y-20">

      <div className="flex justify-evenly">
        {tabs.map(tab => (
          <h1
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'menu' | 'wine' | 'drink')}
            className={`text-3xl md:text-5xl text-center cursor-pointer transition ${
              activeTab === tab.id ? 'text-orange-700' : ''
            }`}
          >
            {tab.label}
          </h1>
        ))}
      </div>

      <div className="space-y-5">
        {activeTab === 'menu' && (
          <>
            <TapasMenu />
            <PizzaMenu />
            <PaellaMenu />
            <TradMenu />
            <SaladMenu />
            <DessertMenu />
          </>
        )}

        {activeTab === 'wine' && (
          <>
            <RedWineMenu />
            <WhiteWineMenu />
            <RoseSangriaMenu />
            <SparklingChampagneMenu />
          </>
        )}

        {activeTab === 'drink' && (
          <>
            <SoftDrinksMenu />
            <CocktailMenu />
            <BeersMenu />
          </>
        )}
      </div>

      <div className="flex justify-center space-x-2 my-5">
        <BookTableBtnPage />
        <Contact />
      </div>

      <div className="w-4/5 mx-auto">
        <p className="text-xs opacity-80 text-center italic">
          Please note that while we take great care in our kitchen, we cannot guarantee that any dish is completely free from allergens or cross contamination. If you have any food allergies or dietary requirements, please speak to a member of our team before ordering or contact us.
        </p>
      </div>

    </div>
  )
}
