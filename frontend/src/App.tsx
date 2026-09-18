import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  description?: string;
  active: boolean;
};

export type CartItem = {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
};

export type Order = {
  id: string;
  customerId: string;
  total: number;
  status: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  message: string;
  readFlag: boolean;
  createdAt: string;
};

type UserSession = {
  token: string;
  userId: string;
  email: string;
  role: string;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});

  // Auth State
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('markethub_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Cart & Drawer State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  // Orders & Notifications Modal
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Toast banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products', {
        params: { q: searchQuery, size: 50 },
      });
      const items: Product[] = res.data.content || [];
      setProducts(items);

      // Fetch stock for these items
      items.forEach((p) => {
        api.get(`/api/inventory/${p.id}`)
          .then((invRes) => {
            setInventoryMap((prev) => ({ ...prev, [p.id]: invRes.data.available ?? 0 }));
          })
          .catch(() => {
            setInventoryMap((prev) => ({ ...prev, [p.id]: 10 }));
          });
      });
    } catch (err) {
      console.error('Failed to fetch products', err);
      showToast('Could not load products. Please check if services are running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch cart
  const fetchCart = async (userId: string) => {
    try {
      setCartLoading(true);
      const res = await api.get(`/api/cart/${userId}`);
      setCartItems(res.data || []);
    } catch (err) {
      console.error('Error fetching cart', err);
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch orders & notifications
  const fetchOrdersAndNotifications = async (userId: string) => {
    try {
      const [ordersRes, notifRes] = await Promise.allSettled([
        api.get(`/api/orders/customer/${userId}`),
        api.get(`/api/notifications/${userId}`),
      ]);
      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data || []);
      }
      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders/notifications', err);
    }
  };

  useEffect(() => {
    if (session?.userId) {
      fetchCart(session.userId);
      fetchOrdersAndNotifications(session.userId);
    } else {
      setCartItems([]);
      setOrders([]);
      setNotifications([]);
    }
  }, [session]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchCat;
    });
  }, [products, selectedCategory]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: emailInput,
        password: passwordInput,
      });
      const data = res.data;
      const userSession: UserSession = {
        token: data.accessToken,
        userId: data.userId,
        email: emailInput,
        role: data.role || 'CUSTOMER',
      };
      setSession(userSession);
      localStorage.setItem('markethub_session', JSON.stringify(userSession));
      setAuthModalOpen(false);
      setEmailInput('');
      setPasswordInput('');
      showToast(`Welcome back, ${userSession.email}!`, 'success');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await api.post('/api/auth/register', {
        email: emailInput,
        password: passwordInput,
      });
      showToast('Registration successful! Logging you in...', 'success');
      // Automatically login
      const res = await api.post('/api/auth/login', {
        email: emailInput,
        password: passwordInput,
      });
      const data = res.data;
      const userSession: UserSession = {
        token: data.accessToken,
        userId: data.userId,
        email: emailInput,
        role: data.role || 'CUSTOMER',
      };
      setSession(userSession);
      localStorage.setItem('markethub_session', JSON.stringify(userSession));
      setAuthModalOpen(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('markethub_session');
    setCartItems([]);
    setOrders([]);
    setNotifications([]);
    showToast('Logged out successfully', 'info');
  };

  const quickLogin = (email: string) => {
    setEmailInput(email);
    setPasswordInput('Password123!');
  };

  // Add to Cart
  const handleAddToCart = async (product: Product) => {
    if (!session) {
      setAuthModalOpen(true);
      showToast('Please sign in to add items to your cart', 'info');
      return;
    }

    try {
      await api.post('/api/cart/items', {
        customerId: session.userId,
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      });
      showToast(`Added "${product.name}" to cart!`, 'success');
      fetchCart(session.userId);
    } catch (err) {
      showToast('Could not add item to cart', 'error');
    }
  };

  // Cart total calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Checkout flow
  const handleCheckout = async () => {
    if (!session) return;
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      setCheckoutLoading(true);
      // 1. Create Order
      const orderRes = await api.post('/api/orders', {
        customerId: session.userId,
        total: cartSubtotal,
      });
      const order: Order = orderRes.data;

      // 2. Reserve inventory for items
      for (const item of cartItems) {
        try {
          await api.post(`/api/inventory/${item.productId}/reserve?quantity=${item.quantity}`);
        } catch (invErr) {
          console.warn('Inventory reserve note:', invErr);
        }
      }

      // 3. Process Idempotent Payment
      const idempotencyKey = `pay-${order.id}-${Date.now()}`;
      await api.post('/api/payments', {
        orderId: order.id,
        amount: cartSubtotal,
        idempotencyKey,
      });

      // 4. Update order status to PAID
      await api.patch(`/api/orders/${order.id}/status?value=PAID`);

      // 5. Send notification
      await api.post('/api/notifications', {
        userId: session.userId,
        type: 'ORDER_CONFIRMATION',
        message: `Your order #${order.id.slice(0, 8)} for ₹${Number(cartSubtotal).toFixed(2)} has been placed and paid successfully!`,
      });

      // 6. Clear cart
      await api.delete(`/api/cart/${session.userId}`);
      setCartItems([]);
      setCartDrawerOpen(false);

      showToast(`Order placed successfully! Order ID: #${order.id.slice(0, 8)}`, 'success');
      fetchOrdersAndNotifications(session.userId);
      fetchProducts();
      setActiveTab('orders');
    } catch (err: any) {
      console.error('Checkout failed', err);
      showToast('Checkout failed. Please try again.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!session) return;
    try {
      await api.delete(`/api/cart/${session.userId}`);
      setCartItems([]);
      showToast('Cart cleared', 'info');
    } catch (err) {
      showToast('Failed to clear cart', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-banner toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">×</button>
        </div>
      )}

      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-brand" onClick={() => setActiveTab('catalog')}>
          <div className="brand-logo">MH</div>
          <div className="brand-text">
            <h1 className="brand-title">MarketHub</h1>
            <span className="brand-subtitle">Multi-Vendor E-Commerce</span>
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Storefront
          </button>
          {session && (
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('orders');
                fetchOrdersAndNotifications(session.userId);
              }}
            >
              My Orders ({orders.length})
            </button>
          )}
        </div>

        <div className="nav-actions">
          {session ? (
            <div className="user-profile">
              <div
                className="notifications-wrapper"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <button className="icon-btn" title="Notifications">
                  🔔
                  {notifications.filter((n) => !n.readFlag).length > 0 && (
                    <span className="badge-count">
                      {notifications.filter((n) => !n.readFlag).length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="dropdown-header">
                      <strong>Notifications</strong>
                      <span className="text-muted">{notifications.length} total</span>
                    </div>
                    <div className="dropdown-list">
                      {notifications.length === 0 ? (
                        <p className="empty-text">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="notification-item">
                            <span className="notif-type">{n.type}</span>
                            <p className="notif-msg">{n.message}</p>
                            <span className="notif-date">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-pill">
                <span className="user-role-badge">{session.role}</span>
                <span className="user-email">{session.email}</span>
                <button onClick={handleLogout} className="btn-logout" title="Sign out">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setAuthModalOpen(true)}>
              Sign In / Register
            </button>
          )}

          {/* Cart Icon */}
          <button
            className="cart-trigger-btn"
            onClick={() => setCartDrawerOpen(true)}
            aria-label="Open Shopping Cart"
          >
            🛒 Cart
            {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'catalog' ? (
          <>
            {/* Hero Section */}
            <section className="hero-banner">
              <div className="hero-content">
                <span className="hero-tag">Curated Marketplace</span>
                <h2 className="hero-heading">Explore High-Quality Independent Vendors</h2>
                <p className="hero-desc">
                  Discover authenticated products from premier sellers with verified stock and instant checkout.
                </p>

                <div className="search-bar-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by product name, category, or specifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Category Filter Pills */}
            <section className="category-filter-bar">
              <div className="category-scroll">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* Product Catalog Grid */}
            <section className="catalog-section">
              <div className="section-header">
                <div>
                  <h3 className="section-title">
                    {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                  </h3>
                  <span className="text-muted">{filteredProducts.length} items available</span>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading catalog from Product Service...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-title">No products found</p>
                  <p className="text-muted">Try a different search query or select another category.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map((p) => {
                    const stock = inventoryMap[p.id] ?? 0;
                    return (
                      <article className="product-card" key={p.id}>
                        <div className="card-top">
                          <span className="product-category-tag">{p.category}</span>
                          <span className={`stock-tag ${stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {stock > 0 ? `${stock} in stock` : 'Out of Stock'}
                          </span>
                        </div>

                        <div className="product-preview">
                          <div className="product-symbol">📦</div>
                        </div>

                        <div className="card-body">
                          <h4 className="product-name">{p.name}</h4>
                          <span className="product-sku">SKU: {p.sku}</span>
                          <p className="product-description">
                            {p.description || 'Verified authentic listing from our marketplace vendor.'}
                          </p>
                        </div>

                        <div className="card-footer">
                          <div className="price-box">
                            <span className="price-label">Price</span>
                            <span className="price-amount">₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>

                          <button
                            className="btn-add-cart"
                            onClick={() => handleAddToCart(p)}
                            disabled={stock <= 0}
                          >
                            {stock > 0 ? '+ Add to Cart' : 'Sold Out'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Orders History View */
          <section className="orders-section">
            <div className="section-header">
              <div>
                <h3 className="section-title">Your Order History</h3>
                <span className="text-muted">Track order status and transaction confirmations</span>
              </div>
              <button className="btn-secondary" onClick={() => fetchOrdersAndNotifications(session!.userId)}>
                🔄 Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">No orders placed yet</p>
                <p className="text-muted">Browse the catalog and place your first multi-vendor order!</p>
                <button className="btn-primary" onClick={() => setActiveTab('catalog')}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((o) => (
                  <div key={o.id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">Order #{o.id}</span>
                        <span className="order-date">
                          Placed on {new Date(o.createdAt).toLocaleDateString()} at{' '}
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className={`order-status-badge status-${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-stat">
                        <span className="stat-label">Total Paid</span>
                        <span className="stat-value">₹{Number(o.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="order-stat">
                        <span className="stat-label">Payment Status</span>
                        <span className="stat-value text-success">Captured & Confirmed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Cart Drawer Slide-out */}
      {cartDrawerOpen && (
        <div className="modal-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Shopping Cart ({totalCartCount})</h3>
              <button className="close-btn" onClick={() => setCartDrawerOpen(false)}>
                ×
              </button>
            </div>

            <div className="drawer-body">
              {!session ? (
                <div className="empty-state">
                  <p>Please sign in to view your cart items.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      setAuthModalOpen(true);
                    }}
                  >
                    Sign In
                  </button>
                </div>
              ) : cartLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading cart...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-title">Your cart is empty</p>
                  <p className="text-muted">Explore the catalog and add products you love!</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={item.id} className="cart-item-row">
                        <div className="cart-item-info">
                          <h4 className="cart-item-title">{prod ? prod.name : `Product ${item.productId.slice(0, 8)}`}</h4>
                          <span className="cart-item-price">
                            ₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="cart-item-qty">
                          <span className="qty-badge">Qty: {item.quantity}</span>
                        </div>
                        <div className="cart-item-total">
                          <strong>
                            ₹{(item.quantity * Number(item.unitPrice)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {session && cartItems.length > 0 && (
              <div className="drawer-footer">
                <div className="subtotal-row">
                  <span>Subtotal:</span>
                  <strong className="subtotal-amount">
                    ₹{cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="drawer-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleClearCart}
                    disabled={checkoutLoading}
                  >
                    Clear Cart
                  </button>
                  <button
                    className="btn-checkout"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? 'Processing Payment...' : 'Proceed to Checkout →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'Sign In to MarketHub' : 'Create an Account'}</h3>
              <button className="close-btn" onClick={() => setAuthModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="auth-tab-switch">
              <button
                className={`switch-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
              >
                Sign In
              </button>
              <button
                className={`switch-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
              >
                Register
              </button>
            </div>

            {authError && <div className="auth-error-msg">{authError}</div>}

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary btn-block" disabled={authLoading}>
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="quick-test-section">
              <span className="quick-test-title">Quick Demo Login:</span>
              <div className="quick-buttons">
                <button
                  type="button"
                  className="quick-btn"
                  onClick={() => quickLogin('customer@markethub.com')}
                >
                  Demo Customer
                </button>
                <button
                  type="button"
                  className="quick-btn"
                  onClick={() => quickLogin('vendor@markethub.com')}
                >
                  Demo Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>MarketHub</strong> — High-Performance Multi-Vendor Architecture
          </div>
          <div className="services-status-pill">
            <span className="status-dot"></span>
            <span>Gateway :8080 • Microservices Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}