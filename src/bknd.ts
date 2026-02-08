// Both work just fine
// import { getApp as getBkndApp } from "bknd/adapter/react-router";
import { getApp as getBkndApp } from "bknd/adapter/nextjs";
import config from "../bknd.config";

export async function getApi({
  headers,
  verify,
}: {
  verify?: boolean;
  headers?: Headers;
}) {
  const app = await getBkndApp(config, process.env);

  if (verify) {
    const api = app.getApi({ headers });
    await api.verifyAuth();
    return api;
  }

  return app.getApi();
}
