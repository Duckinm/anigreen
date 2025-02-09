import { config } from "dotenv"
import { join } from "node:path"
import { startServer } from "./server.mjs"

if (process.env.NODE_ENV === "test") {
  config({ path: join(process.cwd(), ".env.test") })
  const { anilistApiMockServer } = await import(
    "../test/anilist-api-mock-server.mjs"
  )
  anilistApiMockServer.listen()
  await startServer()
} else {
  await startServer({ logging: true })
}
