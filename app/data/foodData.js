export const foodData = [
    {
        id: 'tapas',
        title: 'Tapas',
        items: [
            {
                name: "Aceitunas Marinadas",
                description: "Mixed marinated olives brightened with citrus and fragrant herbs.",
                price: "£3.50"
            },
            {
                name: "Jamón Ibérico and Manchego",
                description: "Fine cured ham paired with rich, nutty Spanish cheese.",
                price: "£9.50"
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
                price: "£7"
            },
            {
                name: "Gambas al Ajillo",
                description: "Sizzling prawns bathed in garlic, chilli, and warm olive oil.",
                price: "£9"
            },
            {
                name: "Chorizo al Vino Tinto",
                description: "Spicy chorizo gently simmered in rich red wine.",
                price: "£7"
            },
            {
                name: "Albondigas",
                description: "Tender beef meatballs with ginger in a light, aromatic tomato sauce.",
                price: "£7"
            },
            {
                name: "Chicken Skewers",
                description: "Chargrilled chicken marinated in yoghurt, lemon, and warm spices.",
                price: "£9"
            },
            {
                name: "Mejillones al Vapor",
                description: "Fresh mussels steamed with white wine and herbs.",
                price: "£8"
            },
            {
                name: "Tortilla Española V",
                description: "Classic Spanish omelette layered with soft potato and onion.",
                price: "£7"
            },
            {
                name: "Pimientos de Padrón",
                description: "Blistered green peppers finished with sea salt.",
                price: "£6"
            },
            {
                name: "Champion Con Queso",
                description: "Champion with melted Gorgonzola cheese.",
                price: "£7"
            },
            {
                name: "Berenjenas",
                description: "Crisp baked aubergine topped with melted manchego cheese.",
                price: "£8"
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
                price: "£5.95"
            },
            {
                name: "Margherita V",
                description: "Tomato, mozzarella, basil, and parmesan on a simple, perfect base.",
                price: "£8.95"
            },
            {
                name: "Vegetariana V",
                description: "Grilled seasonal vegetables over mozzarella, tomato, and parmesan.",
                price: "£9.95"
            },
            {
                name: "Diavola",
                description: "Spicy chorizo, red onion, fresh chillies, and mozzarella.",
                price: "£10.95"
            },
            {
                name: "Formaggi V",
                description: "A rich blend of goat`s cheese, parmesan, and fior di latte.",
                price: "£11.95"
            },
            {
                name: "Terracotta",
                description: "Mozzarella and cherry tomatoes topped with parma ham, rocket, and parmesan.",
                price: "£12.95"
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
                price: "£22"
            },
            {
                name: "Paella Pollo y Chorizo",
                description: "Chicken and spicy chorizo cooked through aromatic saffron rice.",
                price: "£24"
            },
            {
                name: "Paella Marisco",
                description: "A generous paella of mixed fresh seafood and saffron rice.",
                price: "£26"
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
                name: "Ravioli de Cangrejo",
                description: "Creamy crab ravioli with a rich tomato sauce.",
                price: "£13"
            },
            {
                name: "Carilleras",
                description: "Slow cooked Wild Boar cheeks in Red wine. ",
                price: "£18"
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
                price: "£9"
            },
            {
                name: "Escalivada Salad V",
                description: "Warm roasted Catalan vegetables with olive oil and herbs.",
                price: "£10"
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
                price: "£6"
            },
            {
                name: "Tiramisu",
                description: "Light mascarpone layered with espresso soaked sponge.",   
                price: "£6"
            },
            {
                name: "Cheese Cake",
                description: "Creamy baked cheesecake with a buttery biscuit base.",
                price: "£6"
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

