import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "../services/api";

function Cart({ onCartChange, session }) {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], grandTotal: 0 });
    const [loading, setLoading] = useState(Boolean(session));
    const [error, setError] = useState("");
    const [placing, setPlacing] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [clearing, setClearing] = useState(false);

    const loadCart = useCallback(async () => {
        if (!session) {
            return;
        }

        try {
            const response = await api.get("/cart");
            setCart({
                items: response.data.items || [],
                grandTotal: response.data.grandTotal || 0,
            });
            setError("");
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        const timeoutId = window.setTimeout(loadCart, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadCart]);

    async function handlePlaceOrder() {
        setPlacing(true);
        setError("");

        try {
            const response = await api.post("/orders/place");
            await onCartChange?.();
            navigate("/orders", {
                state: { notice: response.data || "Order placed successfully" },
            });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setPlacing(false);
        }
    }

    async function handleDeleteItem(menuItemId) {
        setRemovingId(menuItemId);
        setError("");

        try {
            await api.delete(`/cart/items/${menuItemId}`);
            toast.success("Item removed from cart");
            await onCartChange?.();
            await loadCart();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setRemovingId(null);
        }
    }

    async function handleClearCart() {
        if (!cart.items.length) {
            return;
        }

        setClearing(true);
        setError("");

        try {
            await Promise.all(cart.items.map((item) => api.delete(`/cart/items/${item.menuItemId}`)));
            toast.success("Cart cleared");
            await onCartChange?.();
            await loadCart();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setClearing(false);
        }
    }

    if (!session) {
        return (
            <section className="center-panel">
                <p className="eyebrow">Cart</p>
                <h1>Login to see your cart.</h1>
                <p>Your cart is stored by the backend for your customer account.</p>
                <Link className="button primary" to="/login?redirect=/cart">
                    Login
                </Link>
            </section>
        );
    }

    return (
        <div className="page-stack compact">
            <section className="page-heading">
                <p className="eyebrow">Checkout</p>
                <h1>Your cart</h1>
                <p>Add more items from any restaurant menu before placing the order.</p>
            </section>

            {error && <div className="alert error">{error}</div>}

            {loading ? (
                <div className="cart-layout">
                    <div className="skeleton-row tall" />
                    <div className="summary-panel skeleton-summary" />
                </div>
            ) : cart.items.length > 0 ? (
                <section className="cart-layout">
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <article className="cart-item" key={item.menuItemId}>
                                <div>
                                    <h2>{item.itemName}</h2>
                                    <p>
                                        {item.quantity} x {formatCurrency(item.price)}
                                    </p>
                                </div>
                                <div className="cart-item-actions">
                                    <strong>{formatCurrency(item.totalPrice)}</strong>
                                    <button
                                        className="button ghost small"
                                        type="button"
                                        disabled={removingId === item.menuItemId}
                                        onClick={() => handleDeleteItem(item.menuItemId)}
                                    >
                                        {removingId === item.menuItemId ? "Removing..." : "Remove"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <aside className="summary-panel">
                        <h2>Order summary</h2>
                        <div className="summary-row">
                            <span>Items</span>
                            <strong>{cart.items.length}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Total</span>
                            <strong>{formatCurrency(cart.grandTotal)}</strong>
                        </div>
                        <button className="button ghost stretch" type="button" disabled={clearing || placing} onClick={handleClearCart}>
                            {clearing ? "Clearing cart..." : "Clear cart"}
                        </button>
                        <button className="button primary stretch" type="button" disabled={placing} onClick={handlePlaceOrder}>
                            {placing ? "Placing..." : "Place order"}
                        </button>
                    </aside>
                </section>
            ) : (
                <section className="empty-state">
                    <h2>Your cart is empty</h2>
                    <p>Pick a restaurant and add a dish to start your order.</p>
                    <Link className="button primary" to="/">
                        Browse restaurants
                    </Link>
                </section>
            )}
        </div>
    );
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value || 0);
}

export default Cart;
