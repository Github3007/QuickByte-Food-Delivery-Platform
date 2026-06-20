import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";

const ROLES = [
    { value: "CUSTOMER", label: "Customer" },
    { value: "RESTAURANT_OWNER", label: "Restaurant owner" },
    { value: "DELIVERY_PARTNER", label: "Delivery partner" },
];

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register", form);
            navigate("/login?registered=1", {
                state: { email: form.email },
            });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    function updateForm(field, value) {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
    }

    return (
        <section className="auth-page">
            <div className="auth-card wide-card">
                <p className="eyebrow">Create account</p>
                <h1>Join QuickByte</h1>
                <p>Choose a role that matches the backend permissions you want to test.</p>

                {error && <div className="alert error">{error}</div>}

                <form className="form-stack" onSubmit={handleSubmit}>
                    <label>
                        Name
                        <input
                            required
                            type="text"
                            autoComplete="name"
                            value={form.name}
                            onChange={(event) => updateForm("name", event.target.value)}
                        />
                    </label>
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
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(event) => updateForm("password", event.target.value)}
                        />
                    </label>
                    <label>
                        Role
                        <select value={form.role} onChange={(event) => updateForm("role", event.target.value)}>
                            {ROLES.map((role) => (
                                <option value={role.value} key={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button className="button primary stretch" type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already registered? <Link to="/login">Login</Link>
                </p>
            </div>
        </section>
    );
}

export default Register;
