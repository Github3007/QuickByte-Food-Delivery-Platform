import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "../services/api";
import {
    ACTIVE_ORDER_STATUSES,
    DELIVERY_STATUS_ACTIONS,
    countOrderItems,
    formatCurrency,
    formatDate,
    formatStatus,
    getCustomerName,
    getOrderId,
    getOrderItems,
    getOrderStatus,
    getOrderTotal,
    getRestaurantAddress,
    getRestaurantName,
    statusClass,
} from "../utils/orders";

const PAGE_SIZE = 8;

function DeliveryDashboard() {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [page, setPage] = useState(0);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyOrderId, setBusyOrderId] = useState(null);

    const loadDeliveryData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [availableResponse, deliveriesResponse] = await Promise.all([
                api.get("/orders/delivery/available", {
                    params: { page, size: PAGE_SIZE, sort: "createdAt,asc" },
                }),
                api.get("/orders/delivery/my-orders"),
            ]);

            setAvailableOrders(availableResponse.data.content || []);
            setMyDeliveries(deliveriesResponse.data || []);
            setPageInfo({
                page: availableResponse.data.page ?? page,
                totalPages: availableResponse.data.totalPages ?? 0,
                totalElements: availableResponse.data.totalElements ?? 0,
            });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const timeoutId = window.setTimeout(loadDeliveryData, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadDeliveryData]);

    const activeDeliveries = useMemo(() => {
        return myDeliveries.filter((order) => ACTIVE_ORDER_STATUSES.has(getOrderStatus(order)));
    }, [myDeliveries]);

    const completedDeliveries = useMemo(() => {
        return myDeliveries.filter((order) => !ACTIVE_ORDER_STATUSES.has(getOrderStatus(order)));
    }, [myDeliveries]);

    async function handleAssign(orderId) {
        setBusyOrderId(orderId);
        setError("");

        try {
            const response = await api.patch(`/orders/delivery/${orderId}/assign`);
            toast.success(response.data || "Delivery assigned");
            await loadDeliveryData();
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setBusyOrderId(null);
        }
    }

    async function handleStatusUpdate(orderId, status) {
        setBusyOrderId(orderId);
        setError("");

        try {
            const response = await api.patch(`/orders/delivery/${orderId}/status`, { status });
            toast.success(response.data || "Delivery updated");
            await loadDeliveryData();
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setBusyOrderId(null);
        }
    }

    return (
        <div className="page-stack role-workspace">
            <section className="workspace-hero delivery-hero">
                <div>
                    <p className="eyebrow">Delivery partner</p>
                    <h1>Pickup queue and active runs</h1>
                    <p className="hero-copy">Accept ready orders, complete deliveries, and keep every handoff moving.</p>
                </div>
                <div className="workspace-metrics">
                    <Metric label="available" value={pageInfo.totalElements} />
                    <Metric label="active" value={activeDeliveries.length} />
                    <Metric label="done" value={completedDeliveries.length} />
                </div>
            </section>

            {error && <div className="alert error">{error}</div>}

            <section className="toolbar role-toolbar">
                <div>
                    <h2>Ready for pickup</h2>
                    <p>{pageInfo.totalElements} order{pageInfo.totalElements === 1 ? "" : "s"} waiting</p>
                </div>
                <button className="button ghost" type="button" disabled={loading} onClick={loadDeliveryData}>
                    Refresh
                </button>
            </section>

            {loading ? (
                <SkeletonRows />
            ) : (
                <>
                    <section className="orders-grid" aria-label="Available delivery orders">
                        {availableOrders.length > 0 ? (
                            availableOrders.map((order) => {
                                const orderId = getOrderId(order);

                                return (
                                    <DeliveryOrderCard
                                        actionLabel={busyOrderId === orderId ? "Accepting..." : "Accept pickup"}
                                        busy={busyOrderId === orderId}
                                        key={orderId}
                                        order={order}
                                        onAction={() => handleAssign(orderId)}
                                    />
                                );
                            })
                        ) : (
                            <EmptyPanel title="No pickups waiting" body="Ready orders from restaurants will appear here." />
                        )}
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
            )}

            <section className="role-section">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">My deliveries</p>
                        <h2>Active runs</h2>
                    </div>
                    <span className="count-pill">{activeDeliveries.length}</span>
                </div>

                {loading ? (
                    <SkeletonRows count={2} />
                ) : activeDeliveries.length > 0 ? (
                    <div className="orders-grid">
                        {activeDeliveries.map((order) => {
                            const orderId = getOrderId(order);
                            const actions = DELIVERY_STATUS_ACTIONS[getOrderStatus(order)] || [];

                            return (
                                <DeliveryOrderCard
                                    actions={actions}
                                    busy={busyOrderId === orderId}
                                    key={orderId}
                                    order={order}
                                    onStatusUpdate={(status) => handleStatusUpdate(orderId, status)}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <EmptyPanel title="No active runs" body="Accepted deliveries will stay here until they are delivered." />
                )}
            </section>

            {completedDeliveries.length > 0 && (
                <section className="role-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">History</p>
                            <h2>Completed deliveries</h2>
                        </div>
                        <span className="count-pill">{completedDeliveries.length}</span>
                    </div>
                    <div className="orders-grid compact-grid">
                        {completedDeliveries.map((order) => (
                            <DeliveryOrderCard compact key={getOrderId(order)} order={order} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function DeliveryOrderCard({
    order,
    onAction,
    actionLabel,
    onStatusUpdate,
    actions = [],
    busy = false,
    compact = false,
}) {
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
                    bill value
                </span>
            </div>

            <p className="muted-line">{getRestaurantAddress(order)}</p>

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
                {onAction && (
                    <button className="button primary" type="button" disabled={busy} onClick={onAction}>
                        {actionLabel}
                    </button>
                )}
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

function EmptyPanel({ title, body }) {
    return (
        <section className="empty-state compact-empty">
            <h2>{title}</h2>
            <p>{body}</p>
        </section>
    );
}

function SkeletonRows({ count = 3 }) {
    return (
        <div className="orders-grid">
            {Array.from({ length: count }).map((_, index) => (
                <div className="skeleton-row tall" key={index} />
            ))}
        </div>
    );
}

export default DeliveryDashboard;
