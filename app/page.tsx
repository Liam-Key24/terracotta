'use client'

import HeroLanding from "./components/heroLanding";
import OpenSection from "./layout/openNowSection"
import Form from "./form/formlayout";
export default function Home() {
  return (
    <>
      <HeroLanding/>
      <OpenSection/>
      <Form/>
    </>
  );
}
