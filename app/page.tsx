"use client";

import HeroLanding from "./components/heroLanding";
import Form from "./form/formlayout";
import PictureComponent from "./components/pictureComponent";
import PromoCard from "./components/promoCard";

export default function Home() {
  return (
    <>
      <HeroLanding />
      <section className="w-full grid grid-cols-1 gap-5 py-6 px-4 sm:px-6 md:grid-cols-2 md:grid-rows-2 md:items-stretch md:gap-6 md:py-8 md:px-8">
        <PromoCard className="md:row-start-2 md:col-start-1 md:h-full md:min-h-0" />
        <div className="md:row-start-1 md:row-span-2 md:col-start-2 md:flex md:flex-col md:h-full md:min-h-0">
          <Form />
        </div>
        <PictureComponent className="md:row-start-1 md:col-start-1 md:h-full md:min-h-0" />
      </section>
    </>
  );
}
