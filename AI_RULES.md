# AI Development Rules for FinanZen

This document provides guidelines for the AI assistant to follow when developing and modifying the FinanZen application. The goal is to maintain code quality, consistency, and simplicity.

## Tech Stack Overview

The application is built with a modern, lightweight tech stack. Key technologies include:

-   **Framework:** React with TypeScript for building the user interface.
-   **Build Tool:** Vite for fast development and optimized builds.
-   **Styling:** Tailwind CSS for all styling, configured directly in `index.html`.
-   **UI Components:** A mix of custom-built components and a preference for `shadcn/ui` patterns.
-   **Icons:** `lucide-react` is the exclusive library for all icons.
-   **Data Visualization:** `recharts` is used for creating charts and graphs.
-   **State Management:** Primarily uses React Hooks (`useState`, `useContext`) and a custom `useLocalStorage` hook for persistence.
-   **AI Integration:** Google Gemini API, accessed securely through serverless function proxies in the `/api` directory.
-   **Progressive Web App (PWA):** Includes a service worker (`sw.js`) and manifest for offline capabilities and installability.

## Library and Component Usage Rules

To ensure consistency and maintainability, please adhere to the following rules:

1.  **UI Components:**
    *   **Prioritize `shadcn/ui`:** Although the components are not installed from a package, the existing UI components in `src/components/ui` follow the `shadcn/ui` philosophy. When new components are needed, create them following this pattern: simple, composable, and styled with Tailwind CSS.
    *   **File Structure:** Every new component must be in its own file inside `src/components`. Do not add multiple components to a single file.

2.  **Styling:**
    *   **Tailwind CSS Only:** All styling must be done using Tailwind CSS utility classes. Do not write custom CSS files or use inline `style` attributes unless it's for a dynamic property that cannot be handled by Tailwind classes.
    *   **Theme Colors:** Use the theme colors defined in `tailwind.config` (`primary`, `secondary`, `accent`) to maintain brand consistency.

3.  **Icons:**
    *   **`lucide-react` Exclusively:** All icons must come from the `lucide-react` library. This ensures a consistent visual style throughout the application.

4.  **State Management:**
    *   **Keep it Simple:** Use React's built-in hooks (`useState`, `useEffect`, `useMemo`, `useContext`) for state management.
    *   **Local Storage:** For state that needs to persist across browser sessions (like user data or settings), use the existing `useLocalStorage` hook.
    *   **No New Libraries:** Do not introduce complex state management libraries like Redux, Zustand, or MobX.

5.  **Data Visualization:**
    *   **Use `recharts`:** All charts and graphs must be created using the `recharts` library.
    *   **Responsiveness:** Ensure all charts are wrapped in `ResponsiveContainer` to adapt to different screen sizes.
    *   **Theming:** Charts should adapt to light and dark modes by using colors from the `useTheme` context.

6.  **Notifications:**
    *   **Use the Internal System:** Use the `addNotification` function available in the main `App.tsx` component to display feedback to the user. Do not install or use external toast libraries like `react-hot-toast`.

7.  **AI Integration:**
    *   **Proxy All Calls:** All requests to the Google Gemini API must go through the serverless functions located in the `/api` directory. This is critical to keep the API key secure.
    *   **Service Files:** Keep the client-side logic for calling these proxy functions within the `src/services` directory.