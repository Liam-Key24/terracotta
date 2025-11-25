export const foodData = [
    {
        id: 'tapas',
        title: 'Tapas',
        items: [
            {
                name: "Aceitunas Marinadas",
                description: "Mixed marinated olives brightened with citrus and fragrant herbs.",
                price: "£4"
            },
            {
                name: "Jamón Ibérico and Manchego",
                description: "Fine cured ham paired with rich, nutty Spanish cheese.",
                price: "£14"
            },
            {
                name: "Pan con Tomate Vegan",
                description: "Toasted rustic bread topped with crushed tomato, olive oil, and sea salt.",
                price: "£4"
            },
            {
                name: "Patatas Bravas Vegan",
                description: "Crispy potatoes with a bold brava sauce and smooth aioli.",
                price: "£5"
            },
            {
                name: "Croquetas de Jamón",
                description: "Silky béchamel croquettes filled with smoky Iberian ham.",
                price: "£6"
            },
            {
                name: "Gambas al Ajillo",
                description: "Sizzling prawns bathed in garlic, chilli, and warm olive oil.",
                price: "£9"
            },
            {
                name: "Chorizo al Vino Tinto",
                description: "Spicy chorizo gently simmered in rich red wine.",
                price: "£9"
            },
            {
                name: "Albondigas",
                description: "Tender beef meatballs with ginger in a light, aromatic tomato sauce.",
                price: "£9"
            },
            {
                name: "Chicken Skewers",
                description: "Chargrilled chicken marinated in yoghurt, lemon, and warm spices.",
                price: "£10"
            },
            {
                name: "Grilled Halloumi",
                description: "Golden grilled halloumi finished with a drizzle of olive oil.",
                price: "£6"
            },
            {
                name: "Mejillones al Vapor",
                description: "Fresh mussels steamed with white wine and herbs.",
                price: "£9"
            },
            {
                name: "Tortilla Española V",
                description: "Classic Spanish omelette layered with soft potato and onion.",
                price: "£7"
            },
            {
                name: "Pimientos de Padrón",
                description: "Blistered green peppers finished with sea salt.",
                price: "£5"
            },
            {
                name: "Setas al Ajillo",
                description: "Garlic sautéed mushrooms with creamy gorgonzola and fresh parsley.",
                price: "£7"
            },
            {
                name: "Berenjenas",
                description: "Crisp baked aubergine topped with melted manchego cheese.",
                price: "£7"
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
                name: "Garlic Bread V",
                description: "Warm focaccia brushed with garlic and olive oil.",
                price: "£7"
            },
            {
                name: "Focaccia with Mozzarella V",
                description: "Soft focaccia topped with melted mozzarella.",
                price: "£8"
            },
            {
                name: "Focaccia, Tomato, Basil, Pesto V",
                description: "Fresh tomato and basil with a vibrant pesto finish.",
                price: "£8"
            },
            {
                name: "Margherita V",
                description: "Tomato, mozzarella, basil, and parmesan on a simple, perfect base.",
                price: "£11"
            },
            {
                name: "Prosciutto and Funghi",
                description: "Mozzarella, ham, and sautéed mushrooms with parmesan.",
                price: "£13"
            },
            {
                name: "Vegetariana V",
                description: "Grilled seasonal vegetables over mozzarella, tomato, and parmesan.",
                price: "£12"
            },
            {
                name: "Diavola",
                description: "Spicy chorizo, red onion, fresh chillies, and mozzarella.",
                price: "£14"
            },
            {
                name: "Napoli",
                description: "Anchovies, olives, and capers over a rich tomato base.",
                price: "£12"
            },
            {
                name: "Tartufata V",
                description: "Buffalo mozzarella and mushrooms finished with truffle oil and basil.",
                price: "£14"
            },
            {
                name: "Tonno",
                description: "Tuna, red onion, and olives with fresh parsley.",
                price: "£13"
            },
            {
                name: "Calzone",
                description: "Folded pizza filled with tomato, mozzarella, ham, and salami.",
                price: "£14"
            },
            {
                name: "Capricciosa",
                description: "Ham, mushrooms, olives, and artichokes on a classic tomato base.",
                price: "£14"
            },
            {
                name: "Formaggi V",
                description: "A rich blend of goat`s cheese, parmesan, and fior di latte.",
                price: "£13"
            },
            {
                name: "Terracotta",
                description: "Mozzarella and cherry tomatoes topped with parma ham, rocket, and parmesan.",
                price: "£14"
            },
            {
                name: "Piggy",
                description: "Ham, bacon, pepperoni, and jalapenos on a hearty tomato base.",
                price: "£15"
            },
            {
                name: "Pizza Marinara",
                description: "Calamari, prawns, and mussels on a tomato base without mozzarella.",
                price: "£15"
            }
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
                price: "£16 | £24"
            },
            {
                name: "Paella Pollo y Chorizo",
                description: "Chicken and spicy chorizo cooked through aromatic saffron rice.",
                price: "£17 | £25"
            },
            {
                name: "Paella Negra",
                description: "Squid ink rice with mixed seafood, green peas, and roasted peppers.",
                price: "£18 | £26"
            },
            {
                name: "Paella Marisco",
                description: "A generous paella of mixed fresh seafood and saffron rice.",
                price: "£18 | £26"
            }
        ],
        imagePath: "/assets/menu/paella-menu.jpg",
        imageHeight: "50vh",
        reverseOnMobile: false,
        itemLayout: "description",
        gridCols: 1,
        imageBgPosition: "bottom"
    },
    {
        id: 'traditional',
        title: 'Traditional',
        items: [
            {
                name: "Slow-cooked Braised Ox",
                description: "Melt in the mouth ox cheeks braised in deep red wine.",
                price: "£20"
            },
            {
                name: "Rabo de Toro",
                description: "Classic Andalusian oxtail stewed until tender in a rich sauce.",
                price: "£18"
            },
            {
                name: "Cordero con Patatas y Cebolla",
                description: "Slow roasted lamb with soft potatoes and sweet onion.",
                price: "£17"
            },
            {
                name: "Sopa de Pescado Recommended",
                description: "A warming stew of mixed fish in a rich, aromatic broth.",
                price: "£16"
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
                name: "Greek Salad V",
                description: "Crisp vegetables, feta, and olives with a classic oregano dressing.",
                price: "£8"
            },
            {
                name: "Escalivada Salad V",
                description: "Warm roasted Catalan vegetables with olive oil and herbs.",
                price: "£9"
            },
            {
                name: "Ensalada de Gambas",
                description: "Mixed leaves with pan fried prawns, avocado, and cherry tomatoes.",
                price: "£10"
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
                price: "£6"
            },
            {
                name: "Crema Catalana",
                description: "Silky citrus custard topped with a delicate caramel crust.",
                price: "£8"
            },
            {
                name: "Tiramisu",
                description: "Light mascarpone layered with espresso soaked sponge.",   
                price: "£8"
            },
            {
                name: "Cheese Cake",
                description: "Creamy baked cheesecake with a buttery biscuit base.",
                price: "£8"
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

