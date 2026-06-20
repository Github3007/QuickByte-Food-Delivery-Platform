export const RESTAURANT_STATUS_ACTIONS = {
    PENDING: [{ status: "ACCEPTED", label: "Accept order" }],
    ACCEPTED: [{ status: "PREPARING", label: "Start preparing" }],
    PREPARING: [{ status: "READY_FOR_PICKUP", label: "Ready for pickup" }],
};

export const DELIVERY_STATUS_ACTIONS = {
    OUT_FOR_DELIVERY: [{ status: "DELIVERED", label: "Mark delivered" }],
};

export const ACTIVE_ORDER_STATUSES = new Set([
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
]);

export function getOrderId(order = {}) {
    return order.orderId ?? order.id;
}

export function getOrderStatus(order = {}) {
    return String(order.status || "").toUpperCase();
}

export function getRestaurantName(order = {}) {
    return order.restaurantName || order.restaurant?.name || "Restaurant";
}

export function getRestaurantAddress(order = {}) {
    return order.restaurant?.address || "Address not available";
}

export function getCustomerName(order = {}) {
    return order.customerName || order.customer?.name || "Customer";
}

export function getDeliveryPartnerName(order = {}) {
    return order.deliveryPartner?.name || "Not assigned";
}

export function getOrderTotal(order = {}) {
    return order.totalAmount || 0;
}

export function getOrderItems(order = {}) {
    if (Array.isArray(order.items)) {
        return order.items.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
        }));
    }

    if (Array.isArray(order.orderItems)) {
        return order.orderItems.map((item) => ({
            itemName: item.menuItem?.name || "Menu item",
            quantity: item.quantity,
            price: item.price,
        }));
    }

    return [];
}

export function countOrderItems(order = {}) {
    return getOrderItems(order).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
}

export function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value || 0);
}

export function formatDate(value) {
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

export function formatStatus(status = "") {
    return String(status).replaceAll("_", " ").toLowerCase();
}

export function statusClass(status = "") {
    return String(status).toLowerCase().replaceAll("_", "-");
}
