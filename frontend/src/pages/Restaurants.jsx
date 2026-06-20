import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";

const PAGE_SIZE = 12;

function Restaurants({ searchQuery = "", onSearchChange = () => {} }) {
    const [restaurants, setRestaurants] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/restaurants", {
                params: { page, size: PAGE_SIZE },
            });

            setRestaurants(response.data.content || []);
            setError("");
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

    useEffect(() => {
        const timeoutId = window.setTimeout(loadRestaurants, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadRestaurants]);

    const filteredRestaurants = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return restaurants;
        }

        return restaurants.filter((restaurant) => {
            return [restaurant.name, restaurant.address, restaurant.ownerName]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery));
        });
    }, [searchQuery, restaurants]);

    return (
        <div className="page-stack">
            <section className="market-hero">
                <div className="market-hero-copy">
                    <p className="eyebrow">QuickByte marketplace</p>
                    <h1>Restaurant favourites, delivered with pace.</h1>
                    <p className="hero-copy">Browse fresh menus, build your cart, and track every order from one clean place.</p>
                </div>
                <div className="market-hero-visual" aria-hidden="true">
                    <div className="hero-visual-copy">
                        <p className="eyebrow">Freshly curated</p>
                        <h2>Order from local favorites in just a few taps.</h2>
                        <p>Explore top restaurants, discover dishes, and see delivery times before you checkout.</p>
                    </div>
                </div>
            </section>

            {error && <div className="alert error">{error}</div>}

            <section className="toolbar search-top">
                <div>
                    <h2>Restaurants near you</h2>
                    <p>
                        Showing {filteredRestaurants.length} of {pageInfo.totalElements}
                    </p>
                </div>
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

            {loading ? (
                <div className="grid-list">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div className="skeleton-card" key={index} />
                    ))}
                </div>
            ) : filteredRestaurants.length > 0 ? (
                <section className="grid-list" aria-label="Restaurants">
                    {filteredRestaurants.map((restaurant, index) => (
                        <article className="restaurant-card" key={restaurant.id}>
                            <div className={`restaurant-media tone-${(index % 6) + 1}`}>
                                <span>{getInitials(restaurant.name)}</span>
                            </div>
                            <div className="card-body">
                                <div className="card-title-row">
                                    <h2>{restaurant.name}</h2>
                                    <span className="rating-badge">
                                        <small>Rating</small>
                                        {formatRating(restaurant.rating)}
                                    </span>
                                </div>
                                <p>{restaurant.address || "Address not provided"}</p>
                                <small>Managed by {restaurant.ownerName || "restaurant team"}</small>
                            </div>
                            <Link
                                className="button primary stretch card-action"
                                to={`/restaurants/${restaurant.id}/menu`}
                                state={{ restaurant }}
                            >
                                View menu
                            </Link>
                        </article>
                    ))}
                </section>
            ) : (
                <EmptyState
                    title={searchQuery ? "No matching restaurants" : "No restaurants yet"}
                    body={searchQuery ? "Try a different search term." : "New restaurants will appear here as owners add them."}
                />
            )}
        </div>
    );
}

function EmptyState({ title, body }) {
    return (
        <section className="empty-state">
            <h2>{title}</h2>
            <p>{body}</p>
        </section>
    );
}

function formatRating(rating) {
    return Number.isFinite(rating) ? rating.toFixed(1) : "New";
}

function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

export default Restaurants;
