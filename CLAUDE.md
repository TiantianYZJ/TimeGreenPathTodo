# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**时光绿径待办 (TimeGreen Path Todo)** — A WeChat Mini Program todo application with a Node.js/Express backend and MySQL database. Features include todo management with drag-and-drop, combo/shared combos (grouped todos), collaboration, calendar, voice input (WechatSI), statistics, community posts, tools (password generator, motivation, etc.), and admin panel.

## Architecture

### Frontend (WeChat Mini Program)

- **`app.js`** — Global app logic: config loading, auth, data sync, calendar cache, navigation bar info, version check, scene/share link handling
- **`app.json`** — Page registration with 5 main tab pages + 5 subPackages, preload rules, tabBar config
- **`utils/api.js`** — Centralized API client: `authApi`, `todosApi`, `tagsApi`, `combosApi`, `collabApi`, `configApi`, `notifyApi`, `shareApi`, `adminApi`, `postsApi`, `reportsApi`. Auto-attaches JWT, handles 401 redirect
- **`utils/sync.js`** — Offline-first local/cloud sync: per-todo incremental storage (`todo_{id}` keys), change-tracking, conflict resolution, full-sync fallback
- **`utils/logger.js`** — Level-based frontend logging (DEBUG/INFO/WARN/ERROR) with env-aware sampling, auto ERROR batch reporting
- **`utils/util.js`** — Date/time formatting utilities
- UI: TDesign Miniprogram components, custom navigation bar, dark green theme (`--primary-color: #00b26a`)

### Backend (`backend/`)

- **`app.js`** — Express server (port 3000), mounts 16 route groups
- **`config/database.js`** — MySQL connection pool + `query()` / `transaction()` helpers
- **`middleware/auth.js`** — JWT verification middleware (`authMiddleware`, `optionalAuth`)
- **`middleware/requestLogger.js`** — Request logging middleware
- **`services/wechatService.js`** — WeChat notification/template message service
- **`services/qrcodeSession.js`** — QR code login session management
- **Controllers** (`controllers/`) — Business logic: auth, todos, tags, combos, collab, config, admin, posts, comments, likes, reports, share, upload, notify, log
- **Routes** (`routes/`) — Express routers delegating to controllers

### SubPackages

| Package | Root | Pages |
|---------|------|-------|
| Main tabs | `pages/` | todo, calendar, community-home, stats, more |
| Admin | `packageAdmin/` | index, users, user-detail, notices, notice-edit, changelog, changelog-edit, reports, report-detail |
| Combo | `packageCombo/` | combo-edit, combo-detail, collaboration, combo-stats |
| Tools | `packageTools/` | eating, password-generator, motivation, star, acknowledge, join-collab, trash, datamanage, tag-manage |
| Pages | `packagePages/` | add-todo, changelog, daily-stats, day-todos, guide, login, notice, todo-detail, share-config, todo-search, user-center |
| Community | `packageCommunity/` | post-detail, post-edit |

## Database

MySQL database `timegreenpath`. Tables include: `users`, `tags`, `todo_tags`, `todos`, `combos`, `combo_items`, `collab_todos`, `collab_members`, `collab_messages`, `posts`, `post_likes`, `post_images`, `comments`, `comment_likes`, `notices`, `changelogs`, `reports`, `qr_sessions`.

## Common Commands

```bash
# Backend
cd backend
npm start          # Start production server (port 3000)
npm run dev        # Start with nodemon (hot reload)

# Miniprogram is built via WeChat Developer Tools (project.config.json)
# No CLI build step for the frontend
```

## Key Patterns

- **Auth**: JWT token stored in `wx.getStorageSync('authToken')`, attached as `Authorization: Bearer` header
- **Sync**: Offline-first with incremental storage (`todo_{id}` keys in wx storage), timestamp-based conflict resolution, periodic cloud sync
- **API**: All requests go through `utils/api.js` `request()` wrapper with auto auth, 401 handling, error normalization
- **Data flow**: Miniprogram → `utils/api.js` → Express routes/controllers → MySQL; local storage as read/write cache
