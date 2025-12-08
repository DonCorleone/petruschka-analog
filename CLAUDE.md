# Petruschka Analog - Codebase Architecture Guide

This document provides an architectural overview of the Petruschka Analog project, a modern Angular music band website built with Analog.js, designed to help future Claude instances understand the codebase structure and patterns.

## Quick Facts

- **Framework**: Angular 20 + Analog.js meta-framework
- **Build Tool**: Vite
- **Rendering**: SSR (Server-Side Rendering) + SSG (Static Site Generation)
- **Backend**: MongoDB with Node.js API routes
- **Language**: TypeScript (strict mode)
- **Node Version**: ≥ 20.19.1

## 1. Project Structure Overview

```
petruschka-analog/
├── src/
│   ├── app/                    # Angular application root
│   │   ├── core/              # Core services, layout components, interceptors
│   │   ├── features/          # Feature modules (gigs, music, merch, etc.)
│   │   ├── pages/             # File-based routing pages (Analog.js pattern)
│   │   ├── shared/            # Shared pipes, components, utilities
│   │   ├── app.ts             # Root component (standalone)
│   │   ├── app.config.ts      # Client-side DI configuration
│   │   └── app.config.server.ts # SSR configuration
│   ├── server/               # Node.js API server files
│   │   ├── routes/           # API route handlers (h3 framework)
│   │   ├── lib/              # Server-side utilities
│   │   └── config/           # Server environment config
│   ├── shared/               # Shared types between client and server
│   ├── main.ts               # Client bootstrap
│   ├── main.server.ts        # SSR entry point
│   ├── app.css               # Global app styles
│   ├── styles.css            # Global styles
│   └── test-setup.ts         # Vitest configuration
├── public/                   # Static assets (images, favicon)
├── dist/                     # Build output
├── vite.config.ts           # Vite configuration with Analog.js plugin
├── angular.json             # Angular CLI configuration (minimal)
├── tsconfig.json            # TypeScript compiler options
├── package.json             # Dependencies and scripts
└── index.html              # Main HTML template
```

## 2. Angular Application Structure

### 2.1 Core Architecture

**App Root (Standalone Component)**
- `/src/app/app.ts` - Simple root component with RouterOutlet
- Standalone component pattern (no NgModules)
- Single change detection strategy: OnPush

**DI Configuration**
- `/src/app/app.config.ts` - Client-side providers:
  - `provideFileRouter()` - Analog.js file-based routing
  - `provideHttpClient()` - HTTP with fetch backend
  - `requestContextInterceptor` - SSR context interceptor
  - `provideClientHydration()` - SSR hydration support
- `/src/app/app.config.server.ts` - Merges server rendering config

### 2.2 Folder Structure

#### `/src/app/core/`
Contains application-wide services and layout components:

**Services:**
- `band-data.ts` - BandDataService with Resource API for all data fetching
- `gig-data.service.ts` - Client-side gig detail extraction from template data
- `dialog.service.ts` - Dialog management for detailed views
- `bootstrap.ts` - Application initialization

**Layout Components:**
- `layout/header.ts` - Navigation header with signals for state
- `layout/footer.ts` - Footer component
- `components/` - Dialog base components:
  - `base-dialog.component.ts` - Reusable dialog styles/logic
  - `dialog-info-section.component.ts` - Dialog content sections
  - `dialog-two-column.component.ts` - Two-column layouts

#### `/src/app/features/`
Feature modules organized by domain. Each feature is a self-contained unit:

- `gigs/` - Event listings and gig detail dialogs
  - `gigs-section.ts` - Main component
  - `gig-detail-dialog.ts` - Detail overlay
  - `gigs-section.html/css` - Templates and styles

- `music/` - Albums/CDs section
  - `music-section.ts` - Album list
  - `album-detail-dialog.ts` - Album details

- `merch/` - Merchandise/Tournee items
- `about/` - Band members
- `contact/` - Contact information
- `history/` - Past events
- `sponsors/` - Sponsor information
- `press/` - Press materials
- `location/` - Venue information
- `memorial/` - Memorial section
- `theater-info/` - Theater information
- `education/` - Educational programs
- `newsletter/` - Newsletter signup
- `promo/` - Promotional section

Each feature typically contains:
- Main section component using Resource API for data
- Optional detail dialog component
- Feature-specific CSS/HTML
- `index.ts` for barrel exports

