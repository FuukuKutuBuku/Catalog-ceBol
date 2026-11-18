/**
 * Shopping Cart System for ceBol Website
 * Implements full cart functionality with localStorage persistence,
 * quantity controls (+/-), item removal, and real-time updates.
 */

(function () {
    'use strict';

    // Cart State
    let cart = [];

    // Load cart from localStorage
    function loadCart() {
        try {
            const savedCart = localStorage.getItem('cebol_cart');
            cart = savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Error loading cart from localStorage', e);
            cart = [];
        }
    }

    // Save cart to localStorage and re-render
    function saveCart() {
        try {
            localStorage.setItem('cebol_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }
        renderCart();
    }

    // Format number to Rupiah string (e.g. 20000 -> Rp 20.000)
    function formatRupiah(number) {
        return 'Rp ' + Number(number).toLocaleString('id-ID');
    }

    // Add item to cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                category: product.category || 'ACRYLIC KEYCHAIN',
                price: Number(product.price) || 20000,
                img: product.img || 'assets/box-depan.png',
                quantity: 1
            });
        }
        saveCart();
        openCart();
    }

    // Update item quantity
    function updateQuantity(id, delta) {
        const item = cart.find(item => item.id === id);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        saveCart();
    }

    // Remove item completely from cart
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    }

    // Open Cart Drawer
    function openCart() {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        if (drawer && overlay) {
            drawer.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('cart-open');
        }
    }

    // Close Cart Drawer
    function closeCart() {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        if (drawer && overlay) {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('cart-open');
        }
    }

    // Render Cart Interface
    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalPriceEl = document.getElementById('cart-total-price');
        const cartCountHeaderEl = document.getElementById('cart-count-header');
        const cartBadges = document.querySelectorAll('.cart-badge');

        // Calculate total quantity & total price
        let totalQuantity = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalQuantity += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        // Update badges across the website
        cartBadges.forEach(badge => {
            badge.textContent = totalQuantity;
            badge.style.display = totalQuantity > 0 ? 'inline-flex' : 'none';
        });

        // Update header count
        if (cartCountHeaderEl) {
            cartCountHeaderEl.textContent = `(${totalQuantity})`;
        }

        // Update total price
        if (cartTotalPriceEl) {
            cartTotalPriceEl.textContent = formatRupiah(totalPrice);
        }

        // Render items or empty state
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛍️</div>
                    <h4>Your Cart is Empty</h4>
                    <p>Looks like you haven't added any ceBol keychains yet.</p>
                    <button class="cart-shop-now-btn" id="cart-shop-now">EXPLORE COLLECTION</button>
                </div>
            `;
            const shopNowBtn = document.getElementById('cart-shop-now');
            if (shopNowBtn) {
                shopNowBtn.addEventListener('click', () => {
                    closeCart();
                    const collection = document.querySelector('.collection');
                    if (collection) {
                        collection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
            return;
        }

        let html = '';
        cart.forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-img">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <span class="cart-item-category">${item.category}</span>
                        <h4 class="cart-item-name">${item.name}</h4>
                        <span class="cart-item-price">${formatRupiah(item.price)}</span>
                        
                        <div class="cart-item-bottom">
                            <div class="cart-qty-controls">
                                <button class="cart-qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                                <span class="cart-qty-value">${item.quantity}</span>
                                <button class="cart-qty-btn qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                            </div>
                            <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
    }

    // Initialize Event Listeners
    function init() {
        loadCart();
        renderCart();

        // Cart Drawer Triggers
        document.querySelectorAll('.cart-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openCart();
            });
        });

        // Close button
        const closeBtn = document.getElementById('cart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCart);
        }

        // Overlay click
        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeCart);
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCart();
            }
        });

        // Event delegation for cart item actions (Plus, Minus, Remove)
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const id = target.dataset.id;
                if (!id) return;

                if (target.classList.contains('qty-plus')) {
                    updateQuantity(id, 1);
                } else if (target.classList.contains('qty-minus')) {
                    updateQuantity(id, -1);
                } else if (target.classList.contains('cart-remove-btn')) {
                    removeFromCart(id);
                }
            });
        }

        // "Add To Cart" buttons on product cards
        document.querySelectorAll('.clt-card').forEach(card => {
            const addBtn = card.querySelector('.clt-order button');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();

                    const id = card.dataset.id || card.querySelector('.clt-desc p')?.textContent.trim().toLowerCase().replace(/\s+/g, '-') || 'cebol-item';
                    const name = card.dataset.name || card.querySelector('.clt-desc p')?.textContent.trim() || 'ceBol Character';
                    const category = card.dataset.category || card.querySelector('.sub-label')?.textContent.trim() || 'ACRYLIC KEYCHAIN';
                    const priceRaw = card.dataset.price || 20000;
                    const img = card.dataset.img || card.querySelector('.clt-img img')?.getAttribute('src') || 'assets/box-depan.png';

                    addToCart({
                        id: id,
                        name: name,
                        category: category,
                        price: priceRaw,
                        img: img
                    });
                });
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('cart-checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    alert('Your cart is empty! Please add items before checking out.');
                    return;
                }
                const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                alert(`Thank you for your order! Total payment: ${formatRupiah(total)}\n\nOrder submitted successfully.`);
                cart = [];
                saveCart();
                closeCart();
            });
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
