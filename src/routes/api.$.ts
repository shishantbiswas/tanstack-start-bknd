import { createFileRoute } from "@tanstack/react-router";
import config from "../../bknd.config";

// Works fine
import { serve } from "bknd/adapter/nextjs";

const handler = serve({
  ...config,
});

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => await handler(request),
    },
  },
});