#### `/src/app/pages/`
File-based routing with Analog.js (automatically discovered):

- `index.page.ts` - Home page (/)
- `[...404].page.ts` - 404 fallback
- `gig/[id].page.ts` - Gig detail page with SEO (/gig/:id)
- `history/[id].page.ts` - Past event detail page

Page components are minimal - they typically fetch data and open dialogs.

#### `/src/app/shared/`
Reusable utilities across the app:

- `components/` - Shared UI components
  - `back-to-top.ts` - Scroll-to-top button with signals
  - `countdown.ts` - Countdown timer
- `pipes/` - Custom pipes
  - `truncate.pipe.ts` - Text truncation with HTML preservation

### 2.3 Modern Angular Patterns Used

**Standalone Components**
- All components are standalone (no module declarations)
- Components declare imports directly
- `imports: [CommonModule, RouterModule, ...]`

**Signals (Angular 16+)**
- `signal()` for state management
- `asReadonly()` for read-only signals
- Used in: HeaderComponent (navbarOpen, scrolled), BackToTopComponent (visible)
- Reactive state without RxJS Observable boilerplate

**Resource API (Angular 17+)**
- `/src/app/core/services/band-data.ts` uses Resource API extensively
- Signals-based data loading with loader functions
- Syntax: `resource({ loader: async () => { ... } })`
- Accessed in components: `this.bandDataService.gigsResource.value()`
- No manual subscription management needed

**inject() Dependency Injection**
- Modern functional DI instead of constructor injection
- Example: `private bandDataService = inject(BandDataService);`
- Works in standalone components and services

**OnPush Change Detection**
- All components use `changeDetection: ChangeDetectionStrategy.OnPush`
- Optimized for performance, works perfectly with signals
- Reduces unnecessary change detection cycles

**HttpClient with Fetch**
- `withFetch()` provider instead of XMLHttpRequest
- Modern fetch API under the hood

**New Control Flow Syntax**
- Components use `@if`, `@for` in templates (Angular 17+)
- Not yet visible in provided examples but framework supports it

## 3. Analog.js Setup & Routing

### 3.1 File-Based Routing

Analog.js automatically creates routes from file structure:

```
src/app/pages/
  index.page.ts           → /
  [...404].page.ts        → /* (catch-all)
  gig/[id].page.ts        → /gig/:id (dynamic segment)
  history/[id].page.ts    → /history/:id
```

Features:
- Convention-based routing (no router config needed)
- `[id]` syntax for dynamic segments
- `[...404]` for fallback routes
- Supports optional and catch-all segments

### 3.2 SSR/SSG Setup

**Client Entry Point** (`main.ts`)
- Bootstraps standalone AppComponent
- Uses appConfig with client-side providers

**Server Entry Point** (`main.server.ts`)
- Imports `render` from `@analogjs/router/server`
- Merges server and client configs
- Handled by Analog.js platform

**Hydration**
- `provideClientHydration(withEventReplay())` in appConfig
- Prevents double-initialization after server renders
- Event replay captures user interactions during SSR

### 3.3 Vite Configuration

**vite.config.ts**
```typescript
plugins: [analog()] // Analog.js plugin handles SSR/SSG
build: {
  target: ['es2020'],
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['@angular/core', '@angular/common', '@angular/platform-browser'],
        dialog: ['@angular/cdk/dialog'],
      },
    },
  },
  chunkSizeWarningLimit: 600,
  minify: mode === 'production' ? 'esbuild' : false,
}
```

- Manual chunking for better caching
- esbuild minification for SSR compatibility
- Test environment: jsdom for browser-like DOM simulation

## 4. Data Fetching Architecture

### 4.1 Resource API Pattern

**BandDataService** (`/src/app/core/services/band-data.ts`)

All data fetching is centralized here using Resource API:

```typescript
gigsResource = resource({
  loader: async () => {
    const response = await firstValueFrom(this.http.get<ApiResponse<Gig[]>>('/api/v1/gigs'));
    return response?.data || [];
  }
});

albumsResource = resource({...});
bandMembersResource = resource({...});
merchResource = resource({...});
// ... more resources
```

**Usage in Components**
```typescript
export class GigsSectionComponent {
  gigs = this.bandDataService.gigsResource.value; // Signal getter

  ngOnInit() {
    this.bandDataService.gigTemplatesResource.value(); // Load on init
  }
}
```

### 4.2 Data Flow

