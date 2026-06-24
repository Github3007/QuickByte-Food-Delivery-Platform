import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Toaster, toast } from "react-hot-toast";

import Cart from "./pages/Cart";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import OwnerDashboard from "./pages/OwnerDashboard";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import Restaurants from "./pages/Restaurants";
import api, {
    ROLE_LABELS,
    ROLES,
    clearAuthToken,
    getApiErrorMessage,
    getRoleHome,
    readStoredSession
} from "./services/api";

function App() {
    const [session, setSession] = useState(() => readStoredSession());
    const [cartSummary, setCartSummary] = useState({ items: [], grandTotal: 0 });
    const roleResolving = false;
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") {
            return "light";
        }

        const storedTheme = window.localStorage.getItem("quickbyte-theme");
        if (storedTheme === "light" || storedTheme === "dark") {
            return storedTheme;
        }

        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    const refreshCart = useCallback(async () => {
        if (!session || session.role !== ROLES.CUSTOMER) {
            setCartSummary({ items: [], grandTotal: 0 });
            return;
        }

        try {
            const response = await api.get("/cart");

            setCartSummary({
                items: response.data.items || [],
                grandTotal: response.data.grandTotal || 0,
            });
        } catch {
            setCartSummary({ items: [], grandTotal: 0 });
        }
    }, [session]);

    useEffect(() => {
        const timeoutId = window.setTimeout(refreshCart, 0);

        return () => window.clearTimeout(timeoutId);
    }, [refreshCart]);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem("quickbyte-theme", theme);
    }, [theme]);

    function handleLogin(nextSession) {
        setSession(nextSession || readStoredSession());
    }

    function handleLogout() {
        clearAuthToken();
        setSession(null);
        setCartSummary({ items: [], grandTotal: 0 });
    }

    return (
        <BrowserRouter>
            <AppContent
                cartSummary={cartSummary}
                onCartChange={refreshCart}
                onLogin={handleLogin}
                onLogout={handleLogout}
                roleResolving={roleResolving}
                session={session}
                theme={theme}
                onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            />
        </BrowserRouter>
    );
}

function AppContent({ cartSummary, onCartChange, onLogin, onLogout, roleResolving, session, theme, onToggleTheme }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const hiddenCartPaths = ["/cart", "/login", "/register"];
    const isCustomerSession = session?.role === ROLES.CUSTOMER;
    const showMiniCart =
        isCustomerSession && cartSummary.items.length > 0 && !hiddenCartPaths.includes(location.pathname);

    function handleSearchToggle() {
        setSearchOpen((open) => {
            const nextOpen = !open;
            if (nextOpen && location.pathname !== "/" && (!session || session.role === ROLES.CUSTOMER)) {
                navigate("/");
            }
            return nextOpen;
        });
    }

    async function handleClearCart() {
        if (!cartSummary.items.length) {
            return;
        }

        try {
            await Promise.all(cartSummary.items.map((item) => api.delete(`/cart/items/${item.menuItemId}`)));
            toast.success("Cart deleted");
            await onCartChange();
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        }
    }

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                }}
            />
            <div className={showMiniCart ? "app-shell has-mini-cart" : "app-shell"}>
                <Header
                    cartSummary={cartSummary}
                    session={session}
                    onLogout={onLogout}
                    roleResolving={roleResolving}
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                    searchOpen={searchOpen}
                    searchQuery={searchQuery}
                    onToggleSearch={handleSearchToggle}
                    onSearchChange={(value) => setSearchQuery(value)}
                />

                <main className="app-main">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <HomeRoute
                                    roleResolving={roleResolving}
                                    session={session}
                                    searchQuery={searchQuery}
                                    onSearchChange={(value) => setSearchQuery(value)}
                                />
                            }
                        />
                        <Route path="/restaurants" element={<Navigate to="/" replace />} />
                        <Route
                            path="/restaurants/:restaurantId/menu"
                            element={
                                <CustomerSurface roleResolving={roleResolving} session={session}>
                                    <Menu cartSummary={cartSummary} onCartChange={onCartChange} session={session} />
                                </CustomerSurface>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <RequireRole roleResolving={roleResolving} roles={[ROLES.CUSTOMER]} session={session}>
                                    <Cart onCartChange={onCartChange} session={session} />
                                </RequireRole>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <RequireRole roleResolving={roleResolving} roles={[ROLES.CUSTOMER]} session={session}>
                                    <Orders session={session} />
                                </RequireRole>
                            }
                        />
                        <Route
                            path="/delivery"
                            element={
                                <RequireRole
                                    roleResolving={roleResolving}
                                    roles={[ROLES.DELIVERY_PARTNER]}
                                    session={session}
                                >
                                    <DeliveryDashboard />
                                </RequireRole>
                            }
                        />
                        <Route
                            path="/owner"
                            element={
                                <RequireRole
                                    roleResolving={roleResolving}
                                    roles={[ROLES.RESTAURANT_OWNER]}
                                    session={session}
                                >
                                    <OwnerDashboard />
                                </RequireRole>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                session ? (
                                    <Navigate to={roleResolving ? "/" : getRoleHome(session.role)} replace />
                                ) : (
                                    <Login onLogin={onLogin} />
                                )
                            }
                        />
                        <Route
                            path="/register"
                            element={session ? <Navigate to={getRoleHome(session.role)} replace /> : <Register />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

                {showMiniCart && <MiniCart cart={cartSummary} onClearCart={handleClearCart} />}
            </div>
        </>
    );
}

