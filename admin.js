class AdminApp {
    constructor() {
        this.api = new ApiService();
        this.state = {
            products: []
        };

        this.elements = {
            grid: document.getElementById('clientsGrid'), // Reusing ID for simplicity or should rename in HTML
            addBtn: document.getElementById('addClientBtn'),

            // Modal
            modal: document.getElementById('clientModal'), // Generic name
            form: document.getElementById('clientForm'),
            modalTitle: document.getElementById('modalTitle'),
            closeButtons: document.querySelectorAll('.close-modal')
        };

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProducts();
    }

    bindEvents() {
        this.elements.addBtn.addEventListener('click', () => this.openModal());

        this.elements.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.modal.classList.remove('active');
            });
        });

        this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        this.elements.grid.addEventListener('click', (e) => this.handleGridClick(e));
    }

    async loadProducts() {
        this.renderLoading();
        this.state.products = await this.api.getProducts();
        this.renderProducts();
    }

    renderLoading() {
        this.elements.grid.innerHTML = '<div class="empty-state"><p>Chargement du catalogue...</p></div>';
    }

    renderProducts() {
        if (this.state.products.length === 0) {
            this.elements.grid.innerHTML = '<div class="empty-state"><p>Aucun produit dans le catalogue.</p></div>';
            return;
        }

        this.elements.grid.innerHTML = this.state.products.map(p => `
            <div class="card product-admin-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <img src="${p.image}" style="width: 100%; height: 120px; object-fit: contain; background: #fff; padding: 5px; border-radius: 4px; margin-bottom: 1rem; border: 1px solid #eee;">
                    <h3>${p.name}</h3>
                    <p style="color: var(--color-gold-dark); font-weight: bold;">${formatCurrency(p.price)}</p>
                    <span class="badge badge-platinum">${p.category}</span>
                </div>
                <div style="margin-top: 1rem; text-align: right;">
                    <button class="btn btn-icon" style="color: var(--color-danger)" data-action="delete" data-id="${p.id}" title="Supprimer">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openModal() {
        this.elements.form.reset();
        this.elements.modalTitle.textContent = 'Nouveau Produit';
        this.elements.modal.classList.add('active');
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value,
            description: 'Nouveauté'
        };

        try {
            await this.api.createProduct(formData);
            this.elements.modal.classList.remove('active');
            await this.loadProducts();
        } catch (error) {
            console.error(error);
            alert('Erreur.');
        }
    }

    async handleGridClick(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'delete') {
            if (confirm('Supprimer ce produit ?')) {
                await this.api.deleteProduct(id);
                await this.loadProducts();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminApp();
});
