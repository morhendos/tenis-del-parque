# Admin Docs Viewer Feature

This feature adds a documentation viewer to the admin panel, allowing administrators to easily browse and read all markdown documentation files from the `/docs` folder.

## Features

- 📚 **Documentation List Page** (`/admin/docs`)
  - Lists all `.md` files from the docs folder
  - Shows title, description, file size, and last modified date
  - Categorizes docs with emojis based on filename
  - Responsive grid layout

- 📖 **Individual Doc Viewer** (`/admin/docs/[slug]`)
  - Renders markdown with proper formatting
  - Supports GitHub Flavored Markdown (tables, checkboxes, etc.)
  - Custom styling for all markdown elements
  - Link to view on GitHub
  - Back navigation to docs list

- 🔐 **Security**
  - Admin authentication required
  - Path traversal protection
  - Only reads files from the `/docs` directory

- 🎨 **UI Integration**
  - Added documentation card to admin dashboard
  - Consistent styling with the rest of the admin panel
  - Mobile responsive design

## Usage

1. Go to the admin dashboard
2. Click on the "Documentation" card (pink card with 📚 icon)
3. Browse available documentation
4. Click on any doc to read it in a nicely formatted view

## Dependencies Added

- `react-markdown` - For rendering markdown content
- `remark-gfm` - For GitHub Flavored Markdown support

## Files Added

- `/app/api/admin/docs/route.js` - API endpoint for listing and reading docs
- `/app/admin/docs/page.js` - Documentation list page
- `/app/admin/docs/[slug]/page.js` - Individual doc viewer page
- Updated `/app/admin/dashboard/page.js` - Added documentation link

## Installation

After pulling this branch, run:
```bash
npm install
```

This will install the new dependencies needed for markdown rendering.
