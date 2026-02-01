const { Product, Category, Tag, sequelize } = require('../models');

const productsData = [
    {
        name: "Casco Integral LS2 Rapid",
        description: "Casco integral de alta seguridad con certificación DOT. Visor antirayas y sistema de ventilación avanzado.",
        price: 85.00,
        stock: 15,
        brand: "LS2",
        compatibility: "Universal",
        imageUrl: "/img/products/images1.jpg",
        categoryName: "Accesorios"
    },
    {
        name: "Aceite Motul 7100 4T 10W40",
        description: "Aceite sintético de alto rendimiento para motores de 4 tiempos. Protección total del motor y la caja de cambios.",
        price: 18.50,
        stock: 50,
        brand: "Motul",
        compatibility: "Universal 4T",
        imageUrl: "/img/products/images2.png",
        categoryName: "Fluidos"
    },
    {
        name: "Kit de Arrastre Racing (Cadena Dorada)",
        description: "Kit completo de arrastre con cadena reforzada dorada, piñón y corona de acero templado.",
        price: 45.00,
        stock: 10,
        brand: "Racing Pro",
        compatibility: "Bera SBR, Empire Horse",
        imageUrl: "/img/products/images3.webp",
        categoryName: "Transmisión"
    },
    {
        name: "Caucho Trasero Michelin City Grip",
        description: "Neumático de alto agarre en mojado, ideal para uso urbano. Medida 130/70-17.",
        price: 110.00,
        stock: 8,
        brand: "Michelin",
        compatibility: "Rines 17",
        imageUrl: "/img/products/images4.png",
        categoryName: "Cauchos"
    },
    {
        name: "Batería de Gel YTX7A-BS",
        description: "Batería de libre mantenimiento con tecnología de gel. Mayor vida útil y potencia de arranque.",
        price: 35.00,
        stock: 20,
        brand: "Magna",
        compatibility: "Bera, Empire, Yamaha",
        imageUrl: "/img/products/images5.jpg",
        categoryName: "Eléctrico"
    },
    {
        name: "Amortiguadores Traseros Reforzados",
        description: "Par de amortiguadores traseros con resorte reforzado para mayor carga y estabilidad.",
        price: 55.00,
        stock: 12,
        brand: "Suspension Pro",
        compatibility: "Bera SBR, Owen",
        imageUrl: "/img/products/images6.jpg",
        categoryName: "Suspensión"
    },
    {
        name: "Faro LED Ojo de Ángel",
        description: "Faro delantero con tecnología LED de alta potencia y aro de luz diurna (ojo de ángel).",
        price: 25.00,
        stock: 30,
        brand: "LedMoto",
        compatibility: "Universal",
        imageUrl: "/img/products/images7.jpg",
        categoryName: "Iluminación"
    },
    {
        name: "Manillas de Freno y Embrague Ajustables",
        description: "Manillas de aluminio CNC ajustables en 6 posiciones. Diseño deportivo y ergonómico.",
        price: 22.00,
        stock: 18,
        brand: "Protaper",
        compatibility: "Universal",
        imageUrl: "/img/products/images8.png",
        categoryName: "Manubrio"
    },
    {
        name: "Escape Deportivo Akrapovic Réplica",
        description: "Silenciador deportivo universal con acabado en fibra de carbono. Mejora el sonido y el flujo de gases.",
        price: 75.00,
        stock: 5,
        brand: "Akrapovic",
        compatibility: "Universal",
        imageUrl: "/img/products/images9.jpg",
        categoryName: "Escape"
    },
    {
        name: "Guantes con Protecciones",
        description: "Guantes de moto con protecciones rigidas en nudillos y palmas antideslizantes.",
        price: 15.00,
        stock: 40,
        brand: "Fox",
        compatibility: "Talla M, L, XL",
        imageUrl: "/img/products/images10.webp",
        categoryName: "Accesorios"
    },
    // Reuse some images for the last two products as fallback or repeat
    {
        name: "Pastillas de Freno Cerámicas",
        description: "Juego de pastillas delanteras de compuesto cerámico para un frenado superior y menor desgaste.",
        price: 12.00,
        stock: 60,
        brand: "Brembo",
        compatibility: "Calipers Doble Pistón",
        imageUrl: "/img/products/images11.png",
        categoryName: "Frenos"
    },
    {
        name: "Espejos Retrovisores Rizoma",
        description: "Espejos de aluminio CNC antirreflejo con diseño aerodinámico.",
        price: 30.00,
        stock: 25,
        brand: "Rizoma",
        compatibility: "Universal rosca 10mm",
        imageUrl: "/img/products/images12.png",
        categoryName: "Manubrio"
    }
];

async function seed() {
    try {
        console.log('🌱 Seeding products with LOCAL USER uploaded images...');

        for (const item of productsData) {
            const [category] = await Category.findOrCreate({
                where: { name: item.categoryName },
                defaults: { description: `Productos de ${item.categoryName}` }
            });

            // Usamos findOne primero para actualizar
            let product = await Product.findOne({ where: { name: item.name } });

            if (product) {
                // Actualizar imagen y datos
                product.imageUrl = item.imageUrl;
                product.price = item.price;
                product.description = item.description;
                await product.save();
                console.log(`Updated: ${item.name} -> ${item.imageUrl}`);
            } else {
                // Crear nuevo
                await Product.create({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    stock: item.stock,
                    brand: item.brand,
                    compatibility: item.compatibility,
                    imageUrl: item.imageUrl,
                    categoryId: category.id
                });
                console.log(`Created: ${item.name} -> ${item.imageUrl}`);
            }
        }

        console.log('✅ All products updated with user images!');
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
}

seed();
