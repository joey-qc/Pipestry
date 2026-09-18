# Pipestry Database Design

## Purpose

This document defines the relational database design for Pipestry. It describes the Pipestry schema as designed; legacy migration mapping and provenance are separate concerns.

Exact database-engine-specific types and DDL syntax will be chosen with the implementation stack. The types below describe the required data shape and constraints.

## Tables

### Pipes

#### `pipes`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key, generated |
| `manufacturer_id` | integer | Required FK -> `pipe_manufacturers.id` |
| `name` | text | Required |
| `acquired_at` | datetime | Required; defaults to current date/time |
| `shape_id` | integer | Required FK -> `pipe_shapes.id` |
| `is_bent` | boolean | Required |
| `pipe_material_id` | integer | Required FK -> `pipe_materials.id` |
| `stem_material_id` | integer | Required FK -> `stem_materials.id` |
| `finish_id` | integer | Required FK -> `pipe_finishes.id` |
| `length_mm` | decimal | Optional; positive when present |
| `weight_g` | decimal | Optional; positive when present |
| `bowl_diameter_mm` | decimal | Optional; positive when present |
| `bowl_depth_mm` | decimal | Optional; positive when present |
| `filter_id` | integer | Required FK -> `pipe_filters.id` |
| `status_id` | integer | Required FK -> `pipe_statuses.id`; defaults to 10 (Primary) |
| `price` | decimal | Optional; nonnegative when present |
| `reference_url` | text | Optional |
| `notes` | text | Optional Markdown |

Required pipe reference values use explicit lookup rows such as Unknown or None rather than null foreign keys.

#### Pipe reference tables

- `pipe_manufacturers(id, name, country_code, url)`
- `pipe_shapes(id, description)`
- `pipe_materials(id, description)`
- `stem_materials(id, description)`
- `pipe_finishes(id, description)`
- `pipe_filters(id, description)`
- `pipe_statuses(id, description)`

`pipe_manufacturers.country_code` is an optional FK to `countries.alpha2`.

Pipe status seed values:

| ID | Description |
| ---: | --- |
| 10 | Primary |
| 20 | Secondary |
| 101 | Standby |
| 111 | Removed |

### Pipe maintenance

#### `maintenance_actions`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key |
| `description` | text | Required |

Seed values:

| ID | Description |
| ---: | --- |
| 100 | Cleaning |
| 200 | Restore - Pipe |
| 210 | Restore - Stummel |
| 220 | Restore - Stem |
| 300 | Mod - Pipe |
| 310 | Mod - Stummel |
| 320 | Mod - Stem |
| 400 | Repair - Pipe |
| 410 | Repair - Stummel |
| 420 | Repair - Stem |

Cleaning-specific calculations use maintenance action 100.

#### `pipe_maintenance_entries`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key, generated |
| `pipe_id` | integer | Required FK -> `pipes.id` |
| `maintenance_action_id` | integer | Required FK -> `maintenance_actions.id` |
| `performed_at` | datetime | Required; defaults to current date/time |
| `notes` | text | Optional Markdown |

Maintenance entries may be hard deleted.

### Blend catalog

#### `blends`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key, generated |
| `manufacturer_id` | integer | Required FK -> `blend_manufacturers.id` |
| `name` | text | Required |
| `blend_type_id` | integer | Required FK -> `blend_types.id` |
| `blend_cut_id` | integer | Required FK -> `blend_cuts.id` |
| `rating` | decimal | Optional persisted derived rating |
| `tobacco_reviews_id` | integer | Optional |
| `tobacco_reviews_rating` | decimal | Optional |
| `tobacco_reviews_url` | text | Optional |
| `notes` | text | Optional Markdown |
| `is_active` | boolean | Required; defaults true |

A blend name is unique within a manufacturer.

`rating` is recalculated from all qualifying session Flavor scores when a relevant session is created, edited, soft deleted, or restored. Break-in sessions and N/A Flavor scores do not contribute.

#### Blend reference tables

- `blend_manufacturers(id, name, url)`
- `blend_type_categories(id, description)`
- `blend_types(id, description, blend_type_category_id)`
- `blend_cuts(id, description)`
- `ingredients(id, description)`
- `flavorings(id, description)`
- `packaging_types(id, description)`

`blend_types.blend_type_category_id` is required.

#### Blend composition and availability

- `blend_ingredients(blend_id, ingredient_id)`
- `blend_flavorings(blend_id, flavoring_id)`
- `blend_packagings(blend_id, packaging_type_id)`

Each table uses its two foreign keys as a composite primary key. These rows represent many-to-many membership only and carry no additional attributes.

### Cellar inventory

