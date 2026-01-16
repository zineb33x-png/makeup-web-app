class ClientApp {
    constructor() {
        this.api = new ApiService();
        this.cart = JSON.parse(localStorage.getItem('mdb_cart') || '[]');

        this.elements = {
            productGrid: document.getElementById('productGrid'),
            cartBtn: document.getElementById('cartBtn'),
            cartBadge: document.getElementById('cartBadge'),

            // Cart Modal
            cartModal: document.getElementById('cartModal'),
            cartItems: document.getElementById('cartItems'),
            cartTotal: document.getElementById('cartTotal'),
            closeCartBtn: document.getElementById('closeCartBtn'),
            checkoutBtn: document.getElementById('checkoutBtn')
        };

        this.init();
    }

    async init() {
        this.updateCartUI();
        this.bindEvents();
        await this.loadProducts();
    }

    bindEvents() {
        this.elements.cartBtn.addEventListener('click', () => this.openCart());
        this.elements.closeCartBtn.addEventListener('click', () => this.elements.cartModal.classList.remove('active'));

        this.elements.productGrid.addEventListener('click', (e) => this.handleProductClick(e));
        this.elements.cartItems.addEventListener('click', (e) => this.handleCartRemove(e));
       //le clique sur commander 
        this.elements.checkoutBtn.addEventListener('click', () => {
            if (this.cart.length === 0) return;
            alert('Merci pour votre commande ! (Simulation)');
            this.clearCart();
            this.elements.cartModal.classList.remove('active');
        });
    }

    async loadProducts() {
        // Loading state handled in HTML structure implicitly or could add spinner
        const products = await this.api.getProducts();
        this.renderProducts(products);
    }

    renderProducts(products) {/*C’est ELLE qui affiche chaque produit dans l’interface admin.*/
        if (!products.length) {
            this.elements.productGrid.innerHTML = '<p>Aucun produit disponible.</p>';
            return;
        }

        this.elements.productGrid.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-image">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-price">${formatCurrency(p.price)}</p>
                <button class="btn btn-primary" data-action="add-to-cart" data-id="${p.id}" style="margin-top: 1rem; width: 100%;">
                    Ajouter au Panier
                </button>
            </div>
        `).join('');
    }

    handleProductClick(e) {
        if (e.target.dataset.action === 'add-to-cart') {
            const id = e.target.dataset.id;
            this.addToCart(id);
        }
    }

    async addToCart(productId) {/*Si on clique sur un bouton Ajouter au Panier,
✔️ on récupère l’id du produit
✔️ on appelle addToCart(id)*/ 
        const products = await this.api.getProducts();
        const product = products.find(p => p.id === productId);

        if (product) {
            this.cart.push(product);/*this.cart est un tableau (le panier)
👉 push(product) ajoute le produit*/
            this.saveCart();
            this.updateCartUI();

            // Visual feedback
            const btn = document.querySelector(`button[data-id="${productId}"]`);
            const originalText = btn.textContent;
            btn.textContent = 'Ajouté !';
            btn.style.backgroundColor = 'var(--color-gold)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 1000);
        }
    }

    handleCartRemove(e) {
        const btn = e.target.closest('.remove-item');
        if (btn) {
            const index = parseInt(btn.dataset.index);
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartUI();
            this.renderCartItems(); // Re-render cart list
        }
    }

    saveCart() {
        localStorage.setItem('mdb_cart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        this.elements.cartBadge.textContent = this.cart.length;
        // Hide badge if empty? optional.
    }

    openCart() {
        this.renderCartItems();
        this.elements.cartModal.classList.add('active');
    }

    renderCartItems() {
        if (this.cart.length === 0) {
            this.elements.cartItems.innerHTML = '<p style="text-align: center; color: #777;">Votre panier est vide.</p>';
            this.elements.cartTotal.textContent = formatCurrency(0);
            return;
        }

        this.elements.cartItems.innerHTML = this.cart.map((item, index) => `
            <div class="order-item">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <div style="font-weight: bold;">${item.name}</div>
                        <div style="font-size: 0.9rem; color: #666;">${formatCurrency(item.price)}</div>
                    </div>
                </div>
                <button class="btn-icon remove-item" data-index="${index}" style="color: var(--color-danger)">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + item.price, 0);
        this.elements.cartTotal.textContent = formatCurrency(total);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.clientApp = new ClientApp();
});
