"use client";

import HeroLanding from "./components/heroLanding";
import Form from "./form/formlayout";
import PictureComponent from "./components/pictureComponent";

export default function Home() {
  return (
    <>
      <HeroLanding />
      <section className="w-full grid grid-cols-1 gap-5 py-6 px-4 sm:px-6 md:grid-cols-2 md:items-stretch md:gap-6 md:py-8 md:px-8">
        <PictureComponent className="md:h-full md:min-h-0" />
        <div className="md:flex md:flex-col md:h-full md:min-h-0">
          <Form />
        </div>
      </section>
    </>
  );
}
