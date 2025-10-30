# Homer API Client Package

This directory contains the complete Homer API client for accessing the Homer Co-pilot GraphQL API.

## 📦 What's Included

```
homer-api/
├── lib/
│   └── homer-api.ts          # Complete Homer API client with all GraphQL queries
├── contexts/
│   └── PartnerContext.tsx    # Partner configuration context (requires Supabase)
└── README.md                 # This file
```

## 🎯 Features

The Homer API client provides access to:

### Authentication
- Login/logout
- User registration
- Session management with tokens

### Homes Management
- Get all homes
- Get home details
- Home user management

### Cards & Pions
- Get cards with tags
- Get detailed card information
- Create, update, delete pions (photos, PDFs, notes, brands, timelines, etc.)
- File upload support

### Crows (Tasks & Lists)
- Get task lists
- Create, update, delete tasks
- Reorder tasks
- Mark tasks as complete
- Delete completed tasks

### Timeline
- Get timeline events
- Create timeline pions
- Filter by date ranges

### Search
- Search across cards, pions, tags, and files
- Filter by type

## 📋 Installation Steps

### 1. Copy Files to Shared Repo

Copy the entire `homer-api` folder to:
```
packages/homer-components/src/homer-api/
```

### 2. Update Main Index

In `packages/homer-components/src/index.ts`, add:

```typescript
// Homer API Client
export { homerAPI, extractHomerPartnerCode, extractPartnerFromHome } from './homer-api/lib/homer-api';
export * from './homer-api/lib/homer-api'; // Export all types

// Partner Context (optional - requires Supabase)
export { PartnerProvider, usePartner } from './homer-api/contexts/PartnerContext';
```

### 3. Update package.json

The Homer API has minimal dependencies, but PartnerContext requires:

```json
{
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.58.0", // Only if using PartnerContext
    "i18next": "^25.6.0" // Only if using PartnerContext
  }
}
```

## 🚀 Usage in Other Projects

### Basic Setup

```typescript
import { homerAPI } from '@homer-hq/shared-components';

// Configure API URLs (optional - defaults to staging)
// The client is already instantiated, but you can create a new one:
import { HomerAPIClient } from '@homer-hq/shared-components';
const customAPI = new HomerAPIClient(
  'https://your-api.homer.co/graphql',
  'https://your-files-api.homer.co/graphql'
);

// Login
const user = await homerAPI.login('user@example.com', 'password');
console.log('Logged in:', user);

// Get homes
const homes = await homerAPI.getHomes();
console.log('User homes:', homes);

// Get cards for a home
const cards = await homerAPI.getCardsWithTags(homeId);
console.log('Home cards:', cards);
```

### With Partner Context (Optional)

If you want to use the PartnerContext for partner theming, you need Supabase:

```typescript
import { PartnerProvider, usePartner } from '@homer-hq/shared-components';

// Wrap your app
function App() {
  return (
    <PartnerProvider>
      <YourApp />
    </PartnerProvider>
  );
}

// Use in components
function MyComponent() {
  const { partner, isLoading } = usePartner();
  
  if (isLoading) return <div>Loading partner config...</div>;
  
  return (
    <div style={{ color: partner?.partnerAccentColor }}>
      <h1>{partner?.partnerDisplayName}</h1>
      <img src={partner?.partnerLogo.headerLogo} alt="Logo" />
    </div>
  );
}
```

**Note:** PartnerContext requires a Supabase `partners` table with the schema used in this project.

### Authentication Flow

```typescript
// Login
const user = await homerAPI.login(email, password);
// Token is automatically stored in localStorage

// Check if authenticated
const token = homerAPI.token; // null if not authenticated

// Get current user
const currentUser = await homerAPI.getUser();

// Logout
await homerAPI.logout();
// Token is automatically cleared
```

### Working with Homes & Cards

```typescript
// Get all homes
const homes = await homerAPI.getHomes();

// Get a specific home
const home = await homerAPI.getHome(homeId);

// Get cards with tags
const cards = await homerAPI.getCardsWithTags(homeId);

// Get detailed card information
const card = await homerAPI.getCardDetails(homeId, cardId);

// Get a single card
const singleCard = await homerAPI.getCard(cardId);
```

### Working with Pions

```typescript
// Get detailed pion
const pion = await homerAPI.getPion(pionId);

// Create a photo pion
const photoPion = await homerAPI.createPhotoPion(
  homeId,
  cardId,
  ['photo-id-1', 'photo-id-2'],
  'My Photos'
);

// Create a note pion
const notePion = await homerAPI.createNotePion(
  homeId,
  cardId,
  'My Note Title',
  'Note content here'
);

// Create a PDF pion
const pdfPion = await homerAPI.createPDFPion(
  homeId,
  cardId,
  'file-id',
  'Document.pdf'
);

// Update pion title
await homerAPI.updatePionTitle(pionId, 'New Title');

// Delete pion
await homerAPI.deletePion(pionId);
```

