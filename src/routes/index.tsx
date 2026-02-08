import { createFileRoute, Link } from "@tanstack/react-router";
import "../App.css";
import { useAuth } from "bknd/client";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { user, verified, register, logout, login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        // attempt login
        await login({ email, password } as any);
      } else {
        // attempt register
        await register({ email, password } as any);
      }
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <main style={{ padding: 20 }} className="App-header">
        <header>
          <img
            src="/tanstack-circle-logo.png"
            alt="TanStack Logo"
            style={{ width: "100px", height: "100px" }}
          />
        </header>
        <section>

        </section>

        <section style={{ maxWidth: 420, margin: "0 auto" }}>
          <h2 style={{margin:"24px 0 "}}>Account</h2>
          {user ? (
            <div style={{ gap: 8, display: "flex", flexDirection: "column" }}>
              <div>
                <strong>Signed in as:</strong> {user?.email ?? "Unknown"}
              </div>
              <div>
                <strong>Verified:</strong> {verified ? "Yes" : "No"}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleLogout} disabled={loading}>
                  {loading ? "Signing out..." : "Sign out"}
                </button>
                <Link to={"/admin" as string}>
                  <button>Go to Admin</button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{ textDecoration: mode === "login" ? "underline" : "none" }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  style={{ textDecoration: mode === "register" ? "underline" : "none" }}
                >
                  Register
                </button>
              </div>

              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  border: "1px solid white",
                  padding: "4px",
                  borderRadius: "4px"
                }}
                type="email"
              />

              <input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: "1px solid white",
                  padding: "4px",
                  borderRadius: "4px"
                }}
                type="password"
              />

              {error ? <div style={{ color: "#ff6b6b" }}>{error}</div> : null}

              <button type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Log in"
                    : "Create account"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
