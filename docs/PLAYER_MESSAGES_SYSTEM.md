# Player Messages System

## Overview

The Player Messages System is a feature that allows administrators and the platform to communicate important announcements to players through the player dashboard. It includes a dedicated messages page, announcement modals, and tracking of read/unread status.

## Key Components

### 1. Messages Page (`/player/messages`)
- Located in the player dashboard sidebar
- Shows all messages including welcome messages and announcements
- Visual indicators for new/unread messages
- Click any message to view it in a modal

### 2. Announcement Modal
- Automatically shown on first login when there's a new announcement
- Bilingual support (Spanish/English)
- Clean, professional design matching the welcome modal
- Marks announcements as seen when closed

### 3. Database Schema Updates
```javascript
// User Model - Added field
seenAnnouncements: {
  type: [String],
  default: []
}
```

### 4. Navigation Badge
- Shows "New" badge in sidebar when there are unread announcements
- Badge disappears after viewing the announcement

## Content Management

### Adding New Announcements

1. Edit `/lib/content/announcementContent.js`
2. Add a new announcement object with:
   - Unique ID
   - Date
   - Spanish and English content
   - Title, subtitle, content HTML, and button text

Example:
```javascript
export const announcementContent = {
  yourAnnouncementKey: {
    id: 'unique-announcement-id',
    date: new Date('2025-01-05T23:00:00'),
    es: {
      title: 'Título del Anuncio',
      subtitle: 'Subtítulo',
      content: `<p>Contenido HTML</p>`,
      buttonText: 'Entendido'
    },
    en: {
      title: 'Announcement Title',
      subtitle: 'Subtitle',
      content: `<p>HTML content</p>`,
      buttonText: 'Got it'
    }
  }
}
```

3. Update the player layout to reference the new announcement

## API Endpoints

### Mark Message as Seen
```
POST /api/player/messages/mark-seen
Body: { messageId: string }
```

## Implementation Details

### Auto-display Logic
The system checks if a user has seen an announcement by:
1. Checking the `seenAnnouncements` array in their user record
2. If the announcement ID is not in the array, show the modal
3. When closed, add the ID to the array via API call

### Message Types
Currently supports two types:
1. **Welcome Messages** - Shown to new users
2. **Announcements** - Important updates shown to all users

## Future Enhancements

Potential improvements for the future:
1. Admin interface to create announcements without code changes
2. Targeted announcements (by league, level, etc.)
3. Email notifications for critical announcements
4. Announcement scheduling
5. Rich text editor for announcement content
6. Analytics on announcement views

## Usage Example

The first implementation was used to announce a delay in first round pairings:
- Original plan: Sunday after 23:00
- New plan: Monday evening
- Reason: Give all registered players time to activate accounts
- Message encouraged users to remind others to activate

This demonstrates the system's value for time-sensitive communications that need to reach all active players immediately.