### Working with Tasks (Crows)

```typescript
// Get all task lists for a home
const taskLists = await homerAPI.getCrowLists(homeId, 'tasksList');

// Create a task list
const newList = await homerAPI.createCrowList(
  homeId,
  'tasksList',
  'My Tasks'
);

// Get tasks in a list
const tasks = await homerAPI.getCrows(homeId, taskListId, 'task');

// Create a task
const newTask = await homerAPI.createCrow(homeId, 'task', {
  title: 'Buy materials',
  description: 'Get wood and nails',
  tasksList: taskListId,
  done: false
});

// Update a task
await homerAPI.updateCrow(taskId, { 
  done: true 
}, homeId);

// Delete completed tasks
await homerAPI.deleteCrowListCrows(taskListId, homeId, 'completed');

// Delete a task
await homerAPI.deletePion(taskId);
```

### File Uploads

```typescript
// Upload a file
const file = document.querySelector('input[type="file"]').files[0];
const uploadedFile = await homerAPI.uploadFile(file);

console.log('File uploaded:', uploadedFile.id, uploadedFile.url);

// Then create a pion with the file
const pdfPion = await homerAPI.createPDFPion(
  homeId,
  cardId,
  uploadedFile.id,
  file.name
);
```

### Timeline

```typescript
// Get timeline pions
const timelineEvents = await homerAPI.getTimelinePions(homeId);

// Filter by date
const filtered = await homerAPI.getTimelinePions(
  homeId,
  '2024-01-01',
  '2024-12-31'
);

// Get timeline by card
const cardTimeline = await homerAPI.getTimelinePionsByCard(cardId);
```

### Search

```typescript
// Search all content
const results = await homerAPI.search(homeId, 'kitchen');

console.log('Found:', {
  cards: results.cards,
  pions: results.pions,
  tags: results.tags,
  files: results.files
});

// Search specific types
const cardResults = await homerAPI.search(homeId, 'kitchen', 'cards');
```

### Card & Tag Management

```typescript
// Update card tags
const updatedCard = await homerAPI.updateCardTags(
  homeId,
  cardId,
  ['tag-id-1', 'tag-id-2']
);

// Mark card as read
await homerAPI.markCardAsRead(cardId);

// Mark pion as read
await homerAPI.markPionAsRead(pionId);
```

## 📚 Type Definitions

All TypeScript types are exported:

```typescript
import type {
  User,
  Home,
  Card,
  Pion,
  DetailedPion,
  PhotoPion,
  PDFPion,
  NotePion,
  BrandPion,
  TimelinePion,
  CrowList,
  CrowTask,
  Tag,
  Photo,
  HomerFile,
  HomerPartner,
  Activity,
  SearchResults
} from '@homer-hq/shared-components';
```

## 🔧 Configuration

### Custom API URLs

```typescript
import { HomerAPIClient } from '@homer-hq/shared-components';

const customAPI = new HomerAPIClient(
  'https://production-core.homer.co/graphql',
  'https://production-files.homer.co/graphql'
);

// Use customAPI instead of homerAPI
const user = await customAPI.login(email, password);
```

### Session Management

The client uses localStorage for token storage with the key `homer_token`. You can:

```typescript
// Get current token
const token = homerAPI.token;

// Set token manually
homerAPI.setToken('your-token-here');

// Clear token
homerAPI.clearToken();

// Get session ID (for tracking)
const sessionId = homerAPI.getSessionId();
```

## ⚠️ Important Notes

### Partner Context Dependencies

The `PartnerContext` is **optional** and requires:
- A Supabase project with a `partners` table
- i18next for internationalization
- Supabase client configured

If you don't need partner theming/branding, you can skip including PartnerContext.

### API URLs

By default, the client points to Homer's **staging** environment:
- Core API: `https://staging-core.homer.co/graphql`
- Files API: `https://staging-files.homer.co/graphql`

For production, create a new client instance with production URLs.

### Error Handling

The client includes automatic retry logic (up to 3 attempts) for:
- 401/403 errors
- 500+ errors
- Network failures

All methods can throw errors, so wrap in try-catch:

```typescript
try {
  const homes = await homerAPI.getHomes();
} catch (error) {
  console.error('Failed to load homes:', error);
}
```

## 🔐 Security

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- All requests include session tracking via `X-Homer-Session-Id` header
- The client supports Bearer token authentication

## 📖 Full API Reference

See the inline JSDoc comments in `homer-api.ts` for detailed documentation of all methods.

## 🤝 Contributing

When adding new Homer API methods:
1. Follow the existing pattern (GraphQL query + request wrapper)
2. Add TypeScript types for request/response
3. Include error handling
4. Update this README with usage examples