function HomeRoute({ roleResolving, session, searchQuery, onSearchChange }) {
    if (session?.role === ROLES.DELIVERY_PARTNER || session?.role === ROLES.RESTAURANT_OWNER) {
        return <Navigate to={getRoleHome(session.role)} replace />;
    }

    if (session && !session.role && roleResolving) {
        return <WorkspaceLoading />;
    }

    return <Restaurants session={session} searchQuery={searchQuery} onSearchChange={onSearchChange} />;
}

function CustomerSurface({ children, roleResolving, session }) {
    if (session?.role && session.role !== ROLES.CUSTOMER) {
        return <Navigate to={getRoleHome(session.role)} replace />;
    }

    if (session && !session.role && roleResolving) {
        return <WorkspaceLoading />;
    }

    return children;
}

function RequireRole({ children, roleResolving, roles, session }) {
    if (!session) {
        return <LoginRequired />;
    }

    if (!session.role && roleResolving) {
        return <WorkspaceLoading />;
    }

    if (!roles.includes(session.role)) {
        return <Navigate to={getRoleHome(session.role)} replace />;
    }

    return children;
}

function WorkspaceLoading() {
    return (
        <section className="center-panel">
            <p className="eyebrow">QuickByte</p>
            <h1>Preparing your workspace</h1>
            <p>Checking account access with the backend.</p>
        </section>
    );
}

function LoginRequired() {
    return (
        <section className="center-panel">
            <p className="eyebrow">QuickByte</p>
            <h1>Login to continue</h1>
            <p>Your workspace is connected to your account role.</p>
            <Link className="button primary" to="/login">
                Login
            </Link>
        </section>
    );
}

