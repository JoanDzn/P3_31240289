const { Product, Category, Tag, sequelize } = require('../models');

const productsData = [
    {
        name: "Casco Integral LS2 Rapid",
        description: "Casco integral de alta seguridad con certificación DOT. Visor antirayas y sistema de ventilación avanzado.",
        price: 85.00,
        stock: 15,
        brand: "LS2",
        compatibility: "Universal",
        imageUrl: "https://images.unsplash.com/photo-1558596602-b08420656a88?auto=format&fit=crop&w=800&q=80",
        categoryName: "Accesorios"
    },
    {
        name: "Aceite Motul 7100 4T 10W40",
        description: "Aceite sintético de alto rendimiento para motores de 4 tiempos. Protección total del motor y la caja de cambios.",
        price: 18.50,
        stock: 50,
        brand: "Motul",
        compatibility: "Universal 4T",
        imageUrl: "https://m.media-amazon.com/images/I/71wIVw1J1JL._AC_SL1500_.jpg",
        categoryName: "Fluidos"
    },
    {
        name: "Kit de Arrastre Racing (Cadena Dorada)",
        description: "Kit completo de arrastre con cadena reforzada dorada, piñón y corona de acero templado.",
        price: 45.00,
        stock: 10,
        brand: "Racing Pro",
        compatibility: "Bera SBR, Empire Horse",
        imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80",
        categoryName: "Transmisión"
    },
    {
        name: "Caucho Trasero Michelin City Grip",
        description: "Neumático de alto agarre en mojado, ideal para uso urbano. Medida 130/70-17.",
        price: 110.00,
        stock: 8,
        brand: "Michelin",
        compatibility: "Rines 17",
        imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=800&q=80",
        categoryName: "Cauchos"
    },
    {
        name: "Batería de Gel YTX7A-BS",
        description: "Batería de libre mantenimiento con tecnología de gel. Mayor vida útil y potencia de arranque.",
        price: 35.00,
        stock: 20,
        brand: "Magna",
        compatibility: "Bera, Empire, Yamaha",
        imageUrl: "https://m.media-amazon.com/images/I/71+6qQ+y+IL._AC_SL1500_.jpg",
        categoryName: "Eléctrico"
    },
    {
        name: "Amortiguadores Traseros Reforzados",
        description: "Par de amortiguadores traseros con resorte reforzado para mayor carga y estabilidad.",
        price: 55.00,
        stock: 12,
        brand: "Suspension Pro",
        compatibility: "Bera SBR, Owen",
        imageUrl: "https://m.media-amazon.com/images/I/61k8f3+4+lL._AC_SL1200_.jpg",
        categoryName: "Suspensión"
    },
    {
        name: "Faro LED Ojo de Ángel",
        description: "Faro delantero con tecnología LED de alta potencia y aro de luz diurna (ojo de ángel).",
        price: 25.00,
        stock: 30,
        brand: "LedMoto",
        compatibility: "Universal",
        imageUrl: "https://m.media-amazon.com/images/I/71Y+g+5+lL._AC_SL1000_.jpg",
        categoryName: "Iluminación"
    },
    {
        name: "Manillas de Freno y Embrague Ajustables",
        description: "Manillas de aluminio CNC ajustables en 6 posiciones. Diseño deportivo y ergonómico.",
        price: 22.00,
        stock: 18,
        brand: "Protaper",
        compatibility: "Universal",
        imageUrl: "https://m.media-amazon.com/images/I/61+7qQ+y+IL._AC_SL1000_.jpg",
        categoryName: "Manubrio"
    },
    {
        name: "Escape Deportivo Akrapovic Réplica",
        description: "Silenciador deportivo universal con acabado en fibra de carbono. Mejora el sonido y el flujo de gases.",
        price: 75.00,
        stock: 5,
        brand: "Akrapovic",
        compatibility: "Universal",
        imageUrl: "https://images.unsplash.com/photo-1605333067822-6c3f5c717830?auto=format&fit=crop&w=800&q=80",
        categoryName: "Escape"
    },
    {
        name: "Guantes con Protecciones",
        description: "Guantes de moto con protecciones rigidas en nudillos y palmas antideslizantes.",
        price: 15.00,
        stock: 40,
        brand: "Fox",
        compatibility: "Talla M, L, XL",
        imageUrl: "https://images.unsplash.com/photo-1550505193-2c47677f54c9?auto=format&fit=crop&w=800&q=80",
        categoryName: "Accesorios"
    },
    {
        name: "Pastillas de Freno Cerámicas",
        description: "Juego de pastillas delanteras de compuesto cerámico para un frenado superior y menor desgaste.",
        price: 12.00,
        stock: 60,
        brand: "Brembo",
        compatibility: "Calipers Doble Pistón",
        imageUrl: "https://m.media-amazon.com/images/I/71wIVw1J1JL._AC_SL1500_.jpg", // Placeholder reuse
        categoryName: "Frenos"
    },
    {
        name: "Espejos Retrovisores Rizoma",
        description: "Espejos de aluminio CNC antirreflejo con diseño aerodinámico.",
        price: 30.00,
        stock: 25,
        brand: "Rizoma",
        compatibility: "Universal rosca 10mm",
        imageUrl: "https://m.media-amazon.com/images/I/61+7qQ+y+IL._AC_SL1000_.jpg", // Placeholder reuse
        categoryName: "Manubrio"
    }
];

async function seed() {
    try {
        console.log('🌱 Seeding products...');

        for (const item of productsData) {
            // Find or create category
            const [category] = await Category.findOrCreate({
                where: { name: item.categoryName },
                defaults: { description: `Productos de ${item.categoryName}` }
            });

            // Create product
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
        }

        console.log('✅ Products seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
}

seed();
