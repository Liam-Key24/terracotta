export default function About() {
    return (
        <div className="relative min-h-screen pt-32 pb-16 px-6 md:px-12">
            {/* Background Image */}
            <div className="absolute inset-0 h-[24vh] lg:h-[30vh] bg-[url(/assets/hero-background.avif)] bg-cover bg-center rounded-lg" />
            <div className="absolute inset-0 h-[24vh] lg:h-[30vh] bg-black/30 backdrop-blur-xs rounded-lg" />

            {/* Heading */}
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
                    About Terracotta
                </h1>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto mt-30">
                <div className="space-y-6 text-gray-700 text-lg lg:text-xl leading-relaxed text-center">
                    <p>
                        Welcome to Terracotta, where culinary excellence meets warm hospitality.
                        We are passionate about creating memorable dining experiences through
                        carefully crafted dishes and exceptional service.
                    </p>

                    <p>
                        Our restaurant brings together the finest ingredients, traditional techniques,
                        and innovative flavors to deliver a unique dining experience that celebrates
                        the art of good food.
                    </p>

                    <p>
                        Whether you're joining us for a special occasion, a business dinner, or
                        simply a great meal, we look forward to welcoming you to Terracotta.
                    </p>
                </div>
            </div>
        </div>


    )
}
