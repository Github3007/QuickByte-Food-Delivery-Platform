import axios from "axios";

const TOKEN_KEY = "quickbyte_token";

export const ROLES = {
    CUSTOMER: "CUSTOMER",
    RESTAURANT_OWNER: "RESTAURANT_OWNER",
    DELIVERY_PARTNER: "DELIVERY_PARTNER",
    ADMIN: "ADMIN",
};

export const ROLE_LABELS = {
    [ROLES.CUSTOMER]: "Customer",
    [ROLES.RESTAURANT_OWNER]: "Restaurant owner",
    [ROLES.DELIVERY_PARTNER]: "Delivery partner",
    [ROLES.ADMIN]: "Admin",
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://quickbyte-food-delivery-platform.onrender.com",
});

export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function readStoredSession() {
    const token = getAuthToken();

    if (!token) {
        return null;
    }

    const payload = decodeJwtPayload(token);

    if (payload?.exp && payload.exp * 1000 < Date.now()) {
        clearAuthToken();
        return null;
    }

    const role = normalizeRole(payload?.role);

    return {
        token,
        email: payload?.sub || "",
        role,
        roleLabel: ROLE_LABELS[role] || "Account",
    };
}

export function getApiErrorMessage(error) {
    const data = error?.response?.data;

    if (typeof data === "string") {
        return data;
    }

    if (data?.message) {
        return data.message;
    }

    if (data && typeof data === "object") {
        return Object.values(data).join(" ");
    }

    return error?.message || "Something went wrong";
}

export function getRoleHome(role) {
    if (role === ROLES.DELIVERY_PARTNER) {
        return "/delivery";
    }

    if (role === ROLES.RESTAURANT_OWNER) {
        return "/owner";
    }

    return "/";
}

api.interceptors.request.use((config) => {
    const token = getAuthToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


function normalizeRole(value) {
    if (!value) {
        return "";
    }

    const rawRole = Array.isArray(value)
        ? value.find(Boolean)
        : typeof value === "object"
          ? value.authority || value.role || value.name
          : value;

    const normalizedRole = String(rawRole).replace(/^ROLE_/, "").toUpperCase();

    return ROLE_LABELS[normalizedRole] ? normalizedRole : "";
}

function decodeJwtPayload(token) {
    try {
        const payload = token.split(".")[1];
        const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(normalizedPayload)
                .split("")
                .map((character) => {
                    return `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`;
                })
                .join(""),
        );

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export default api;
