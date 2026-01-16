/**
 * API Service fetching data from a real external API (Makeup API)
 * and persisting custom products in LocalStorage.
 */

const STORAGE_KEYS = {
    CUSTOM_PRODUCTS: 'mdb_custom_products'
};

class ApiService {
    constructor() {
        // We use Maybelline brand as it provides consistent data
        this.apiEndpoint = 'https://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline';
    }

    /**
     * Fetches products from both the External API and LocalStorage.
     */
    async getProducts() {
        try {
            // Fetch from External API
            const response = await fetch(this.apiEndpoint);
            if (!response.ok) throw new Error('Network response was not ok');

            const apiData = await response.json();

            // Map External Data to our application format
            // We limit to 20 items for better performance and UI clarity
            const externalProducts = apiData.slice(0, 20).map(item => {
                let imageUrl = item.api_featured_image || item.image_link;
                // Handle protocol-relative URLs
                if (imageUrl && imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }

                return {
                    id: `api_${item.id}`,
                    name: item.name,
                    price: parseFloat(item.price) || 19.99, // Fallback price if null
                    category: item.product_type || 'Cosmétique',
                    image: imageUrl,
                    description: item.description ? item.description.split('.')[0] + '.' : 'Un produit d\'exception pour votre routine beauté.'
                };
            });

            // Load Custom Products from LocalStorage
            const storedData = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
            const customProducts = storedData ? JSON.parse(storedData) : [];

            // Merge both lists
            return [...customProducts, ...externalProducts];
        } catch (error) {
            console.error('ApiService: Error fetching products:', error);

            // Fallback: only Custom Products if API is down
            const storedData = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
            return storedData ? JSON.parse(storedData) : [];
        }
    }

    /**
     * Persists a new product in LocalStorage.
     * Simulated "Post" operation as the external API is read-only.
     */
    async createProduct(productData) {
        const storedData = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
        const customProducts = storedData ? JSON.parse(storedData) : [];

        const newProduct = {
            ...productData,
            id: `custom_${generateUUID()}`
        };

        customProducts.unshift(newProduct); // Add to beginning
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(customProducts));

        return newProduct;
    }

    /**
     * Removes a product from LocalStorage.
     * Only works for custom products.
     */
    async deleteProduct(id) {
        if (!id.startsWith('custom_')) {
            console.warn('ApiService: Cannot delete external API products.');
            return;
        }

        const storedData = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
        if (!storedData) return;

        let customProducts = JSON.parse(storedData);
        customProducts = customProducts.filter(p => p.id !== id);

        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(customProducts));
    }
}
