# Frontend Page Standards

Language:

- English: `docs/frontend-page-standards.md`
- 简体中文: `docs/frontend-page-standards.zh-CN.md`

This document defines the default page-development standard for ChefMate frontends.
It applies to both:

- `chef-mate`: uni-app + Vue 3 end-user client
- `admin`: Vue 3 + Vite admin panel

Use this document when creating, refactoring, or reviewing frontend pages.
Treat it as the default standard unless the task explicitly says a page is a temporary prototype or one-off experiment.

## 1. Goal

The goal of this standard is to keep page code:

- componentized instead of page-monolithic
- easy to review and test
- explicit in page responsibility boundaries
- aligned with Vue Composition API and existing repo structure

This is a development and review standard, not a CI-enforced lint rule.

## 2. File Size Limits

These limits are review thresholds, not style suggestions.

| Type | Recommended Limit | Hard Limit |
| --- | --- | --- |
| Page entry component | 300 lines | 500 lines |
| Feature/business component | 200 lines | 400 lines |
| Shared/common component | 150 lines | 300 lines |
| Composable | 100 lines | 200 lines |

Rules:

- Crossing the recommended limit means the author should evaluate a split.
- Crossing the hard limit means the code must be split before the task is considered complete.
- If a file stays under the limit but still mixes too many responsibilities, it should still be split.

## 3. Default Page Structure

Use these structures by default.

For `chef-mate`:

```text
src/pages/{feature}/
├── index.vue
├── components/
│   ├── SomeCard.vue
│   └── SomePopup.vue
├── composables/
│   └── useSomeFeature.ts
└── constants/
    └── some-feature.ts
```

For `admin`:

```text
src/views/{feature}/
├── index.vue
├── components/
│   ├── SomePanel.vue
│   └── SomeDialog.vue
├── composables/
│   └── useSomeFeature.ts
└── constants/
    └── some-feature.ts
```

Notes:

- `components/` is for page-scoped presentational or interaction blocks.
- `composables/` is for page-scoped stateful logic and side effects.
- `constants/` is for label maps, icon maps, view config, and other static metadata.
- If logic becomes reusable across multiple features, move it to package-level shared directories such as `src/components` or `src/composables`.

## 4. Page Entry Responsibilities

The page entry component such as `pages/*/index.vue` or `views/*/index.vue` should mainly do orchestration.

Allowed responsibilities:

- layout composition
- route or page parameter intake
- page-level lifecycle hooks
- composing child components
- coordinating communication between child components
- wiring page-level composables into the view

Do not keep these directly in the page entry when they are non-trivial:

- large inline modal or popup bodies
- long static metadata maps
- complex state transitions
- reusable presentation blocks
- repeated item rendering sections
- cross-cutting side effects such as scroll locking or event subscriptions

Heuristics:

- A page entry should usually have no more than 5 meaningful computed values.
- A page entry should usually have no more than 5 meaningful methods.
- If the page is accumulating both orchestration and feature logic, move the feature logic out first.

## 5. Mandatory Split Triggers

A component or logic block must be split out when any one of these is true:

1. It is a visually independent UI block such as a card, section, banner, table area, modal, or popup.
2. The same structure or interaction pattern appears two or more times.
3. The block has its own loading, error, empty, expanded, selected, or submitting state.
4. The block is likely to be reused in another page or another route in the same feature.
5. The block contains three or more event handlers or a small local interaction flow.
6. The block forces the parent page to hold unrelated concerns at the same time.

Examples that should usually be separate components:

- progress summary cards
- quick-add forms
- tabbed content sections
- confirmation dialogs
- assignment dialogs
- category pickers
- collapsible completed-history sections

## 6. Composable Extraction Rules

Move logic into a composable when any of these is true:

- state and actions naturally belong together
- the logic owns side effects
- the logic is shared by multiple sibling components
- the logic contains more than 3 related computed values
- the logic coordinates an interaction flow
- the logic manipulates timers, DOM state, subscriptions, or lifecycle cleanup

Typical examples:

- `useAssignment`
- `useScrollLock`
- `useCompletionTransition`
- `usePageInitialization`
- `useRecipeContextImport`

Keep simple one-off glue logic in the page only if it stays small and clearly orchestration-only.

## 7. Page-Scoped vs Shared Logic

Choose the location based on reuse and domain boundary.

Put logic in page-local `composables/` when:

- it exists only for one page or one feature route
- it depends on page-specific UI state
- naming it globally would be misleading

Put logic in shared `src/composables/` when:

- multiple pages use it already
- the abstraction is stable and domain-agnostic
- it solves a cross-feature problem

Do not move page-private logic into global shared directories just to reduce local file count.

