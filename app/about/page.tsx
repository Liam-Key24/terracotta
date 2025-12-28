import { CtaLinkButton } from "../components/CtaLinkButton";

export default function About() {
  return (
    <div className="relative min-h-screen pt-32 pb-16 px-6 md:px-12">
      <div className="absolute inset-0 h-[32vh] bg-[url(/assets/hero-background.avif)] bg-cover bg-center rounded-lg" />
      <div className="absolute inset-0 h-[32vh] bg-black/30 backdrop-blur-sm rounded-lg" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          About Terracotta
        </h1>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto mt-30 md:mt-50">
        <div className="space-y-6 text-gray-700 text-lg lg:text-xl leading-relaxed text-center">
          <p>
            Welcome to <span className="font-semibold">Terracotta</span>, where culinary excellence meets warm, friendly hospitality. 
            We are dedicated to crafting unforgettable dining experiences with every dish.
          </p>

          <p>
            Our menu celebrates the finest ingredients, traditional techniques, and innovative flavours, delivering a unique experience that honours the art of good food.
          </p>

          <p>
            Whether you&apos;re here for a special occasion, a business dinner, or simply a great meal, we look forward to welcoming you to <span className="font-semibold">Terracotta</span>.
          </p>
        </div>
        <div className="w-auto h-30 flex items-center justify-center space-x-3">
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
            <CtaLinkButton
              href="/menu"
              label="Menu"
              ariaLabel="View menu"
              className="group w-1/3 h-fit flex space-x-2 py-2 md:p-3 items-center justify-center bg-[#631732]/70 backdrop-blur-md border border-white/20 text-white font-medium rounded-2xl hover:-translate-y-1 hover:translate-x-2 hover:bg-[#631732]/90 transition-transform duration-300 ease-in-out"
            />
        </div>
      </div>
    </div>
  )
}
