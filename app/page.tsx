"use client";

import HeroLanding from "./components/heroLanding";
import OpenSection from "./layout/openNowSection";
import Form from "./form/formlayout";
import PictureComponent from "./components/pictureComponent";
export default function Home() {
  return (
    <>
      <HeroLanding />
      <div className="md:w-full md:h-full md:grid-cols-2 md:grid md:items-center">
        <div className="mt-2">
          <PictureComponent />
        </div>
        <Form />
      </div>
    </>
  );
}
