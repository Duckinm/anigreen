import gql from "graphql-tag"
import type {
  MediaExternalLink,
  MediaFragment,
  MediaListEntryFragment,
  MediaListStatus,
} from "~/generated/anilist-graphql"
import { isTruthy } from "~/modules/common/is-truthy"

export type AnilistMedia = {
  id: number
  title: string
  format?: string
  bannerImageUrl?: string
  coverImageUrl?: string
  coverColor?: string
  episodeCount?: number
  anilistUrl?: string
  currentEpisode?: number
  nextEpisodeAiringTime?: number
  externalLinks: MediaExternalLink[]
  watchListEntry?: AnilistMediaListEntry
}

export type AnilistMediaListEntry = {
  mediaListId: number
  status: MediaListStatus
  progress: number
}

export const mediaFragment = gql`
  fragment media on Media {
    id
    siteUrl
    title {
      native
      romaji
      english
      userPreferred
    }
    format
    bannerImage
    coverImage {
      medium
      large
      extraLarge
      color
    }
    episodes
    externalLinks {
      id
      url
      site
    }
    nextAiringEpisode {
      episode
      airingAt
    }
  }
`

export const mediaListEntryFragment = gql`
  fragment mediaListEntry on MediaList {
    id
    status
    progress
  }
`

export function extractMediaData(
  media: MediaFragment,
  mediaListEntry: MediaListEntryFragment | undefined,
): AnilistMedia {
  const { title } = media ?? {}

  const titleText =
    title?.userPreferred ||
    title?.english ||
    title?.romaji ||
    title?.native ||
    "Unknown Title"

  return {
    id: media.id,
    title: titleText,
    format: media.format?.replace(/[^A-Za-z]+/g, " "),
    episodeCount: media.episodes,
    bannerImageUrl: media.bannerImage,
    coverImageUrl: media.coverImage?.large,
    coverColor: media.coverImage?.color,
    anilistUrl: media.siteUrl,
    externalLinks: media.externalLinks?.filter(isTruthy) ?? [],
    currentEpisode: media.nextAiringEpisode
      ? media.nextAiringEpisode.episode - 1
      : media.episodes,
    nextEpisodeAiringTime: media.nextAiringEpisode
      ? media.nextAiringEpisode.airingAt * 1000
      : undefined,
    watchListEntry: mediaListEntry?.status && {
      mediaListId: mediaListEntry.id,
      status: mediaListEntry.status,
      progress: mediaListEntry.progress ?? 0,
    },
  }
}
