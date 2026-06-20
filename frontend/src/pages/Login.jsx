import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api, { ROLES, getApiErrorMessage, getRoleHome, resolveStoredSessionRole, setAuthToken } from "../services/api";
import toast from "react-hot-toast";

function Login({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        email: location.state?.email || "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const registered = searchParams.get("registered") === "1";

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", form);
            setAuthToken(response.data.token);
            const resolvedSession = await resolveStoredSessionRole();
            onLogin(resolvedSession);
            toast.success("Login successful");
            const requestedRedirect = searchParams.get("redirect");
            const destination =
                resolvedSession?.role === ROLES.CUSTOMER && requestedRedirect
                    ? requestedRedirect
                    : getRoleHome(resolvedSession?.role);

            navigate(destination, { replace: true });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
            toast.error(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    function updateForm(field, value) {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <p className="eyebrow">Welcome back</p>
                <h1>Login to QuickByte</h1>
                <p>Your dashboard opens automatically based on your account role.</p>

                {registered && <div className="alert success">Registration complete. You can login now.</div>}
                {error && <div className="alert error">{error}</div>}

                <form className="form-stack" onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            required
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => updateForm("email", event.target.value)}
                        />
                    </label>
                    <label>
                        Password
                        <input
                            required
                            minLength="6"
                            type="password"
                            autoComplete="current-password"
                            value={form.password}
                            onChange={(event) => updateForm("password", event.target.value)}
                        />
                    </label>
                    <button className="button primary stretch" type="submit" disabled={loading}>
                        {loading ? "Opening workspace..." : "Login"}
                    </button>
                </form>

                <p className="auth-switch">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </section>
    );
}

export default Login;
