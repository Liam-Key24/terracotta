import BookTableBtnPage from "../components/bookTablebtn-page";
import ContactBtn from "../components/contactBtn";
import MenuBtn from '../components/menuPage-btn'

export default function About() {
  return (
    <div className="relative min-h-screen pt-32 pb-16 px-6 md:px-12">
      <div className="absolute inset-0 h-[24vh] lg:h-[30vh] bg-[url(/assets/hero-background.avif)] bg-cover bg-center rounded-lg" />
      <div className="absolute inset-0 h-[24vh] lg:h-[30vh] bg-black/30 backdrop-blur-sm rounded-lg" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white/80 mb-8">
          About Terracotta
        </h1>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto mt-25 md:mt-50">
        <div className="space-y-6 text-gray-700 text-lg lg:text-xl leading-relaxed text-center">
          <p>
            Welcome to <span className="font-semibold">Terracotta</span>, where culinary excellence meets warm, friendly hospitality. 
            We are dedicated to crafting unforgettable dining experiences with every dish.
          </p>

          <p>
            Our menu celebrates the finest ingredients, traditional techniques, and innovative flavours, delivering a unique experience that honours the art of good food.
          </p>

          <p>
            Whether you're here for a special occasion, a business dinner, or simply a great meal, we look forward to welcoming you to <span className="font-semibold">Terracotta</span>.
          </p>
        </div>
        <div className="w-auto h-30 flex items-center justify-center space-x-3">
            <BookTableBtnPage/>
            <ContactBtn/>
            <MenuBtn/>
        </div>
      </div>
    </div>
  )
}