#### `cellar_items`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key, generated |
| `blend_id` | integer | Required FK -> `blends.id` |
| `packaging_type_id` | integer | Required FK -> `packaging_types.id` |
| `status_id` | integer | Required FK -> `cellar_statuses.id`; defaults to 20 (Cellared) |
| `quantity_grams` | decimal | Required; defaults to 50; cannot be negative |
| `tin_date` | datetime | Required; defaults to current date/time |
| `opened_date` | datetime | Optional |
| `age_at_open_days` | integer | Required; defaults to 0; recalculated when the item is opened or its dates change |

#### `cellar_statuses`

| ID | Description |
| ---: | --- |
| 10 | Shipped |
| 20 | Cellared |
| 30 | Open |
| 40 | Archived |

Archiving a cellar item sets its status to Archived and its quantity to zero as one operation. Archived items remain in the database to preserve session history.

### Smoking sessions

#### `sessions`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key, generated |
| `occurred_at` | datetime | Required; defaults to current date/time |
| `pipe_id` | integer | Required FK -> `pipes.id` |
| `cellar_item_id` | integer | Required FK -> `cellar_items.id` |
| `notes` | text | Optional Markdown |
| `function_score` | integer | Optional; 1-4; null means N/A |
| `flavor_score` | integer | Optional; 1-4; null means N/A |
| `is_break_in` | boolean | Required; defaults false |
| `deleted_at` | datetime | Optional; populated for soft deletion |

New sessions may use only Open cellar items and pipes whose current status is Primary, Secondary, or Standby. Historical references remain valid after a pipe is Removed or a cellar item is Archived.

Break-in sessions remain part of history and usage counts but do not contribute to score-based calculations.

### Supplies

#### `supplies`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | integer | Primary key, generated |
| `description` | text | Required |
| `units_per_package` | integer | Required; positive |
| `packages_on_hand` | integer | Required; defaults to 0; nonnegative |

Initial seed record: Pipe Cleaners, 100 units per package.

Projection assumptions such as bowls per day, grams per bowl, cleaners per bowl, and pack cost are calculation inputs and are not persisted by this table.

### Shared reference data

#### `countries`

| Column | Type | Rules |
| --- | --- | --- |
| `alpha2` | char(2) | Primary key |
| `name` | text | Required |
| `alpha3` | char(3) | Optional |

## Referential integrity

All domain relationships use database foreign keys.

Referenced canonical and reference records are protected from deletion when deletion would break history. Unused records entered in error may be deleted where no dependent data exists.

Blend composition junction rows may cascade when their parent blend is deleted because they have no independent meaning. Other historical relationships do not cascade-delete canonical records.

Sessions are soft deleted. Pipe maintenance entries are hard deletable. Cellar-item lifecycle removal is represented by Archived status.

## Constraints and uniqueness

The schema enforces straightforward invariants:

- Lookup descriptions are unique within their lookup table where duplicate values would have no distinct meaning.
- Pipe manufacturer names are unique.
- Blend manufacturer names are unique.
- Blend names are unique within a manufacturer.
- Tobacco Reviews ID is unique when present.
- Blend composition junction composite primary keys prevent duplicate memberships.
- Pipe measurements and weight are positive when present.
- Pipe price is nonnegative when present.
- Session scores are null or integers from 1 through 4.
- Blend rating is null or between 1 and 4.
- Cellar quantity is nonnegative.
- Archived cellar items have zero quantity.

Eligibility rules for creating or changing session references are enforced by application/service logic because historical sessions must remain valid after later lifecycle changes.

## Initial indexes

Primary-key and uniqueness indexes are implicit. Additional initial indexes should remain limited to known access patterns:

- `sessions(pipe_id, occurred_at)`
- `sessions(cellar_item_id, occurred_at)`
- `pipe_maintenance_entries(pipe_id, performed_at)`
- `cellar_items(blend_id)`
- `cellar_items(status_id)`
- `pipes(status_id)`

Additional indexes should be added only when actual query behavior demonstrates a need.

## Derived data

Persisted derived values:

- `blends.rating`
- `cellar_items.age_at_open_days`

Other report and analysis values are calculated from canonical records rather than stored as independent report data. This includes session summaries, current cellar age, maintenance context, sessions since cleaning, pairing analysis, dedication, cellar totals, collection composition, and supply projections.

No report-result tables are part of the schema.

## Reference-data loading

Lookup/reference seed data will be loaded from the available Embers database when the Pipestry database implementation is ready to receive it. The fixed status IDs, maintenance action IDs, and other IDs explicitly relied on by the design should be preserved during that load where applicable.

## Authentication

Authentication persistence is intentionally not specified here. It will be defined with the application authentication implementation. The domain schema above is independent of the authentication storage mechanism.
