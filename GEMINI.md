# Frontend Documentation (ConfiaPE-FR)

This document provides a comprehensive overview of the ConfiaPE frontend application, its structure, development conventions, and a summary of the recent redesign and refactoring efforts.

## Project Overview

The frontend is a Next.js application built with TypeScript and React. It serves as the client-facing interface for the ConfiaPE platform, providing separate dashboards and functionalities for clients, technicians, and administrators.

### Key Technologies

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** Primarily custom-built, with `lucide-react` for icons.
-   **Authentication:** Next-Auth (managed via `localStorage` and context providers).
-   **Real-time Communication:** Socket.IO Client.
-   **API Communication:** `fetch` API wrapped in helper functions (`src/lib/api.ts`, `src/lib/chat.ts`).

## Summary of Changes and Improvements (Client Module)

The entire client-facing module (`/cliente/*`) has been significantly redesigned and refactored to create a modern, professional, and cohesive user experience. The core principle was to move away from a colorful, gradient-heavy design to a cleaner, minimalist aesthetic focused on usability.

### Global & Structural Changes

-   **Unified Design System:** A new, consistent design system has been applied across all client pages, based on a `slate` and `blue` color palette with softer shadows and cleaner layouts.
-   **Layout Correction:** Fixed persistent layout bugs where the fixed header would overlap page content. All pages within the client module now have correct top padding to account for the header's height.
-   **Footer Refactoring:** The main site-wide `<Footer />` component was removed from all pages by emptying the component, simplifying the overall page structure.
-   **Sidebar Improvements:**
    -   The company logo was added to the top and centered correctly.
    -   A small, clean footer with copyright information was added to the bottom.
    -   A collapse button was added to the sidebar header for both desktop and mobile, allowing the user to toggle its visibility from within the sidebar itself.
-   **Header Polish:** The client-specific header (`HeaderCliente`) now has a subtle bottom border and the hamburger menu icon is correctly positioned for toggling the sidebar.

### Page-Specific Redesigns & Bug Fixes

-   **Dashboard (`/cliente`):**
    -   Completely redesigned with a professional and minimalist UI.
    -   Replaced colorful "Quick Action" cards and "Stat Cards" with cleaner, more modern components.

-   **Registration (`/Registro`):**
    -   Fixed a critical bug that incorrectly redirected newly registered clients to the homepage (`/`) instead of their dashboard (`/cliente`).

-   **Search Technicians (`/cliente/buscar`):**
    -   Redesigned the layout and filter bar, adding more advanced filtering and sorting options.
    -   The `TecnicoCard` component was completely redesigned with a modern layout, a "Verified" badge, availability indicators, and a built-in favorite toggle button.

-   **My Jobs (`/cliente/trabajos`):**
    -   The layout was overhauled. Filter buttons were replaced with a cleaner, tab-based navigation.
    -   A new `TrabajoCard` component was created for a much more organized and readable list view.

-   **Favorites (`/cliente/favoritos`):**
    -   The page was simplified to leverage the new `TecnicoCard`. The old, intrusive "remove" button was deleted in favor of the card's built-in heart icon.

-   **Chat (`/cliente/chat`):**
    -   Underwent a complete architectural and visual redesign to create a modern, full-height chat application interface.
    -   **Bug Fixes:** Solved numerous critical build and runtime errors, including syntax errors from incorrect refactoring, duplicate key errors in conversation lists, and a broken mobile layout.
    -   **"New Chat" Modal:** The modal was refactored to include both a paginated list of all users (with infinite scroll) and a search bar to filter for specific technicians.

-   **My Profile (`/cliente/perfil`):**
    -   The page was completely redesigned from a card-based layout to clean, distinct sections.
    -   The UX for editing information was improved by removing the explicit "Edit Mode".

-   **Technician Profile (Client View):**
    -   The public technician profile at `/Tecnicos/[id]` was moved to `/cliente/tecnicos/[id]` to integrate it into the authenticated client experience.
    -   The layout was updated to use the `HeaderCliente` and `ClienteSidebar`.
    -   A "Chat" button was added that correctly redirects the client to the conversation with that specific technician.

### Backend & Real-time Features

-   **New Users Endpoint:** Created a new, paginated `/api/users` endpoint on the backend to support the "New Chat" modal's user list.
-   **Real-time Job Notifications:** Implemented a full, end-to-end real-time notification system. When a client submits a job request, a socket event is now fired to the backend, which in turn sends a live notification directly to the specific technician.

## Development TODO

### Client Module
-   [x] **Dashboard (`/cliente`):** Redesign for a professional and minimalist UI.
-   [x] **Sidebar:** Fix default state, update icons, and add collapse button.
-   [x] **Buscar Técnicos (`/cliente/buscar`):** Redesign search/filter interface and `TecnicoCard`.
-   [x] **Mis Trabajos (`/cliente/trabajos`):** Redesign job list and create `TrabajoCard`.
-   [x] **Favoritos (`/cliente/favoritos`):** Redesign favorites list.
-   [x] **Mensajes (`/cliente/chat`):** Overhaul chat interface and fix all related bugs.
-   [x] **Mi Perfil (`/cliente/perfil`):** Redesign user profile page.
-   [x] **Technician Profile (from Client View):** Move to client route and integrate layout.
-   [x] **Bug Fixes:** Address all build errors, runtime errors, and layout issues.

### Technician Module (Next Steps)
-   [ ] **Dashboard (`/tecnico`):** Review and redesign the main dashboard.
-   [ ] **Disponibilidad (`/tecnico/disponibilidad`):** Review and improve the availability management interface.
-   [ ] **Ingresos (`/tecnico/ingresos`):** Review and redesign the income/payments view.
-   [ ] **Trabajos (`/tecnico/trabajos`):** Redesign the job management view for technicians.
-   [ ] **Perfil (`/tecnico/perfil`):** Redesign the technician's own profile editing page.
-   [ ] **Notifications:** Implement a visual component in the UI to display real-time notifications (e.g., a dropdown panel for new job requests).
