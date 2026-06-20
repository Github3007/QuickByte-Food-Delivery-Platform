import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";

const PAGE_SIZE = 10;

function Orders({ session }) {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 });
    const [loading, setLoading] = useState(Boolean(session));
    const [error, setError] = useState("");

    const loadOrders = useCallback(async () => {
        if (!session) {
            return;
        }

        try {
            const response = await api.get("/orders/my-orders", {
                params: { page, size: PAGE_SIZE, sort: "createdAt,desc" },
            });

            setOrders(response.data.content || []);
            setError("");
            setPageInfo({
                page: response.data.page ?? page,
                totalPages: response.data.totalPages ?? 0,
            });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [page, session]);

    useEffect(() => {
        const timeoutId = window.setTimeout(loadOrders, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadOrders]);

    if (!session) {
        return (
            <section className="center-panel">
                <p className="eyebrow">Orders</p>
                <h1>Login to view your orders.</h1>
                <p>Order history is attached to your customer account.</p>
                <Link className="button primary" to="/login?redirect=/orders">
                    Login
                </Link>
            </section>
        );
    }

    const activeStatuses = ["PROCESSING", "PREPARING", "OUT_FOR_DELIVERY", "IN_TRANSIT", "OUT FOR DELIVERY", "CONFIRMED", "PENDING", "ACCEPTED"];
    const currentOrders = orders.filter((order) => {
        const status = String(order.status || "").toUpperCase();
        return activeStatuses.includes(status);
    });
    const historyOrders = orders.filter((order) => {
        const status = String(order.status || "").toUpperCase();
        return !activeStatuses.includes(status);
    });

    return (
        <div className="page-stack compact">
            <section className="page-heading">
                <p className="eyebrow">Order history</p>
                <h1>Your orders</h1>
                <p>Track every order placed from your QuickByte cart.</p>
            </section>

            {location.state?.notice && <div className="alert success">{location.state.notice}</div>}
            {error && <div className="alert error">{error}</div>}

            <section className="toolbar right">
                <div className="pagination-controls">
                    <button
                        className="button ghost"
                        type="button"
                        disabled={loading || page <= 0}
                        onClick={() => {
                            setLoading(true);
                            setPage((currentPage) => currentPage - 1);
                        }}
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
                        onClick={() => {
                            setLoading(true);
                            setPage((currentPage) => currentPage + 1);
                        }}
                    >
                        Next
                    </button>
                </div>
            </section>

            {loading ? (
                <div className="orders-list">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div className="skeleton-row tall" key={index} />
                    ))}
                </div>
            ) : orders.length > 0 ? (
                <>
                    <section className="orders-list" aria-label="Current orders">
                        <div className="section-heading">
                            <h2>Current orders</h2>
                            <p>{currentOrders.length} active order{currentOrders.length === 1 ? "" : "s"}</p>
                        </div>

                        {currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
                                <article className="order-card" key={order.orderId}>
                                    <div className="order-topline">
                                        <div>
                                            <h2>Order #{order.orderId}</h2>
                                            <p>{order.restaurantName}</p>
                                        </div>
                                        <span className={`status-chip ${statusClass(order.status)}`}>{formatStatus(order.status)}</span>
                                    </div>

                                    <div className="order-meta">
                                        <span>{formatDate(order.createdAt)}</span>
                                        <strong>{formatCurrency(order.totalAmount)}</strong>
                                    </div>

                                    <div className="order-items">
                                        {(order.items || []).map((item) => (
                                            <span key={`${order.orderId}-${item.itemName}`}>
                                                {item.quantity} x {item.itemName}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <section className="empty-state">
                                <h2>No active orders</h2>
                                <p>Delivered and completed orders are moved to your order history below.</p>
                            </section>
                        )}
                    </section>

                    {historyOrders.length > 0 && (
                        <section className="orders-list history-orders" aria-label="Past orders">
                            <div className="section-heading">
                                <h2>Past orders</h2>
                                <p>{historyOrders.length} order{historyOrders.length === 1 ? "" : "s"} archived</p>
                            </div>

                            {historyOrders.map((order) => (
                                <article className="order-card" key={order.orderId}>
                                    <div className="order-topline">
                                        <div>
                                            <h2>Order #{order.orderId}</h2>
                                            <p>{order.restaurantName}</p>
                                        </div>
                                        <span className={`status-chip ${statusClass(order.status)}`}>{formatStatus(order.status)}</span>
                                    </div>

                                    <div className="order-meta">
                                        <span>{formatDate(order.createdAt)}</span>
                                        <strong>{formatCurrency(order.totalAmount)}</strong>
                                    </div>

                                    <div className="order-items">
                                        {(order.items || []).map((item) => (
                                            <span key={`${order.orderId}-${item.itemName}`}>
                                                {item.quantity} x {item.itemName}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </section>
                    )}
                </>
            ) : (
                <section className="empty-state">
                    <h2>No orders yet</h2>
                    <p>Your placed orders will show up here.</p>
                    <Link className="button primary" to="/">
                        Start an order
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

function formatDate(value) {
    if (!value) {
        return "Just now";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function formatStatus(status = "") {
    return status.replaceAll("_", " ").toLowerCase();
}

function statusClass(status = "") {
    return status.toLowerCase().replaceAll("_", "-");
}

export default Orders;
