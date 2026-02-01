const { Product } = require('../models');

async function fixAllLocalImages() {
    try {
        const products = await Product.findAll();

        // Lista exacta de imágenes locales disponibles en public/img/products/
        const localImages = [
            '/img/products/images1.jpg',
            '/img/products/images2.png',
            '/img/products/images3.webp',
            '/img/products/images4.png',
            '/img/products/images5.jpg',
            '/img/products/images6.jpg',
            '/img/products/images7.jpg',
            '/img/products/images8.png',
            '/img/products/images9.jpg',
            '/img/products/images10.webp',
            '/img/products/images11.png',
            '/img/products/images12.png',
            '/img/products/images13.png'
        ];

        let i = 0;
        for (const product of products) {
            // Asignar una imagen local de forma cíclica
            const imgPath = localImages[i % localImages.length];

            // Log para debug
            console.log(`Fixing ${product.name} (ID: ${product.id})`);
            console.log(`   Old: ${product.imageUrl}`);
            console.log(`   New: ${imgPath}`);

            product.imageUrl = imgPath;
            await product.save();
            i++;
        }

        console.log('✅ Todos los productos han sido actualizados con imágenes LOCALES.');

    } catch (error) {
        console.error('❌ Error fixing images:', error);
    }
}

fixAllLocalImages();
