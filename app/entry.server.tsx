import "dotenv/config"
import { renderToString } from "react-dom/server"
import type { EntryContext } from "remix"
import { RemixServer } from "remix"
import { inline } from "twind"
import { setupTwind } from "./twind-setup"

setupTwind()

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const markup = inline(
    renderToString(<RemixServer context={remixContext} url={request.url} />),
  )

  responseHeaders.set("Content-Type", "text/html")

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
