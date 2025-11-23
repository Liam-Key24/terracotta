export const foodData = [
    {
        id: 'tapas',
        title: 'Tapas',
        items: [
            {
                name: "Aceitunas Marinadas",
                description: "Mixed marinated olives brightened with citrus and fragrant herbs."
            },
            {
                name: "Jamón Ibérico and Manchego",
                description: "Fine cured ham paired with rich, nutty Spanish cheese."
            },
            {
                name: "Pan con Tomate Vegan",
                description: "Toasted rustic bread topped with crushed tomato, olive oil, and sea salt."
            },
            {
                name: "Patatas Bravas Vegan",
                description: "Crispy potatoes with a bold brava sauce and smooth aioli."
            },
            {
                name: "Croquetas de Jamón",
                description: "Silky béchamel croquettes filled with smoky Iberian ham."
            },
            {
                name: "Gambas al Ajillo",
                description: "Sizzling prawns bathed in garlic, chilli, and warm olive oil."
            },
            {
                name: "Chorizo al Vino Tinto",
                description: "Spicy chorizo gently simmered in rich red wine."
            },
            {
                name: "Albondigas",
                description: "Tender beef meatballs with ginger in a light, aromatic tomato sauce."
            },
            {
                name: "Chicken Skewers",
                description: "Chargrilled chicken marinated in yoghurt, lemon, and warm spices."
            },
            {
                name: "Grilled Halloumi",
                description: "Golden grilled halloumi finished with a drizzle of olive oil."
            },
            {
                name: "Mejillones al Vapor",
                description: "Fresh mussels steamed with white wine and herbs."
            },
            {
                name: "Tortilla Española V",
                description: "Classic Spanish omelette layered with soft potato and onion."
            },
            {
                name: "Pimientos de Padrón",
                description: "Blistered green peppers finished with sea salt."
            },
            {
                name: "Setas al Ajillo",
                description: "Garlic sautéed mushrooms with creamy gorgonzola and fresh parsley."
            },
            {
                name: "Berenjenas",
                description: "Crisp baked aubergine topped with melted manchego cheese."
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
                description: "Warm focaccia brushed with garlic and olive oil."
            },
            {
                name: "Focaccia with Mozzarella V",
                description: "Soft focaccia topped with melted mozzarella."
            },
            {
                name: "Focaccia, Tomato, Basil, Pesto V",
                description: "Fresh tomato and basil with a vibrant pesto finish."
            },
            {
                name: "Margherita V",
                description: "Tomato, mozzarella, basil, and parmesan on a simple, perfect base."
            },
            {
                name: "Prosciutto and Funghi",
                description: "Mozzarella, ham, and sautéed mushrooms with parmesan."
            },
            {
                name: "Vegetariana V",
                description: "Grilled seasonal vegetables over mozzarella, tomato, and parmesan."
            },
            {
                name: "Diavola",
                description: "Spicy chorizo, red onion, fresh chillies, and mozzarella."
            },
            {
                name: "Napoli",
                description: "Anchovies, olives, and capers over a rich tomato base."
            },
            {
                name: "Tartufata V",
                description: "Buffalo mozzarella and mushrooms finished with truffle oil and basil."
            },
            {
                name: "Tonno",
                description: "Tuna, red onion, and olives with fresh parsley."
            },
            {
                name: "Calzone",
                description: "Folded pizza filled with tomato, mozzarella, ham, and salami."
            },
            {
                name: "Capricciosa",
                description: "Ham, mushrooms, olives, and artichokes on a classic tomato base."
            },
            {
                name: "Formaggi V",
                description: "A rich blend of goat`s cheese, parmesan, and fior di latte."
            },
            {
                name: "Terracotta",
                description: "Mozzarella and cherry tomatoes topped with parma ham, rocket, and parmesan."
            },
            {
                name: "Piggy",
                description: "Ham, bacon, pepperoni, and jalapenos on a hearty tomato base."
            },
            {
                name: "Pizza Marinara",
                description: "Calamari, prawns, and mussels on a tomato base without mozzarella."
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
                description: "Traditional chicken paella with saffron rice and garden vegetables."
            },
            {
                name: "Paella Pollo y Chorizo",
                description: "Chicken and spicy chorizo cooked through aromatic saffron rice."
            },
            {
                name: "Paella Negra",
                description: "Squid ink rice with mixed seafood, green peas, and roasted peppers."
            },
            {
                name: "Paella Marisco",
                description: "A generous paella of mixed fresh seafood and saffron rice."
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
                description: "Melt in the mouth ox cheeks braised in deep red wine."
            },
            {
                name: "Rabo de Toro",
                description: "Classic Andalusian oxtail stewed until tender in a rich sauce."
            },
            {
                name: "Cordero con Patatas y Cebolla",
                description: "Slow roasted lamb with soft potatoes and sweet onion."
            },
            {
                name: "Sopa de Pescado Recommended",
                description: "A warming stew of mixed fish in a rich, aromatic broth."
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
                description: "Crisp vegetables, feta, and olives with a classic oregano dressing."
            },
            {
                name: "Escalivada Salad V",
                description: "Warm roasted Catalan vegetables with olive oil and herbs."
            },
            {
                name: "Ensalada de Gambas",
                description: "Mixed leaves with pan fried prawns, avocado, and cherry tomatoes."
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
                description: "Crisp warm churros served with a rich chocolate sauce."
            },
            {
                name: "Crema Catalana",
                description: "Silky citrus custard topped with a delicate caramel crust."
            },
            {
                name: "Tiramisu",
                description: "Light mascarpone layered with espresso soaked sponge."
            },
            {
                name: "Cheese Cake",
                description: "Creamy baked cheesecake with a buttery biscuit base."
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

