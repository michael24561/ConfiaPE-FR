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
    -   **Bug Fix:** Addressed an infinite loading bug by correctly updating the `loading` state after user authentication and ensuring the technician fetch `useEffect` depends on the `user` state.

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
    -   The page was completely redesigned from a card-based layout to clean, distinct sections for profile information, password changes, and logging out.
    -   The UX for editing information was improved by removing the explicit "Edit Mode".

-   **Technician Profile (Client View):**
    -   The public technician profile at `/Tecnicos/[id]` was moved to `/cliente/tecnicos/[id]` to integrate it into the authenticated client experience.
    -   The layout was updated to use the `HeaderCliente` and `ClienteSidebar`.
    -   A "Chat" button was added that correctly redirects the client to the conversation with that specific technician.

### Backend & Real-time Features

-   **New Users Endpoint:** Created a new, paginated `/api/users` endpoint on the backend to support the "New Chat" modal's user list.
-   **Real-time Job Notifications:** Implemented a full, end-to-end real-time notification system. When a client submits a job request, a socket event is now fired to the backend, which in turn sends a live notification directly to the specific technician.

## Summary of Changes and Improvements (Technician Module)

The technician-facing module (`/tecnico/*`) has been redesigned to align with the new minimalist and professional aesthetic established in the client module.

### Global & Structural Changes

-   **Header & Sidebar:** The `HeaderTecnico` and `TecnicoSidebar` components have been completely redesigned to match the look and feel of their client counterparts, ensuring a consistent user experience across the platform. This includes:
    -   Updated logo and branding.
    -   Integration of `lucide-react` icons for all navigation links.
    -   Implementation of a desktop-only collapse button within the sidebar header.
    -   Correct layout and padding to prevent header overlap.

### Page-Specific Redesigns

-   **Dashboard (`/tecnico`):**
    -   Redesigned with a clean, data-driven layout.
    -   Displays real-time statistics fetched from the backend using `StatCard` components.
    -   Includes a section for recent jobs and a placeholder for a performance chart.

-   **My Jobs (`/tecnico/trabajos`):**
    -   Redesigned with a tab-based filter system for job statuses.
    -   Introduced a new `TrabajoCard` component tailored for technicians, displaying client information and relevant job actions.
    -   Improved chat integration, allowing direct access to client conversations.

-   **My Clients (`/tecnico/clientes`):**
    -   Redesigned to present client information in a clean, responsive table format.
    -   Includes filtering options for client types (e.g., "Frecuentes", "Nuevos").
    -   Provides direct chat access to clients.

-   **Ratings (`/tecnico/calificaciones`):**
    -   Redesigned to display review statistics and a list of client reviews.
    -   Allows technicians to reply to reviews directly from the page.

-   **Income (`/tecnico/ingresos`):**
    -   Redesigned to display income statistics with filter options by period (week, month, year).
    -   Presents key income metrics using `StatCard` components and includes a placeholder for an income chart.

-   **Availability (`/tecnico/disponibilidad`):**
    -   Redesigned to provide a clean interface for managing weekly work schedules.
    -   Features modern toggle switches for availability and time selectors for setting specific hours.

-   **My Profile (`/tecnico/perfil`):**
    -   Completely redesigned with a multi-section layout for managing professional details, certificates, and account settings.
    -   Features an intuitive avatar upload and a streamlined form for updating profile information.

-   **Chat (`/tecnico/chat`):**
    -   Adapted from the client's chat page to provide a consistent real-time messaging experience for technicians.
    -   Displays client conversations and allows technicians to respond to messages.

## Feature Removal: Price Range

-   **Reason:** The `precioMin` and `precioMax` fields were deemed unnecessary as pricing is determined by custom quotes between technicians and clients.
-   **Impact:**
    -   **Backend:** Removed from the `Tecnico` model in `prisma/schema.prisma`, requiring a new database migration. Removed from `tecnico.validator.ts`, `tecnico.service.ts`, and `tecnico.controller.ts`.
    -   **Frontend:** Removed from `cliente/buscar/page.tsx` (filtering and `TecnicoCard` props), `components/TecnicoCard.tsx` (display), `cliente/tecnicos/[id]/page.tsx` (RequestCard), and `tecnico/perfil/page.tsx` (profile form).

## Cleanup

-   **Removed Redundant Chat Page:** The top-level `src/app/chat/page.tsx` file was removed as it was redundant after creating client and technician-specific chat pages.
-   **Removed Old Technician Profile Pages:** The `src/app/Tecnicos/page.tsx` and `src/app/Tecnicos/[id]/page.tsx` files, along with their parent directory, were removed as they are no longer used.

## Public Pages Redesign (`/Login`, `/Registro`)

-   **Header:** Replaced the generic `<Header />` component with a new `PublicHeader` component, featuring the ConfiaPE logo and navigation links for "Iniciar Sesión" and "Registrarse".
-   **Layout:** Maintained the split-screen layout with the form on one side and an informative/decorative panel on the other.
-   **Social Login:** Removed Google and Facebook login buttons from the Login page.
-   **Metrics:** Removed metric displays from the informative panel on the Login page.
-   **Aesthetic Improvements:** Applied a cleaner, more modern design to form elements, buttons, and the informative panels, using `lucide-react` icons and a minimalist color palette.

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

### Technician Module
-   [x] **Header & Sidebar:** Redesign to match client counterparts.
-   [x] **Dashboard (`/tecnico`):** Redesign the main dashboard.
-   [x] **Mis Trabajos (`/tecnico/trabajos`):** Redesign the job management view for technicians.
-   [x] **Mis Clientes (`/tecnico/clientes`):** Redesign the client list view.
-   [x] **Calificaciones (`/tecnico/calificaciones`):** Redesign the ratings and reviews view.
-   [x] **Ingresos (`/tecnico/ingresos`):** Redesign the income/payments view.
-   [x] **Disponibilidad (`/tecnico/disponibilidad`):** Redesign the availability management interface.
-   [x] **Mi Perfil (`/tecnico/perfil`):** Redesign the technician's own profile editing page.
-   [x] **Mensajes (`/tecnico/chat`):** Redesign the chat interface.
-   [x] **Feature Removal:** Remove `precioMin` and `precioMax` from the entire application.
-   [x] **Cleanup:** Remove redundant and unused files/directories.
-   [x] **Notifications:** Implement a visual component in the UI to display real-time notifications (e.g., a dropdown panel for new job requests).