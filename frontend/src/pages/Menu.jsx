import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";
import toast from "react-hot-toast";

const PAGE_SIZE = 30;

function Menu({ cartSummary, onCartChange, session }) {
    const { restaurantId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const restaurant = location.state?.restaurant;
    const [menuItems, setMenuItems] = useState([]);
    const [pageInfo, setPageInfo] = useState({ totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingId, setAddingId] = useState(null);

    const loadMenu = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/restaurants/${restaurantId}/menu`, {
                params: { page: 0, size: PAGE_SIZE },
            });

            setMenuItems(response.data.content || []);
            setError("");
            setPageInfo({
                totalElements: response.data.totalElements ?? 0,
            });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        const timeoutId = window.setTimeout(loadMenu, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadMenu]);

    const groupedItems = useMemo(() => {
        return menuItems.reduce((groups, item) => {
            const category = item.category || "Featured";
            groups[category] = groups[category] || [];
            groups[category].push(item);
            return groups;
        }, {});
    }, [menuItems]);

    const cartQuantities = useMemo(() => {
        return (cartSummary?.items || []).reduce((quantities, item) => {
            quantities[item.menuItemId] = item.quantity;
            return quantities;
        }, {});
    }, [cartSummary]);

    const restaurantName = restaurant?.name || menuItems[0]?.restaurantName || "Restaurant menu";

    async function handleAddToCart(item) {
        if (!session) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }

        setAddingId(item.id);

        try {
            await api.post("/cart/add", {
                menuItemId: item.id,
                quantity: 1,
            });

            toast.success("Added to cart");
            await onCartChange?.();
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setAddingId(null);
        }
    }

    return (
        <div className="page-stack">
            <section className="page-heading menu-heading">
                <Link className="back-link" to="/">
                    Back to restaurants
                </Link>
                <p className="eyebrow">Menu</p>
                <h1>{restaurantName}</h1>
                <p>
                    {restaurant?.address || `${pageInfo.totalElements} dishes available`} - {pageInfo.totalElements} items
                </p>
            </section>

            {error && <div className="alert error">{error}</div>}

            {loading ? (
                <div className="menu-list">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div className="skeleton-row" key={index} />
                    ))}
                </div>
            ) : menuItems.length > 0 ? (
                <section className="menu-list" aria-label={`${restaurantName} menu`}>
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div className="menu-section" key={category}>
                            <h2>{category}</h2>
                            {items.map((item) => (
                                <article className="menu-item" key={item.id}>
                                    <div>
                                        <div className="card-title-row">
                                            <h3>{item.name}</h3>
                                            <span className="price">{formatCurrency(item.price)}</span>
                                        </div>
                                        <p>{item.description}</p>
                                        {!item.available && <span className="status-chip muted">Unavailable</span>}
                                    </div>
                                    <div className="add-control">
                                        {cartQuantities[item.id] > 0 && (
                                            <span className="quantity-chip">{cartQuantities[item.id]} in cart</span>
                                        )}
                                        <button
                                            className="button primary"
                                            type="button"
                                            disabled={!item.available || addingId === item.id}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            {addingId === item.id ? "Adding..." : "Add"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ))}
                </section>
            ) : (
                <section className="empty-state">
                    <h2>No menu items yet</h2>
                    <p>This restaurant has not published dishes yet.</p>
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

export default Menu;
