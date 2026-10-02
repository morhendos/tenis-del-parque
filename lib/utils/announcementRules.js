import { announcementContent } from '../content/announcementContent'

export const isLeagueLive = (league) => league?.status === 'active'

export const isAnnouncementExpired = (announcement, now = new Date()) =>
  !!announcement?.expiresAt && new Date(announcement.expiresAt) < now

export const getRoundOneAnnouncementId = (match) => {
  const leagueSlug = match.league?.slug || 'unknown'
  return match.isBye === true
    ? `${announcementContent.byeRound.id}-${leagueSlug}-round-${match.round}`
    : `${announcementContent.firstRoundMatch.id}-${leagueSlug}`
}

export const getLiveRoundOneMatches = (matches) =>
  (matches || []).filter(match => match.round === 1 && isLeagueLive(match.league))

export const getLeagueTargetedAnnouncements = (playerLeagueSlugs, seenAnnouncements) =>
  Object.values(announcementContent).filter(announcement =>
    announcement.targetLeagues?.length > 0 &&
    !isAnnouncementExpired(announcement) &&
    announcement.targetLeagues.some(slug => playerLeagueSlugs.includes(slug)) &&
    !seenAnnouncements.includes(announcement.id)
  )