1. **Component Template** calls `value()` signal on resource
2. **Resource API** automatically calls loader function
3. **Loader** makes HTTP request to API route
4. **API Route** queries MongoDB and transforms data
5. **Response** returned via ApiResponse<T> wrapper
6. **Component** receives signal with data

### 4.3 Special Handling: Gig Details

Gig detail extraction has a two-tier system to avoid extra API calls:

**GigDataService** (`/src/app/core/services/gig-data.service.ts`)
- Stores gig templates in BehaviorSubject
- `setGigTemplates()` - Called by BandDataService
- `extractDetailedGig()` - Client-side extraction from templates
- `extractDetailedPastEvent()` - For past events
- Handles MongoDB `$date` format and date parsing

**Why this pattern:**
- Server returns basic gigs list for quick home page load
- Server also returns full gig templates separately
- When user clicks gig, detail extracted client-side (no new API call!)
- Optimized for performance and user experience

### 4.4 Client-Side Fresh Data Pattern (SSG Stale Data Solution)

**The Problem:**
This application uses SSG (Static Site Generation) and builds are deployed infrequently (once per month). This creates a challenge:
- Pre-rendered HTML contains data from build time
- Time-sensitive data (event dates, seat availability) becomes stale
- Past events remain visible because they were upcoming during the build

**The Solution:**
A hybrid approach that combines SSR/SSG for fast initial load with client-side fresh data fetching:

1. **SSR/SSG Phase** - Pre-renders content with build-time data (good for SEO and fast initial paint)
2. **Client Hydration Phase** - Fetches fresh data and updates the UI reactively

**Implementation Pattern:**

```typescript
// 1. Create a client-only resource (skips during SSR)
clientGigsResource = resource({
  loader: async () => {
    // Skip entirely during SSR
    if (typeof window === 'undefined') {
      console.log('⏭️ Skipping client gigs fetch during SSR');
      return [];
    }

    const STORAGE_KEY = 'client_gigs_data';
    const STORAGE_TIMESTAMP_KEY = 'client_gigs_timestamp';

    // Check sessionStorage cache first
    if (typeof sessionStorage !== 'undefined') {
      const cachedData = sessionStorage.getItem(STORAGE_KEY);
      const cachedTimestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        console.log('✅ Using cached client gigs data from session');
        return JSON.parse(cachedData) as Gig[];
      }
    }

    // Fetch fresh data from API
    console.log('🔄 Fetching fresh gigs data from browser...');
    const response = await firstValueFrom(
      this.http.get<ApiResponse<Gig[]>>('/api/v1/gigs')
    );
    const data = response?.data || [];

    // Cache in sessionStorage for the rest of the session
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
      console.log('✅ Cached client gigs data to session');
    }

    return data;
  }
});

// 2. Create computed signal that prefers fresh data
gigsWithSeats = computed(() => {
  const clientGigs = this.clientGigsResource.value() || [];
  const ssrGigs = this.gigsResource.value() || [];
  const muluData = this.muluSeatsResource.value() || [];

  // Use client gigs if available (browser), otherwise fallback to SSR gigs
  const gigs = clientGigs.length > 0 ? clientGigs : ssrGigs;

  if (muluData.length === 0) {
    return gigs;
  }

  return this.mergeGigsWithMuluData(gigs, muluData);
});
```

**3. Trigger fetch after hydration in component:**

```typescript
constructor() {
  // Load fresh data ONLY in browser (not during SSR)
  // This ensures fresh data even if build is old (builds once per month)
  afterNextRender(() => {
    // Fetch fresh gigs to filter out past events
    this.bandDataService.clientGigsResource.value();
    // Fetch fresh MULU seat data
    this.bandDataService.muluSeatsResource.value();
  });
}
```

**Key Characteristics:**

1. **SSR Detection**: Uses `typeof window === 'undefined'` to detect server environment
2. **SessionStorage Caching**: Caches data per browser session to avoid re-fetching on navigation
3. **afterNextRender Hook**: Ensures fetch happens only after initial render (Angular lifecycle)
4. **Computed Signal**: Reactively switches from SSR to fresh client data
5. **No Extra XHR During Session**: Data is fetched once per session, then cached

**Current Implementations:**

- **`clientGigsResource`**: Fetches upcoming gigs, filters out past events
- **`muluSeatsResource`**: Fetches real-time seat availability from external MULU API

**Benefits:**

