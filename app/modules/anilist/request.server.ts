import type { DocumentNode } from "graphql"
import { print } from "graphql"
import { setTimeout } from "node:timers/promises"
import { inspect } from "node:util"

type AnyRecord = { [key: string]: unknown }

type RequestOptions<Variables extends AnyRecord> = {
  document: DocumentNode
  accessToken?: string
} & RequestVariables<Variables>

// prettier-ignore
type RequestVariables<Variables> =
  Variables extends { [key: string]: never }
    ? { variables?: undefined }
    : { variables: Variables }

export async function anilistRequest<
  Result extends AnyRecord,
  Variables extends AnyRecord,
>(options: RequestOptions<Variables>): Promise<Result> {
  const { document, variables, accessToken } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers,
    body: JSON.stringify({ query: print(document), variables }),
  })

  if (response.status === 429) {
    const retryAfterSeconds = Number(response.headers.get("retry-after"))
    if (Number.isFinite(retryAfterSeconds)) {
      await setTimeout(retryAfterSeconds * 1000)
      return anilistRequest(options)
    }
  }

  if (!response.ok) {
    raiseRequestError(
      document,
      variables,
      response,
      response.statusText || "Unknown error",
    )
  }

  const json = await response.json()
  if (json.errors) {
    console.warn(
      "errors:",
      inspect(json.errors, { depth: Number.POSITIVE_INFINITY }),
    )
    raiseRequestError(
      document,
      variables,
      response,
      json.errors[0]?.message || response.statusText || "Unknown error",
    )
  }

  return json.data
}

function raiseRequestError(
  document: DocumentNode,
  variables: unknown,
  response: Response,
  message: string,
): never {
  console.warn("query:", print(document))
  console.warn(
    "variables:",
    inspect(variables, { depth: Number.POSITIVE_INFINITY }),
  )
  throw new Error(
    `Anilist request failed (status ${response.status}): ${message}`,
  )
}
