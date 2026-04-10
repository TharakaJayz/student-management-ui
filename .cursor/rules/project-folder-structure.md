# Route Folder Structure Rule

Use this structure for every new route, following the same pattern as `app/(dashboard)/students`.

## Required Pattern

- Route entry file lives in App Router:
  - `app/<group?>/<route>/page.tsx`
- Feature UI files live in:
  - `app/common/pages/<route>/`
- Inside each feature folder, create:
  - `<RouteName>Container.tsx`
  - `<RouteName>View.tsx`

## Responsibilities

- `page.tsx`
  - Keep thin.
  - Import and render only the feature container from `app/common/pages/<route>/`.
  - Do not place route business logic directly here.

- `<RouteName>Container.tsx`
  - Orchestrates page-level composition and data flow.
  - Imports `<RouteName>View.tsx` and passes props.

- `<RouteName>View.tsx`
  - Pure presentational UI for the route.
  - Keep it focused on rendering.

## Naming Conventions

- Route folder in `app/common/pages/` must match URL segment name (example: `students`).
- Component names must match route intent:
  - `StudentsContainer`
  - `StudentView` (or `StudentsView` if you standardize plural view names)

## Layout Usage

- Shared section wrappers stay in route-group layouts, for example:
  - `app/(dashboard)/layout.tsx`
- Route-specific UI should stay in the route feature folder under `app/common/pages/<route>/`.

## Example

- URL route: `/students`
- Files:
  - `app/(dashboard)/students/page.tsx`
  - `app/common/pages/students/StudentsContainer.tsx`
  - `app/common/pages/students/StudentView.tsx`