- ✅ Fast initial page load with pre-rendered HTML
- ✅ SEO-friendly with server-rendered content
- ✅ Always shows current data, even with monthly builds
- ✅ No performance penalty (cached after first fetch)
- ✅ Graceful degradation (uses SSR data if client fetch fails)

**When to Use This Pattern:**

Use this pattern when:
- Data is time-sensitive and can become stale between builds
- You need SEO/fast initial load but also need fresh data
- External APIs provide real-time data (like seat availability)
- Build frequency is low but data changes frequently

**When NOT to Use:**

Avoid this pattern for:
- Static content that never changes (band member bios, album info)
- Data that doesn't need to be real-time
- High-traffic pages where extra API calls could be expensive

## 5. API Routes & Server Architecture

### 5.1 Route Structure

```
src/server/routes/api/v1/
├── gigs.ts                 # GET /api/v1/gigs (upcoming events)
├── gig-templates.ts        # GET /api/v1/gig-templates (raw templates)
├── gig/[id].ts            # GET /api/v1/gig/:id (single gig detail)
├── albums.ts              # GET /api/v1/albums (CDs filtered from gigs)
├── band-members.ts        # GET /api/v1/band-members
├── merch.ts               # GET /api/v1/merch (Tournee items)
├── past-events.ts         # GET /api/v1/past-events
├── past-event/[id].ts     # GET /api/v1/past-event/:id
├── updates.ts             # GET /api/v1/updates
├── contact.ts             # GET /api/v1/contact
├── press.ts               # GET /api/v1/press
├── sponsors.ts            # GET /api/v1/sponsors
└── location/[name].ts     # GET /api/v1/location/:name
```

### 5.2 API Route Pattern

**Using h3 Framework** (Nitro HTTP framework):

```typescript
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event): Promise<ApiResponse<Gig[]>> => {
  try {
    const data = await getMongoData(query, 'eventDb', 'Gigs');
    const transformed = extractGigsFromView(data);
    return {
      success: true,
      data: transformed,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch gigs'
    });
  }
});
```

### 5.3 MongoDB Integration

**SimpleMongoClient** (`/src/server/lib/simple-mongo.ts`)
- Minimal MongoDB client
- Connects, queries, disconnects on each request
- No connection pooling (suitable for serverless)
- Uses environment variable: `MONGODB_CONNECTION_STRING`

```typescript
export async function getMongoData(filter: object, dbName: string, collectionName: string)
```

**Database Structure:**
- Database: `eventDb`
- Main collection: `Gigs` (contains events, albums, merch as different views)
- Filtering uses `googleAnalyticsTracker` field to categorize:
  - `"CD"` → Albums
  - `"Tournee"` → Merchandise
  - `"Premiere|CD|Tournee"` → Gig templates

### 5.4 Data Transformation Pattern

Each route has a helper function to extract and transform data:

```typescript
function extractGigsFromView(gigsViewData: any[]): Gig[] {
  const gigsWithDates: Array<Gig & { eventDate: Date }> = [];
  
  gigsViewData.forEach((doc) => {
    // Process each event date in doc.eventDates
    doc.eventDates.forEach((eventDate) => {
      const parsedDate = parseDate(eventDate.start); // Handle $date format
      const isUpcoming = parsedDate > new Date();
      
      if (!isUpcoming) return; // Filter past events
      
      gigsWithDates.push({
        id: generateEventId(doc._id, parsedDate),
        date: { day, month, year },
        title: doc.name,
        // ... other fields
        eventDate: parsedDate // Temporary field for sorting
      });
    });
  });
  
  // Sort and remove temporary fields
  return gigsWithDates
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
    .map(({ eventDate, ...gig }) => gig);
}
```

## 6. Shared Types System

**Location:** `/src/shared/types/index.ts`

Core types shared between client and server:

```typescript
interface Gig {
  id: number;
  date: { day: number; month: string; year: number };
  title: string;
  venue: string;
  location: string;
  time: string;
  dayOfWeek: string;
  description: string;
  ticketUrl: string;
  // Extended fields for detail view
  longDescription?: string;
  artists?: string;
  ticketTypes?: Array<{ name, price, currency, description }>;
  duration?: string;
  eventDateString?: string;
  startTimestamp?: number; // For exact event matching
}

interface Album { /* ... */ }
interface BandMember { /* ... */ }
interface MerchItem { /* ... */ }
interface PastEvent { /* ... */ }
interface Location { /* ... */ }
// ... more interfaces

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
```

