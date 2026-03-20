export const foodData = [
    {
        id: 'tapas',
        title: 'Tapas',
        items: [
            {
                name: "Aceitunas y Pan",
                description: "Mixed marinated olives brightened with citrus and fragrant herbs.",
                price: "£4.50"
            },
            {
                name: "Jamón Ibérico and Manchego",
                description: "Fine cured ham paired with rich, nutty Spanish cheese.",
                price: "£12"
            },
            {
                name: "Pan con Tomate Vegan",
                description: "Toasted rustic bread topped with crushed tomato, olive oil, and sea salt.",
                price: "£5"
            },
            {
                name: "Patatas Bravas Vegan",
                description: "Crispy potatoes with a bold brava sauce and smooth aioli.",
                price: "£6"
            },
            {
                name: "Croquetas de Jamón",
                description: "Silky béchamel croquettes filled with smoky Iberian ham.",
                price: "£8"
            },
            {
                name: "Gambas al Ajillo",
                description: "Sizzling prawns bathed in garlic, chilli, and warm olive oil.",
                price: "£10"
            },
            {
                name: "Chorizo al Vino Tinto",
                description: "Spicy chorizo gently simmered in rich red wine.",
                price: "£8"
            },
            {
                name: "Albondigas",
                description: "Tender beef meatballs with ginger in a light, aromatic tomato sauce.",
                price: "£9"
            },
            {
                name: "Pollo Picante",
                description: "Marinated oven baked chicken lemon, and warm spices. Served with Seasonal vegetables.",
                price: "£12"
            },
            {
                name: "Mejillones al Vapor",
                description: "Fresh mussels steamed with white wine and herbs.",
                price: "£10"
            },
            {
                name: "Tortilla Española V",
                description: "Classic Spanish omelette layered with soft potato and onion.",
                price: "£7"
            },
            {
                name: "Padrón peppers",
                description: "Blistered green peppers finished with sea salt.",
                price: "£6"
            },
            {
                name: "Champion Con Queso",
                description: "Champion with melted Gorgonzola cheese.",
                price: "£8"
            },
            {
                name: "Berenjenas",
                description: "Crisp baked aubergine topped with melted manchego cheese.",
                price: "£9"
            },
            {
                name:'Rollitos de Queso', 
                description: "Butter pastary stuffed with cheese and drill servered with sweet and sour sauce.",
                price: "£7"
            },
            {
                name: 'Croquetes de Bacalao',
                description: 'Creamy bechamel croquettes filled with cod and served with a tartar sauce.',
                price: '£9'
            },
            {
                name: 'Delicias de bacalao',
                description: 'Crispy cod fillet with garlic aioli',
                price: '£9'
            }, 
            {
                name: 'Pescaditos fritos',
                description: 'Fried whitebait served with tartare sauce and lemon.',
                price: '£9'
            },
            {
                name: 'Calamri Fritos',
                description: 'Deep fried fresh squid served with tartare sauce',
                price: '£10'
            },
            {
                name: 'Pulpo a la Galega',
                description: 'Grilled octopus with smoked paprika, aioli served with creamed potatoes',
                price: '£15'
            }
        ],
        imagePath: "/assets/menu/tapas-menu.jpg",
        imageHeight: "90vh",
        reverseOnMobile: false,
        itemLayout: "description",
        gridCols: 2,
        imageBgPosition: "center"
    },
    {
        id: 'pizza',
        title: 'Pizza',
        items: [
            {
                name: "Margherita V",
                description: "Tomato, mozzarella, basil, and parmesan on a simple, perfect base.",
                price: "£9.95"
            },
            {
                name: "Vegetariana V",
                description: "Grilled seasonal vegetables over mozzarella, tomato, and parmesan.",
                price: "£10.95"
            },
            {
                name: "Diavola",
                description: "Spicy chorizo, red onion, fresh chillies, and mozzarella.",
                price: "£11.95"
            },
            {
                name: "Terracotta",
                description: "Mozzarella and cherry tomatoes topped with parma ham, rocket, and parmesan.",
                price: "£12.95"
            },
            {
                name: "Tarufata V",
                description: "Buffalo Mozerlla, mushrooms, parmesan shavings, fresh basil and truffle oil.",
                price: "£12.95"
            },
        ],
        imagePath: "/assets/menu/pizza-menu.jpg",
        imageHeight: "90vh",
        reverseOnMobile: true,
        itemLayout: "description",
        gridCols: 2,
        imageBgPosition: "center"
    },

    {
        id: 'paella',
        title: 'Paella',
        items: [
            {
                name: "Paella de Pollo",
                description: "Traditional chicken paella with saffron rice and garden vegetables.",
                price: "£25.95"
            },
            {
                name: "Paella Pollo y Chorizo",
                description: "Chicken and spicy chorizo cooked through aromatic saffron rice.",
                price: "£26.95"
            },
            {
                name: "Paella Marisco",
                description: "A generous paella of mixed fresh seafood and saffron rice.",
                price: "£26.95"
            }, 
            {
                name: "Paella de Verduras V",
                description: "A generous paella of mixed fresh vegetables and saffron rice.",
                price: "£24.95"
            }, 

        ],
        imagePath: "/assets/menu/paella-menu.jpg",
        imageHeight: "50vh",
        reverseOnMobile: false,
        itemLayout: "description",
        gridCols: 1,
        imageBgPosition: "bottom"
    },
    {
        id: 'mains',
        title: 'Mains',
        items: [
            {
                name: "Ravioli",
                description: "Creamy crab ravioli with a rich tomato sauce, with courgette shavings.",
                price: "£13"
            },
            {
                name: "Carilleras de Cerdo",
                description: "Slow cooked Wild Boar cheeks in Red wine served with a creamy mash.",
                price: "£14"
            },
            {
                name: "Cordero con Patatas y Cebolla",
                description: "Slow roasted lamb with soft potatoes and sweet onion.",
                price: "£18"
            },
            {
                name: "Sopa de Pescado",
                description: "A warming stew of mixed fish in a rich, aromatic broth.",
                price: "£18"
            },
            {
                name: "Pescado del dias",
                description: "Fish of the day served with a side of seasonal vegetables.",
                price: "£18"
            }, 
            {
                name: "Frittura Mista (for two)", 
                description: "Mixed fried fish and seafood served with a side of seasonal vegetables.",
                price: "£19.95"

            }
        ],
        imagePath: "/assets/hero-background.avif",
        imageHeight: "50vh",
        reverseOnMobile: true,
        itemLayout: "description",
        gridCols: 1,
        imageBgPosition: "center"
    },
    {
        id: 'salad',
        title: 'Salads',
        items: [
            {
                name: "Beetroot Salad",
                description: "Goat cheese, balsamic vinegar.",
                price: "£12"
            },
            {
                name: "Enslade de Tomate V",
                description: "Freah tomatoes, rocket, parmesan shavings and baslmic vinegar dressing.",
                price: "£7"
            },
            {
                name: "Ensalada de Gambas",
                description: "Mixed leaves with pan fried prawns, avocado, and cherry tomatoes.",
                price: "£12"
            },
            {
                name: "Ensalada de Tris colores V",
                description: "Avocado, tomato, mozzarella",
                price: "£9"
            }
        ],
        imagePath: "/assets/menu/Salad-menu.jpg",
        imageHeight: "40vh",
        reverseOnMobile: false,
        itemLayout: "description",
        gridCols: 1,
        imageBgPosition: "center"
    },
    {
        id: 'dessert',
        title: 'Desserts',
        items: [
            {
                name: "Churros con Chocolate",
                description: "Crisp warm churros served with a rich chocolate sauce.",
                price: "£7"
            },
            {
                name: "Crema Catalana",
                description: "Silky citrus custard topped with a delicate caramel crust.",
                price: "£7"
            },
            {
                name: "Tiramisu",
                description: "Light mascarpone layered with espresso soaked sponge.",   
                price: "£7"
            },
            {
                name: "Cheese Platter",
                description: "Selection of cheeses, crackers",
                price: "£12"
            }
        ],
        imagePath: "/assets/menu/dessert-menu.jpg",
        imageHeight: "40vh",
        reverseOnMobile: true,
        itemLayout: "description",
        gridCols: 1,
        imageBgPosition: "center"
    }
];

