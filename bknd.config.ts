import { type BkndConfig, em, entity, text, boolean } from "bknd";

// Unrelated to framework adapters
import { registerLocalMediaAdapter } from "bknd/adapter/node";

const local = registerLocalMediaAdapter();


// --------------------- SCHEMA -----------------------
// this just for testing
const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
  post:entity("posts",{
    title: text(),
    content: text(),
  })
});

// --------------------- SCHEMA END -----------------------

export default {
  connection: {
    url: "data.db",
  },
  options: {},
  config: {
    data: schema.toJSON(),
    auth: { enabled: true },
    media: {
      enabled: true,
      adapter: local({
        path: "./public/uploads",
      }),
    },
  },
} satisfies BkndConfig;