## 7. Dialog & Modal Architecture

### 7.1 Dialog Service

**DialogService** (`/src/app/core/services/dialog.service.ts`)

Centralized modal management using Angular CDK Dialog:

```typescript
export class DialogService {
  private currentDialogRef: DialogRef<boolean> | null = null;

  async openGigDetail(gig: Gig): Promise<void> {
    // Close existing dialog
    if (this.currentDialogRef) this.currentDialogRef.close();
    
    // Extract detailed gig from client-side templates
    const detailedGig = this.gigDataService.extractDetailedGig(templateId);
    
    // Open dialog with component
    this.currentDialogRef = this.dialog.open(GigDetailDialogComponent, {
      data: { gig: detailedGig }
    });
  }

  async openMemberBio(member: BandMember): Promise<void> { /* ... */ }
  async openAlbumDetail(album: Album): Promise<void> { /* ... */ }
  async openLocationDetail(name: string): Promise<void> { /* ... */ }
  // ... more dialog methods
}
```

### 7.2 Dialog Components

All dialogs use similar pattern:
- Base interface `BaseDialogData`
- Inject DialogRef for close control
- CDK Dialog integration (not ng-bootstrap)
- Data passed via `DialogRef<ComponentType>`

**Example: GigDetailDialogComponent**
```typescript
@Component({
  selector: 'app-gig-detail-dialog',
  templateUrl: './gig-detail-dialog.html',
  styleUrls: ['./gig-detail-dialog.css']
})
export class GigDetailDialogComponent {
  @Inject(DIALOG_DATA) data: GigDetailData;
}
```

## 8. Feature Components Pattern

All feature section components follow consistent pattern:

```typescript
@Component({
  selector: 'app-gigs-section',
  templateUrl: './gigs-section.html',
  styleUrls: ['./gigs-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GigsSectionComponent implements OnInit {
  
  // Inject services
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);
  
  // Use Resource API signal
  gigs = this.bandDataService.gigsResource.value;
  
  // Load additional data on init
  ngOnInit(): void {
    this.bandDataService.gigTemplatesResource.value();
  }
  
  // Dialog handlers
  async openGigDetail(gig: Gig): Promise<void> {
    await this.dialogService.openGigDetail(gig);
  }
}
```

**Key Characteristics:**
- OnPush change detection
- Signal-based data (no unsubscribe needed)
- Dialog opening is async/awaited
- Minimal business logic (delegation to services)

## 9. Testing Setup

### 9.1 Test Configuration

**Vitest** - Modern test runner configured in `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'jsdom', // Browser-like environment
  setupFiles: ['src/test-setup.ts'],
  include: ['**/*.spec.ts'],
  reporters: ['default'],
}
```

**Test Setup** (`src/test-setup.ts`)
- Initializes Angular testing module
- Sets up Analog.js vitest support
- Configures BrowserTestingModule

### 9.2 Test Example