## 8. Props and Emits Design

Child components should receive narrow, explicit inputs and emit narrow, explicit events.

Preferred:

```ts
defineProps<{
  item: ShoppingItem;
  canAssign: boolean;
  currentUserId: string;
}>();

defineEmits<{
  toggle: [itemId: string];
  assign: [item: ShoppingItem];
}>();
```

Avoid:

```ts
defineProps<{
  store: ReturnType<typeof useShoppingStore>;
  pageState: any;
}>();
```

Rules:

- do not pass an entire Pinia store into a child component
- do not pass broad mutable page-state bags when a narrow interface will do
- prefer typed emits over callback props when the child is a Vue interaction component
- keep child components store-agnostic unless they are intentionally shared store-bound wrappers

## 9. Popup and Dialog Standard

Popups, dialogs, drawers, and bottom sheets should be extracted into dedicated components once they exceed trivial size.

Standard pattern:

- use a standalone component
- control visibility via `v-model:show`
- pass in selected data explicitly
- emit `confirm`, `cancel`, or similarly narrow events

Preferred:

```vue
<AssignMemberPopup
  v-model:show="showAssignPopup"
  :item="selectedItem"
  :members="candidateMembers"
  @confirm="handleAssignConfirm"
/>
```

Avoid leaving 100+ lines of popup content directly inside the page entry.

## 10. Constants and View Metadata

These should not live inline in large page files:

- category label maps
- icon maps
- badge tone maps
- static filter definitions
- section copy that is treated as configuration

Move them into a `constants/` directory or a clearly named local metadata file.

Preferred names:

- `constants/shopping.ts`
- `feature.meta.ts`
- `feature.constants.ts`

Keep only truly tiny constants inline, such as a single default string or one simple boolean flag.

## 11. Store Responsibility Boundary

Pinia stores should own domain state and domain mutations.

Stores are the right place for:

- canonical fetched data
- active selection identity
- API-backed mutations
- shared domain-derived state

Stores are not the right place for:

- popup visibility
- form draft text tied to one page
- scroll locking
- animation transition flags
- temporary route import state

That UI state belongs in the page or a page-scoped composable.

## 12. Review Checklist

When reviewing a page, check at least these items:

- Is the page entry mainly orchestration, or is it acting like a giant feature dump?
- Are visually independent regions extracted?
- Are large popups extracted?
- Are stateful flows moved into composables?
- Are constants moved out of the main page file?
- Are child component interfaces explicit and narrow?
- Is page-local UI state kept out of the store?
- Does the file size stay within the thresholds?

If the answer to several of these is no, the page is not considered compliant.

## 13. Examples

### Positive Example

A compliant page usually looks like this:

- `index.vue` composes sections and wires events
- `components/` contains visual sections and dialogs
- `composables/` contains page-specific state machines and side effects
- `constants/` contains label maps and icon maps

The page entry remains readable top-to-bottom in a few minutes.

### Negative Example

`chef-mate/src/pages/shopping/index.vue` is the canonical counterexample that motivated this standard.

Why it is non-compliant:

- the page entry is far beyond the file-size threshold
- multiple independent visual sections are inline
- popup content is inline
- page-private state machines are inline
- scroll locking and transition logic are inline
- large metadata maps are inline
- the page mixes orchestration, rendering, domain flow, and UI effect management

That shape should be treated as a refactor target, not as a model for future pages.

## 14. App-Specific Notes

### `chef-mate`

- Page entry files are constrained by `src/pages.json` and uni-app lifecycle hooks.
- Prefer page-local `components/`, `composables/`, and `constants/` for feature-specific page logic.
- Keep platform-specific behavior such as H5 scroll handling inside page-scoped composables unless it is reused.
- For runtime platform checks, prefer `@uni-helper/uni-env` such as `isWeb`, `isH5`, or `isMpWeixin` instead of reading `uni.getSystemInfoSync().uniPlatform` directly.
- Keep `#ifdef H5`, `#ifdef APP-PLUS`, and similar directives for compile-time platform branching, because they remove code from unsupported targets instead of only branching at runtime.
- Keep `typeof window` / `typeof document` guards when code touches browser globals; these checks are environment-safety guards, not replacements for platform detection.

### `admin`

- Page entry files live under `src/views/*` and are routed by Vue Router.
- The same componentization and composable rules apply.
- Preserve existing Arco patterns, but do not use the design system as a reason to keep oversized pages monolithic.

## 15. Exceptions

These rules may be relaxed only when one of these is explicitly true in the task:

- temporary prototype
- one-off experiment
- short-lived migration bridge
- generated code that should not be manually restructured yet

If an exception is used, document the reason in the task or review note.
