const { Product } = require('../models');

async function updateImages() {
    try {
        const products = await Product.findAll();

        const images = [
            'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80', // Herramientas
            'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80', // Repuestos
            'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80', // Moto motor
            'https://images.unsplash.com/photo-1615172282427-9a5752d908e5?auto=format&fit=crop&w=800&q=80', // Cadena
            'https://images.unsplash.com/photo-1597737229562-b9e716ce5ea1?auto=format&fit=crop&w=800&q=80'  // Motor oscuro
        ];

        let i = 0;
        for (const product of products) {
            const img = images[i % images.length];
            product.imageUrl = img;
            await product.save();
            console.log(`Updated product ${product.name} with image: ${img}`);
            i++;
        }

        console.log('✅ All products updated with images.');
    } catch (error) {
        console.error('❌ Error updating images:', error);
    }
}

updateImages();