```typescript
describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideLocationMocks()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

### 9.3 Running Tests

```bash
npm run test  # Run tests once
npm run watch # Watch mode
```

## 10. Build & Deployment

### 10.1 Development

```bash
npm run dev    # Start dev server (port 5173)
npm run start  # Alias for dev
```

### 10.2 Production Build

```bash
npm run build   # Build for production
npm run preview # Preview built app
npm run watch   # Watch mode for continuous builds
```

**Build Output:**
- `dist/client/` - Client-side bundles
- `dist/analog/server/` - SSR server and node_modules
- Analog.js handles SSR/SSG automatically

### 10.3 TypeScript Configuration

**tsconfig.json** - Strict mode enabled:
- `strict: true`
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `ES2022` target and lib
- `moduleResolution: "bundler"` - For Vite

## 11. Performance & Optimization

### 11.1 Code Splitting

**Vite Configuration:**
```typescript
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['@angular/core', '@angular/common', '@angular/platform-browser'],
      dialog: ['@angular/cdk/dialog'],
    },
  },
},
chunkSizeWarningLimit: 600, // 600kB
```

### 11.2 Lighthouse Optimization

See `server-config.md` for:
- Gzip/Brotli compression
- Cache-Control headers
- Security headers
- Performance optimization for Apache/Nginx

### 11.3 HTML Preloading

`index.html` includes:
- Critical CSS preload
- Font preloads with `fetchpriority="high"`
- Logo preload
- Open Graph metadata
- Twitter card metadata

## 12. Development Workflow

### 12.1 Adding a New Feature

1. Create folder in `/src/app/features/my-feature/`
2. Create main component: `my-feature-section.ts`
3. Create feature service if needed
4. Add selector to home page component imports
5. Add Resource API method to BandDataService if fetching data
6. Create API route if new data source needed

### 12.2 Creating a Detail Dialog

1. Create dialog component: `my-detail-dialog.ts`
2. Create dialog data interface
3. Add open method to DialogService
4. Inject DialogService in feature component
5. Call openMyDetail() on user interaction

### 12.3 Adding API Route

1. Create file in `/src/server/routes/api/v1/my-endpoint.ts`
2. Use `defineEventHandler` with h3
3. Query MongoDB via `getMongoData()`
4. Transform data with helper function
5. Return ApiResponse<T>
6. Add Resource API method to BandDataService

## 13. Key Dependencies

**Angular & Framework:**
- `@angular/*` - v20.3.3
- `@analogjs/*` - v1.21.2 (router, content, platform, vite-plugin-angular)
- `rxjs` - v7.8.0
- `zone.js` - v0.15.0

**UI & Styling:**
- `bootstrap` - v5.3.8
- `@angular/cdk` - v20.2.7 (Dialog)
- `@fortawesome/fontawesome-free` - v7.1.0
- `@angular/youtube-player` - v20.2.14

**Backend:**
- `mongodb` - v6.20.0
- `h3` - (via Analog.js, used for API routes)

**Build & Dev:**
- `vite` - v7.0.0
- `vitest` - v3.0.0
- `typescript` - v5.8.0
- `@angular/build` - v20.3.4 (CLI)

## 14. Common Patterns & Best Practices

### 14.1 Service Injection

Always use `inject()` in services and components:
```typescript
private bandDataService = inject(BandDataService);
private dialog = inject(Dialog);
```

### 14.2 Change Detection

Always use OnPush for performance:
```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

### 14.3 Signals Over Subscriptions

Use Resource API and signals instead of manual RxJS:
```typescript
// Good
gigs = this.bandDataService.gigsResource.value;

// Avoid
gigs$ = this.bandDataService.gigsResource.value().asObservable();
```

### 14.4 Dialog Patterns

Always check and close existing dialogs:
```typescript
if (this.currentDialogRef) {
  this.currentDialogRef.close();
}
```

### 14.5 Error Handling

API routes should always return ApiResponse wrapper:
```typescript
try {
  // ... fetch and transform
  return { success: true, data, timestamp };
} catch (error) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to...'
  });
}
```

## 15. Debugging Tips

### 15.1 MongoDB Connection Issues

Check `/src/server/lib/simple-mongo.ts` for connection logs:
- "🔄 Connecting to MongoDB..."
- "✅ Connected to MongoDB"
- "❌ MongoDB error:"

### 15.2 Data Transformation Issues

API routes include detailed logging:
- `console.log('🔍 Raw data count:')` - Mongo result size
- `console.log('DEBUG: Found X upcoming gigs')` - Filtering results
- Check date parsing and filtering logic

### 15.3 Missing Data in Components

1. Verify Resource API is being called: `this.bandDataService.resourceName.value()`
2. Check network tab for API response
3. Verify types match ApiResponse<T> structure
4. Check dialog data passing via DialogRef

## 16. Environment Configuration

**Server-side Only** (`/src/server/config/environment.ts`):
```typescript
export function getEnv(): ServerConfig {
  return {
    app: {
      nodeEnv: process.env['NODE_ENV'],
      isDevelopment: process.env['NODE_ENV'] !== 'production',
      isProduction: process.env['NODE_ENV'] === 'production',
    }
  };
}
```

**Environment Variables:**
- `MONGODB_CONNECTION_STRING` - Database connection
- `NODE_ENV` - development/production
- Never expose server env vars to browser (automatically handled)

---

## Summary

This is a modern, signal-based Angular application with:
- **File-based routing** via Analog.js
- **Resource API** for reactive data fetching
- **Signal-based state** for performance
- **MongoDB backend** with h3 API routes
- **SSR/SSG** for SEO and performance
- **Standalone components** (no NgModules)
- **OnPush change detection** throughout
- **Feature-based folder structure** for scalability

The architecture prioritizes performance, maintainability, and modern Angular patterns. Future developers should follow the established patterns when adding features or services.
