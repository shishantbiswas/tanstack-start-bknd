import {
  createFileRoute,
  Link,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { getApi } from "@/bknd";
import { createServerFn, useServerFn } from "@tanstack/react-start";

export const completeTodo = createServerFn({ method: "POST" })
  .inputValidator(
    (data) => data as { done: boolean; id: number; title: string },
  )
  .handler(async ({ data: todo }) => {
    try {
      const api = await getApi({});
      await api.data.updateOne("todos", todo.id, {
        done: !todo.done,
      });
      console.log("state updated in db");
    } catch (error) {
      console.log(error);
    }
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator((data) => data as { id: number })
  .handler(async ({ data }) => {
    try {
      const api = await getApi({});
      await api.data.deleteOne("todos", data.id);
      console.log("todo deleted from db");
    } catch (error) {
      console.log(error);
    }
  });

export const createTodo = createServerFn({ method: "POST" })
  .inputValidator((data) => data as { title: string })
  .handler(async ({ data }) => {
    try {
      const api = await getApi({});
      await api.data.createOne("todos", { title: data.title });
      console.log("todo created in db");
    } catch (error) {
      console.log(error);
    }
  });

export const getTodo = createServerFn({ method: "POST" }).handler(async () => {
  const api = await getApi({});

  const limit = 5;
  const todos = await api.data.readMany("todos", { limit, sort: "-id" });
  const total = todos.body.meta.total as number;
  return { total, todos, limit };
});

export const Route = createFileRoute("/")({
  ssr:false,
  component: App,
  loader: async () => {
    return await getTodo();
  },
});

function App() {
  const { todos, total, limit } = Route.useLoaderData();
  const router = useRouter();

  const updateTodo = useServerFn(completeTodo);
  const removeTodo = useServerFn(deleteTodo);
  const addTodo = useServerFn(createTodo);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-row items-center ">
          <img
            className="dark:invert size-18"
            src="/tanstack-circle-logo.png"
            alt="Next.js logo"
          />
          <div className="ml-3.5 mr-2 font-mono opacity-70">&amp;</div>
          <img
            className="dark:invert"
            src="/bknd.svg"
            alt="bknd logo"
            width={183}
            height={59}
          />
        </div>
        <Description />
        <div className="flex flex-col border border-foreground/15 w-full py-4 px-5 gap-2">
          <h2 className="font-mono mb-1 opacity-70">
            <code>What's next?</code>
          </h2>
          <div className="flex flex-col w-full gap-2">
            {total > limit && (
              <div className="bg-foreground/10 flex justify-center p-1 text-xs rounded text-foreground/40">
                {total - limit} more todo(s) hidden
              </div>
            )}
            <div className="flex flex-col gap-3">
              {todos.reverse().map((todo) => (
                <div className="flex flex-row" key={String(todo.id)}>
                  <div className="flex flex-row flex-grow items-center gap-3 ml-1">
                    <input
                      type="checkbox"
                      className="flex-shrink-0 cursor-pointer"
                      defaultChecked={!!todo.done}
                      onChange={async () => {
                        await updateTodo({ data: todo });
                        router.invalidate();
                      }}
                    />
                    <div className="text-foreground/90 leading-none">
                      {todo.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer grayscale transition-all hover:grayscale-0 text-xs "
                    onClick={async () => {
                      await removeTodo({ data: { id: todo.id } });
                      router.invalidate();
                    }}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
            <form
              className="flex flex-row w-full gap-3 mt-2"
              key={todos.map((t) => t.id).join()}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get("title") as string;
                await addTodo({ data: { title } });
                router.invalidate();
                e.currentTarget.reset();
              }}
            >
              <input
                type="text"
                name="title"
                placeholder="New todo"
                className="py-2 px-4 flex flex-grow rounded-sm bg-foreground/10 focus:bg-foreground/20 transition-colors outline-none"
              />
              <button type="submit" className="cursor-pointer">
                Add
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const Description = () => (
  <List
    items={[
      "Get started with a full backend.",
      "Focus on what matters instead of repetition.",
    ]}
  />
);

export const List = ({ items = [] }: { items: React.ReactNode[] }) => (
  <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
    {items.map((item, i) => (
      <li key={i} className={i < items.length - 1 ? "mb-2" : ""}>
        {item}
      </li>
    ))}
  </ol>
);

export function Footer() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        to={pathname === "/" ? "/ssr" : ("/" as string)}
      >
        <img
          aria-hidden
          src="/file.svg"
          alt="File icon"
          width={16}
          height={16}
        />
        {pathname === "/" ? "SSR" : "Home"}
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        to={"/admin" as string}
      >
        <img
          aria-hidden
          src="/window.svg"
          alt="Window icon"
          width={16}
          height={16}
        />
        Admin
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        to={"https://bknd.io" as string}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          aria-hidden
          src="/globe.svg"
          alt="Globe icon"
          width={16}
          height={16}
        />
        Go to bknd.io →
      </Link>
    </footer>
  );
}

// function App() {
//   const { user, verified, register, logout, login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [mode, setMode] = useState<"login" | "register">("login");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.SubmitEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       if (mode === "login") {
//         // attempt login
//         await login({ email, password } as any);
//       } else {
//         // attempt register
//         await register({ email, password } as any);
//       }
//       setEmail("");
//       setPassword("");
//     } catch (err: any) {
//       setError(err?.message ?? String(err));
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleLogout() {
//     setLoading(true);
//     try {
//       await logout();
//     } catch (err: any) {
//       setError(err?.message ?? String(err));
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       <main style={{ padding: 20 }} className="App-header">
//         <header>
//           <img
//             src="/tanstack-circle-logo.png"
//             alt="TanStack Logo"
//             style={{ width: "100px", height: "100px" }}
//           />
//         </header>
//         <section></section>

//         <section style={{ maxWidth: 420, margin: "0 auto" }}>
//           <h2 style={{ margin: "24px 0 " }}>Account</h2>
//           {user ? (
//             <div style={{ gap: 8, display: "flex", flexDirection: "column" }}>
//               <div>
//                 <strong>Signed in as:</strong> {user?.email ?? "Unknown"}
//               </div>
//               <div>
//                 <strong>Verified:</strong> {verified ? "Yes" : "No"}
//               </div>
//               <div style={{ display: "flex", gap: 8 }}>
//                 <button onClick={handleLogout} disabled={loading}>
//                   {loading ? "Signing out..." : "Sign out"}
//                 </button>
//                 <Link to={"/admin" as string}>
//                   <button>Go to Admin</button>
//                 </Link>
//               </div>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
//               <div style={{ display: "flex", gap: 8 }}>
//                 <button
//                   type="button"
//                   onClick={() => setMode("login")}
//                   style={{
//                     textDecoration: mode === "login" ? "underline" : "none",
//                   }}
//                 >
//                   Log in
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setMode("register")}
//                   style={{
//                     textDecoration: mode === "register" ? "underline" : "none",
//                   }}
//                 >
//                   Register
//                 </button>
//               </div>

//               <input
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 style={{
//                   border: "1px solid white",
//                   padding: "4px",
//                   borderRadius: "4px",
//                 }}
//                 type="email"
//               />

//               <input
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 style={{
//                   border: "1px solid white",
//                   padding: "4px",
//                   borderRadius: "4px",
//                 }}
//                 type="password"
//               />

//               {error ? <div style={{ color: "#ff6b6b" }}>{error}</div> : null}

//               <button type="submit" disabled={loading}>
//                 {loading
//                   ? "Please wait..."
//                   : mode === "login"
//                     ? "Log in"
//                     : "Create account"}
//               </button>
//             </form>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }
