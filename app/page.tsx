"use client";

import HeroLanding from "./components/heroLanding";
import Form from "./form/formlayout";
import PictureComponent from "./components/pictureComponent";
import PromoCard from "./components/promoCard";
import { LUNCH_PROMO_DISPLAY } from "./lib/lunchPromo";

export default function Home() {
  return (
    <>
      <HeroLanding />
      <section className="w-full grid grid-cols-1 gap-5 py-6 px-4 sm:px-6 md:grid-cols-2 md:grid-rows-2 md:items-stretch md:gap-6 md:py-8 md:px-8">
        <PictureComponent className="order-1 md:order-none md:row-start-1 md:col-start-1 md:h-full md:min-h-0" />
        <div className="order-2 md:order-none md:row-start-2 md:col-start-1 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 md:h-full md:min-h-0">
          <PromoCard
            title="20% off for lunch Monday to Friday"
            description="Book online for weekday lunch and enjoy 20% off your bill. Valid Monday to Friday, 11:00–15:00."
            secondary="Enter the code when you reserve and we’ll apply it when confirming your booking."
            code={LUNCH_PROMO_DISPLAY}
            className="md:h-full md:min-h-0"
          />
          <PromoCard
            eyebrow="Lunch Deal"
            title="Lunch Pizza with soft drink 12£"
            description="A lunchtime classic — pizza paired with a soft drink for twelve pounds."
            className="md:h-full md:min-h-0"
          />
        </div>
        <div className="order-3 md:order-none md:row-start-1 md:row-span-2 md:col-start-2 md:flex md:flex-col md:h-full md:min-h-0">
          <Form />
        </div>
      </section>
    </>
  );
}
