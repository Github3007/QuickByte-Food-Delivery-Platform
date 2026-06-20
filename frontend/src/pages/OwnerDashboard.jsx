import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "../services/api";
import {
    ACTIVE_ORDER_STATUSES,
    RESTAURANT_STATUS_ACTIONS,
    countOrderItems,
    formatCurrency,
    formatDate,
    formatStatus,
    getCustomerName,
    getDeliveryPartnerName,
    getOrderId,
    getOrderItems,
    getOrderStatus,
    getOrderTotal,
    getRestaurantName,
    statusClass,
} from "../utils/orders";

const PAGE_SIZE = 10;

function OwnerDashboard() {
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [restaurantLoading, setRestaurantLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyOrderId, setBusyOrderId] = useState(null);
    const [savingRestaurant, setSavingRestaurant] = useState(false);
    const [savingMenuItem, setSavingMenuItem] = useState(false);
    const [restaurantForm, setRestaurantForm] = useState({ name: "", address: "" });
    const [menuForm, setMenuForm] = useState({
        restaurantId: "",
        name: "",
        description: "",
        price: "",
        category: "",
    });

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/orders/restaurant-orders", {
                params: { page, size: PAGE_SIZE, sort: "createdAt,desc" },
            });

            setOrders(response.data.content || []);
            setPageInfo({
                page: response.data.page ?? page,
                totalPages: response.data.totalPages ?? 0,
                totalElements: response.data.totalElements ?? 0,
            });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [page]);

    const loadRestaurants = useCallback(async () => {
        setRestaurantLoading(true);

        try {
            const response = await api.get("/restaurants", {
                params: { page: 0, size: 100, sort: "name,asc" },
            });

            const content = response.data.content || [];
            setRestaurants(content);
            setMenuForm((currentForm) => ({
                ...currentForm,
                restaurantId: currentForm.restaurantId || String(content[0]?.id || ""),
            }));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setRestaurantLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(loadOrders, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadOrders]);

    useEffect(() => {
        const timeoutId = window.setTimeout(loadRestaurants, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadRestaurants]);

    const activeOrders = useMemo(() => {
        return orders.filter((order) => ACTIVE_ORDER_STATUSES.has(getOrderStatus(order)));
    }, [orders]);

    const completedOrders = useMemo(() => {
        return orders.filter((order) => !ACTIVE_ORDER_STATUSES.has(getOrderStatus(order)));
    }, [orders]);

    async function handleOrderStatus(orderId, status) {
        setBusyOrderId(orderId);
        setError("");

        try {
            const response = await api.patch(`/orders/${orderId}/status`, { status });
            toast.success(response.data || "Order status updated");
            await loadOrders();
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setBusyOrderId(null);
        }
    }

    async function handleCreateRestaurant(event) {
        event.preventDefault();
        setSavingRestaurant(true);
        setError("");

        try {
            const response = await api.post("/restaurants", restaurantForm);
            toast.success(response.data || "Restaurant created");
            setRestaurantForm({ name: "", address: "" });
            await loadRestaurants();
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setSavingRestaurant(false);
        }
    }

    async function handleCreateMenuItem(event) {
        event.preventDefault();
        setSavingMenuItem(true);
        setError("");

        try {
            const response = await api.post("/menu-items", {
                ...menuForm,
                restaurantId: Number(menuForm.restaurantId),
                price: Number(menuForm.price),
            });

            toast.success(response.data || "Menu item created");
            setMenuForm((currentForm) => ({
                restaurantId: currentForm.restaurantId,
                name: "",
                description: "",
                price: "",
                category: "",
            }));
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setSavingMenuItem(false);
        }
    }

    function updateRestaurantForm(field, value) {
        setRestaurantForm((currentForm) => ({ ...currentForm, [field]: value }));
    }

    function updateMenuForm(field, value) {
        setMenuForm((currentForm) => ({ ...currentForm, [field]: value }));
    }

    return (
        <div className="page-stack role-workspace">
            <section className="workspace-hero owner-hero">
                <div>
                    <p className="eyebrow">Restaurant owner</p>
                    <h1>Kitchen command center</h1>
                    <p className="hero-copy">Manage incoming orders, update preparation stages, and keep menus ready for customers.</p>
                </div>
                <div className="workspace-metrics">
                    <Metric label="orders" value={pageInfo.totalElements} />
                    <Metric label="active" value={activeOrders.length} />
                    <Metric label="restaurants" value={restaurants.length} />
                </div>
            </section>

            {error && <div className="alert error">{error}</div>}

            <section className="toolbar role-toolbar">
                <div>
                    <h2>Kitchen queue</h2>
                    <p>{activeOrders.length} active order{activeOrders.length === 1 ? "" : "s"}</p>
                </div>
                <button className="button ghost" type="button" disabled={loading} onClick={loadOrders}>
                    Refresh
                </button>
            </section>

            {loading ? (
                <SkeletonRows />
            ) : orders.length > 0 ? (
                <>
                    <section className="orders-list" aria-label="Restaurant owner orders">
                        {orders.map((order) => {
                            const orderId = getOrderId(order);
                            const actions = RESTAURANT_STATUS_ACTIONS[getOrderStatus(order)] || [];

                            return (
                                <OwnerOrderCard
                                    actions={actions}
                                    busy={busyOrderId === orderId}
                                    key={orderId}
                                    order={order}
                                    onStatusUpdate={(status) => handleOrderStatus(orderId, status)}
                                />
                            );
                        })}
                    </section>

                    <section className="toolbar right">
                        <div className="pagination-controls">
                            <button
                                className="button ghost"
                                type="button"
                                disabled={loading || page <= 0}
                                onClick={() => setPage((currentPage) => currentPage - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {pageInfo.totalPages === 0 ? 0 : pageInfo.page + 1} of {pageInfo.totalPages}
                            </span>
                            <button
                                className="button ghost"
                                type="button"
                                disabled={loading || pageInfo.totalPages === 0 || page >= pageInfo.totalPages - 1}
                                onClick={() => setPage((currentPage) => currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </section>
                </>
            ) : (
                <section className="empty-state">
                    <h2>No restaurant orders yet</h2>
                    <p>Customer orders for your restaurants will appear in this queue.</p>
                </section>
            )}

            <section className="owner-grid">
                <div className="management-panel owner-panel">
                    <div>
                        <p className="eyebrow">Restaurant setup</p>
                        <h2>Create restaurant</h2>
                    </div>
                    <form className="form-stack" onSubmit={handleCreateRestaurant}>
                        <label>
                            Restaurant name
                            <input
                                required
                                type="text"
                                value={restaurantForm.name}
                                onChange={(event) => updateRestaurantForm("name", event.target.value)}
                            />
                        </label>
                        <label>
                            Address
                            <input
                                required
                                type="text"
                                value={restaurantForm.address}
                                onChange={(event) => updateRestaurantForm("address", event.target.value)}
                            />
                        </label>
                        <button className="button primary stretch" type="submit" disabled={savingRestaurant}>
                            {savingRestaurant ? "Creating..." : "Create restaurant"}
                        </button>
                    </form>
                </div>

                <div className="management-panel owner-panel">
                    <div>
                        <p className="eyebrow">Menu studio</p>
                        <h2>Add menu item</h2>
                    </div>
                    <form className="form-stack" onSubmit={handleCreateMenuItem}>
                        <label>
                            Restaurant
                            <select
                                required
                                disabled={restaurantLoading || restaurants.length === 0}
                                value={menuForm.restaurantId}
                                onChange={(event) => updateMenuForm("restaurantId", event.target.value)}
                            >
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Dish name
                            <input
                                required
                                type="text"
                                value={menuForm.name}
                                onChange={(event) => updateMenuForm("name", event.target.value)}
                            />
                        </label>
                        <div className="form-grid-two">
                            <label>
                                Category
                                <input
                                    required
                                    type="text"
                                    value={menuForm.category}
                                    onChange={(event) => updateMenuForm("category", event.target.value)}
                                />
                            </label>
                            <label>
                                Price
                                <input
                                    required
                                    min="1"
                                    step="0.01"
                                    type="number"
                                    value={menuForm.price}
                                    onChange={(event) => updateMenuForm("price", event.target.value)}
                                />
                            </label>
                        </div>
                        <label>
                            Description
                            <textarea
                                required
                                rows="3"
                                value={menuForm.description}
                                onChange={(event) => updateMenuForm("description", event.target.value)}
                            />
                        </label>
                        <button
                            className="button primary stretch"
                            type="submit"
                            disabled={savingMenuItem || restaurantLoading || restaurants.length === 0}
                        >
                            {savingMenuItem ? "Adding..." : "Add item"}
                        </button>
                    </form>
                </div>
            </section>

            {completedOrders.length > 0 && (
                <section className="role-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">History</p>
                            <h2>Closed orders</h2>
                        </div>
                        <span className="count-pill">{completedOrders.length}</span>
                    </div>
                    <div className="orders-grid compact-grid">
                        {completedOrders.map((order) => (
                            <OwnerOrderCard compact key={getOrderId(order)} order={order} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function OwnerOrderCard({ order, actions = [], busy = false, onStatusUpdate, compact = false }) {
    const status = getOrderStatus(order);
    const items = getOrderItems(order);

    return (
        <article className={compact ? "order-card compact-card" : "order-card role-order-card"}>
            <div className="order-topline">
                <div>
                    <h2>Order #{getOrderId(order)}</h2>
                    <p>{getRestaurantName(order)}</p>
                </div>
                <span className={`status-chip ${statusClass(status)}`}>{formatStatus(status)}</span>
            </div>

            <div className="order-detail-grid">
                <span>
                    <strong>{getCustomerName(order)}</strong>
                    customer
                </span>
                <span>
                    <strong>{countOrderItems(order)}</strong>
                    items
                </span>
                <span>
                    <strong>{formatCurrency(getOrderTotal(order))}</strong>
                    total
                </span>
                <span>
                    <strong>{getDeliveryPartnerName(order)}</strong>
                    delivery
                </span>
            </div>

            {items.length > 0 && (
                <div className="order-items">
                    {items.map((item) => (
                        <span key={`${getOrderId(order)}-${item.itemName}`}>
                            {item.quantity} x {item.itemName}
                        </span>
                    ))}
                </div>
            )}

            <div className="order-meta">
                <span>{formatDate(order.createdAt)}</span>
                {actions.map((action) => (
                    <button
                        className="button primary"
                        disabled={busy}
                        key={action.status}
                        type="button"
                        onClick={() => onStatusUpdate(action.status)}
                    >
                        {busy ? "Updating..." : action.label}
                    </button>
                ))}
            </div>
        </article>
    );
}

function Metric({ label, value }) {
    return (
        <div className="metric-tile">
            <strong>{value}</strong>
            <span>{label}</span>
        </div>
    );
}

function SkeletonRows({ count = 3 }) {
    return (
        <div className="orders-list">
            {Array.from({ length: count }).map((_, index) => (
                <div className="skeleton-row tall" key={index} />
            ))}
        </div>
    );
}

export default OwnerDashboard;
