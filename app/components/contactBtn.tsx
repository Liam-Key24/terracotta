"use client";

import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";

export default function ContactBtn() {
  return (
    <>
      <a
        href="/contact"
        className="group w-1/3 h-fit flex space-x-2 p-2 md:p-3 items-center justify-center bg-[#631732]/70 backdrop-blur-md border border-white/20 text-white font-medium rounded-2xl 
hover:-translate-y-1 hover:translate-x-2 hover:bg-[#631732]/90
transition-transform duration-300 ease-in-out"
      >
        <span className="text-lg md:text-2xl">Contact</span>

        <ArrowRightIcon className="group-hover:hidden" />

        <ArrowUpRightIcon className="hidden group-hover:block" />
      </a>
    </>
  );
}
