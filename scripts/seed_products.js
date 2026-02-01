const { sequelize, Category, Tag, Product } = require('../models');

async function seedProducts() {
    try {
        console.log('🌱 Iniciando siembra de productos...');
        await sequelize.sync();

        // 1. Crear Categorías
        const categoriesData = [
            { name: 'Motor', description: 'Repuestos internos de motor' },
            { name: 'Frenos', description: 'Pastillas, discos y mandos' },
            { name: 'Transmisión', description: 'Kits de arrastre, cadenas y piñones' },
            { name: 'Eléctrico', description: 'Baterías, luces y ramales' },
            { name: 'Suspensión', description: 'Amortiguadores y barras' }
        ];

        const categories = {};
        for (const cat of categoriesData) {
            const [instance] = await Category.findOrCreate({
                where: { name: cat.name },
                defaults: cat
            });
            categories[cat.name] = instance;
            console.log(`📁 Categoría: ${cat.name}`);
        }

        // 2. Crear Tags
        const tagsData = ['Original', 'Genérico', 'Oferta', 'Nuevo', 'Alta Calidad'];
        const tags = {};
        for (const tagName of tagsData) {
            const [instance] = await Tag.findOrCreate({ where: { name: tagName } });
            tags[tagName] = instance;
        }
        console.log(`🏷️  Tags creados: ${tagsData.join(', ')}`);

        // 3. Crear Productos
        const productsData = [
            {
                name: 'Kit de Tiempo Bera SBR',
                description: 'Kit completo de tiempo para Bera SBR 2024. Incluye cadena, guías y tensor.',
                price: 15.00,
                brand: 'Bera Genuine',
                stock: 50,
                category: 'Motor',
                tags: ['Original', 'Alta Calidad'],
                compatibility: 'Bera SBR, Bera León'
            },
            {
                name: 'Pastillas de Freno Delanteras Horse',
                description: 'Juego de pastillas de cerámica para Empire Horse 150.',
                price: 3.50,
                brand: 'Osaka',
                stock: 100,
                category: 'Frenos',
                tags: ['Genérico', 'Oferta'],
                compatibility: 'Empire Horse, Owne'
            },
            {
                name: 'Batería de Gel 12V 7Ah',
                description: 'Batería de alto rendimiento libre de mantenimiento.',
                price: 22.00,
                brand: 'Magna',
                stock: 20,
                category: 'Eléctrico',
                tags: ['Nuevo', 'Alta Calidad'],
                compatibility: 'Universal'
            },
            {
                name: 'Amortiguadores Traseros (Par)',
                description: 'Amortiguadores reforzados para carga. Color rojo.',
                price: 35.00,
                brand: 'Empire Original',
                stock: 15,
                category: 'Suspensión',
                tags: ['Original'],
                compatibility: 'Empire Horse, Arsen II'
            },
            {
                name: 'Kit de Arrastre 428H',
                description: 'Relación 16/42 con cadena reforzada dorada.',
                price: 18.50,
                brand: 'Riffel',
                stock: 40,
                category: 'Transmisión',
                tags: ['Alta Calidad', 'Oferta'],
                compatibility: 'Universal 150cc'
            },
            {
                name: 'Cilindro Completo 150cc',
                description: 'Kit de cilindro, pistón y anillos estándar.',
                price: 28.00,
                brand: 'Bera Genuine',
                stock: 10,
                category: 'Motor',
                tags: ['Original'],
                compatibility: 'Motores CG 150'
            },
            {
                name: 'Farola Delantera LED',
                description: 'Farola completa con bombillo LED H4 integrado.',
                price: 12.00,
                brand: 'LedTech',
                stock: 60,
                category: 'Eléctrico',
                tags: ['Genérico'],
                compatibility: 'Universal Redonda'
            },
            {
                name: 'Manillas de Freno y Clutch Negras',
                description: 'Juego de manillas de aluminio reforzado.',
                price: 4.00,
                brand: 'Racing',
                stock: 80,
                category: 'Frenos',
                tags: ['Oferta'],
                compatibility: 'Universal'
            }
        ];

        for (const prod of productsData) {
            // Crear producto
            const [productInstance] = await Product.findOrCreate({
                where: { name: prod.name },
                defaults: {
                    description: prod.description,
                    price: prod.price,
                    brand: prod.brand,
                    stock: prod.stock,
                    categoryId: categories[prod.category].id,
                    compatibility: prod.compatibility
                }
            });

            // Asociar Tags
            if (prod.tags && prod.tags.length > 0) {
                const prodTags = prod.tags.map(t => tags[t]);
                await productInstance.setTags(prodTags);
            }

            console.log(`✅ Producto: ${prod.name}`);
        }

        console.log('✨ Siembra de productos finalizada con éxito.');

    } catch (error) {
        console.error('❌ Error en el seed:', error);
    } finally {
        await sequelize.close();
    }
}

seedProducts();