function Header({
    cartSummary,
    session,
    onLogout,
    roleResolving,
    theme,
    onToggleTheme,
    searchOpen,
    searchQuery,
    onToggleSearch,
    onSearchChange,
}) {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        if (!profileOpen) {
            return undefined;
        }

        function handleOutsideClick(event) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [profileOpen]);

    const role = session?.role;
    const roleHome = session ? getRoleHome(role) : "/";
    const showCustomerActions = !session || role === ROLES.CUSTOMER;
    const cartItemCount = (cartSummary?.items || []).reduce((total, item) => total + item.quantity, 0);
    const navItems =
        role === ROLES.DELIVERY_PARTNER
            ? [{ to: "/delivery", label: "Deliveries" }]
            : role === ROLES.RESTAURANT_OWNER
              ? [{ to: "/owner", label: "Restaurant" }]
              : [
                    { to: "/", label: "Restaurants" },
                    { to: "/orders", label: "Orders" },
                ];

    return (
        <header className="site-header">
            <Link className="brand" to={roleHome} onClick={() => setProfileOpen(false)}>
                <span className="brand-mark">QB</span>
                <span>
                    <strong>QuickByte</strong>
                    <small>{role ? ROLE_LABELS[role] : "Order fresh, fast"}</small>
                </span>
            </Link>

            <nav className="nav-links" aria-label="Main navigation">
                {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="header-actions">
                {showCustomerActions && (
                    <>
                        <button
                            type="button"
                            className="button ghost icon-button search-toggle"
                            onClick={onToggleSearch}
                            aria-expanded={searchOpen}
                            aria-controls="header-search"
                            aria-label="Open search"
                            title="Search"
                        >
                            <Icon name="search" />
                        </button>
                        {searchOpen && (
                            <label className="search-field header-search inline-search">
                                <input
                                    id="header-search"
                                    type="search"
                                    placeholder="Search restaurants"
                                    value={searchQuery}
                                    onChange={(event) => onSearchChange(event.target.value)}
                                />
                            </label>
                        )}
                    </>
                )}
                {role === ROLES.CUSTOMER && (
                    <Link className="button ghost icon-button cart-button" to="/cart" aria-label="Open cart" title="Cart">
                        <Icon name="cart" />
                        {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                    </Link>
                )}
                <button
                    type="button"
                    className="button ghost icon-button theme-toggle"
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    title={theme === "dark" ? "Light mode" : "Dark mode"}
                >
                    <Icon name={theme === "dark" ? "sun" : "moon"} />
                </button>

                {session ? (
                    <div className="profile-menu" ref={profileMenuRef}>
                        <button
                            className="profile-button"
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={profileOpen}
                            onClick={() => setProfileOpen((open) => !open)}
                            title="Account"
                        >
                            <span className="profile-avatar">{(session.email || "U")[0].toUpperCase()}</span>
                        </button>

                        <div className={`profile-dropdown ${profileOpen ? "open" : ""}`} role="menu">
                            <p className="profile-label">
                                Signed in as <strong>{session.email || "user"}</strong>
                                <span>{roleResolving ? "Checking role" : ROLE_LABELS[role] || "Account"}</span>
                            </p>
                            <Link className="dropdown-item" to={roleHome} onClick={() => setProfileOpen(false)}>
                                Workspace
                            </Link>
                            <button className="dropdown-item" type="button" onClick={onLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Link className="button ghost small" to="/login">
                            Login
                        </Link>
                        <Link className="button primary small" to="/register">
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

function Icon({ name }) {
    const paths = {
        search: "M10.5 18a7.5 7.5 0 1 1 5.31-2.2l4.2 4.2-1.41 1.41-4.2-4.2A7.46 7.46 0 0 1 10.5 18Zm0-2a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z",
        sun: "M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.1A2.9 2.9 0 1 0 12 9.1a2.9 2.9 0 0 0 0 5.8ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.51 4.93l1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm13.44 13.44 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM4.93 20.49l-1.42-1.42 2.12-2.12 1.42 1.42-2.12 2.12ZM18.37 7.05l-1.42-1.42 2.12-2.12 1.42 1.42-2.12 2.12Z",
        moon: "M21 14.4A8.6 8.6 0 0 1 9.6 3a7.2 7.2 0 1 0 11.4 11.4ZM12 22A10 10 0 0 1 12 2c.45 0 .73.48.51.87A5.2 5.2 0 0 0 19.13 9.5c.39-.22.87.06.87.51A10 10 0 0 1 12 22Z",
        cart: "M7 18a2 2 0 1 0 .01 0H7Zm10 0a2 2 0 1 0 .01 0H17ZM6.2 6l.8 4h9.8l1.1-4H6.2Zm-.4-2h13.4c.67 0 1.15.64.97 1.28l-1.65 6A1 1 0 0 1 17.56 12H7.4l.4 2H19v2H6.96a1 1 0 0 1-.98-.8L3.82 4H2V2h3a1 1 0 0 1 .98.8L5.8 4Z",
    };

    return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d={paths[name]} fill="currentColor" />
        </svg>
    );
}

function MiniCart({ cart, onClearCart }) {
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    return (
        <aside className="mini-cart" aria-live="polite">
            <div>
                <strong>
                    {itemCount} {itemCount === 1 ? "item" : "items"} added
                </strong>
                <span>{formatCurrency(cart.grandTotal)}</span>
            </div>
            <div className="mini-cart-actions">
                <Link className="button primary mini-cart-action" to="/cart">
                    View cart
                </Link>
                <button className="button ghost mini-cart-delete" type="button" onClick={onClearCart} aria-label="Delete cart">
                    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                        <path fill="currentColor" d="M8 5h8v2H8V5zm10 3H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8zm-2 2v8h-2v-8h2zm-4 0v8H10v-8h2zm7-6H5c-.55 0-1 .45-1 1v1h16V3c0-.55-.45-1-1-1z" />
                    </svg>
                </button>
            </div>
        </aside>
    );
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value || 0);
}

export default App;
