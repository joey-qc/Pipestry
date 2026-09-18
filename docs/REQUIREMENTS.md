# Pipestry Functional and Domain Requirements

## Purpose

This document is the durable source for the agreed functional and domain requirements for Pipestry. It is intended to be comprehensive enough to guide data-model, architecture, UX, migration, and implementation planning.

It complements `docs/PROJECT-BRIEF.md`. The project brief remains the high-level source for product intent, boundaries, and direction; this document records the detailed behavior and domain model agreed so far.

The legacy Embers database and application are evidence about the prior system, not automatic requirements for Pipestry. Where useful legacy behavior has been explicitly retained, it is recorded here as a Pipestry requirement. Known legacy behaviors not yet verified in source code are identified as such rather than silently assumed.

## Core domain terminology

Pipestry distinguishes between:

- **Blend**: the master definition of a tobacco blend, independent of whether any is currently owned.
- **Cellar item**: one physically distinct owned container or holding of a blend.
- **Pipe**: one physical tobacco pipe in the collection.
- **Session**: one smoking/tasting event using one pipe and one specific cellar item.
- **Maintenance entry**: one dated maintenance action performed on a pipe.
- **Supply**: a consumable support item tracked for on-hand quantity and projection purposes; the confirmed legacy supply is pipe-cleaner packs.

A blend can exist without being owned, and multiple cellar items can reference the same blend while retaining their own dates, packaging, status, and age information.

## Pipe collection

The Pipestry pipe domain should carry forward the useful Embers pipe model.

Each pipe records the following domain information:

- Manufacturer
- Description/name
- Date acquired
- Shape
- Bent/straight indicator
- Pipe material
- Stem material
- Finish
- Length
- Weight
- Bowl diameter
- Bowl depth
- Filter type
- Status
- Price
- Reference/link
- Notes

Pipe manufacturers remain reference entities and may include manufacturer name, country, and URL.

Existing pipe-related lookup/reference sets from Embers carry forward as seed/reference data, including shapes, pipe materials, stem materials, finishes, filters, statuses, manufacturers, countries, and maintenance actions.

### Pipe statuses

The existing status meanings carry forward:

| ID | Status |
| ---: | --- |
| 10 | Primary |
| 20 | Secondary |
| 101 | Standby |
| 111 | Removed |

Primary, Secondary, and Standby pipes are usable for new smoking sessions. Removed pipes are not selectable for a new session.

Changing a pipe to Removed must not invalidate or erase historical sessions that reference it.

### Pipe maintenance

Pipe maintenance history carries forward as part of the pipe domain.

A maintenance entry associates a pipe with:

- Maintenance action
- Date/time
- Optional note

The application must expose maintenance history for a pipe and support creating and editing maintenance entries.

The application must also provide maintenance-derived context that distinguishes cleaning-specific history from general maintenance history.

For cleaning context, the application must provide the number of smoking sessions since the pipe's most recent cleaning. If no cleaning has been recorded, the pipe's acquisition date is the legacy baseline for this calculation.

For general maintenance context, the application should provide the most recent maintenance date together with sessions and elapsed days since that maintenance event.

These calculations are derived from canonical maintenance and session records rather than stored as independent report data.

## Blend catalog

The blend catalog is the master reference collection of tobacco blends. It is separate from owned cellar inventory.

A blend carries forward the useful Embers attributes:

- Manufacturer
- Blend name
- Blend type
- Blend cut
- Personal blend rating
- Tobacco Reviews identifier
- Tobacco Reviews rating
- Tobacco Reviews URL
- Notes

Blend manufacturers, cuts, types, type categories, ingredients, flavorings, and packaging types remain reference data.

### Blend type hierarchy

The existing hierarchy carries forward:

**Blend Type Category -> Blend Type -> Blend**

The existing Embers seed data for blend types and blend type categories can be used to initialize Pipestry.

### Blend ingredients

A blend can contain multiple tobacco ingredients, and an ingredient can occur in multiple blends.

This is a many-to-many membership relationship. The relationship does not require proportions, ordering, or notes.

### Blend flavorings

A blend can have multiple flavorings or toppings, and a flavoring can occur in multiple blends.

This is a many-to-many membership relationship. The relationship does not require proportions, ordering, or notes.

### Available packaging

A blend can be commercially available in multiple packaging formats, and a packaging format can apply to multiple blends.

This is a many-to-many membership relationship. It describes packaging formats in which the blend is available generally; it is separate from the packaging of a specific owned cellar item.

The legacy Embers JSON fields used for blend ingredients, flavorings, and packaging availability are replaced by these explicit relationships.

### Tobacco Reviews reference data

Tobacco Reviews information is retained as stored reference information associated with a blend.

The current requirement is to store and display the known Tobacco Reviews identifier, rating, and URL where available. No live import, synchronization, scraping, or other third-party integration is required by the current product definition.

If a live Tobacco Reviews integration is desired later, it should be treated as a separate requirement and evaluated independently.

## Cellar inventory

Cellar inventory represents physically distinct owned holdings of blends.

Each physical container or holding must be tracked as its own cellar item, even when several items reference the same blend. This is necessary because containers of the same blend can have different tin/cellar dates and therefore different ages.

A cellar item carries forward the following domain information:

- Blend
- Packaging type
- Inventory status
- Nominal quantity
- Tin/cellar date
- Opened date
- Age at open

### Cellar statuses

The existing lifecycle meanings carry forward:

| ID | Status | Meaning |
| ---: | --- | --- |
| 10 | Shipped | Ordered and in transit; not yet in the cellar |
| 20 | Cellared | On hand and unopened |
| 30 | Open | Opened and available for smoking |
| 40 | Archived | Contents have been exhausted; retained for history |

A received date is not required. Moving an item from Shipped to Cellared is sufficient to represent receipt.

### Quantity semantics

Quantity represents the nominal contents of the cellar item rather than a running consumption counter.

Recording smoking sessions does not reduce the quantity. Quantity is not automatically decremented as tobacco is smoked.

### Aging semantics

For an unopened cellar item with a tin/cellar date, its current age is derived from the current date and the tin/cellar date when displayed or reported.

When a cellar item is opened:

- The opened date defaults to the current date.
- The user can override the opened date.
- Age at open is determined from the opened date and tin/cellar date.
- Once opened, the age-at-open value is treated as fixed historical information rather than continuing to age.

Whether age at open is physically persisted or deterministically derived from immutable dates is an implementation decision; its functional meaning must remain fixed after opening.

## Smoking sessions

A session represents one smoking/tasting event.

Each session carries forward the useful Embers session information:

- Date/time
- Pipe
- Specific cellar item
- Session helper
- Notes
- Pipe/function score
- Flavor score

A session references the specific cellar item used, not only the master blend. This preserves the association with that holding's packaging, tin/cellar date, opened date, and age context.

### Session lifecycle

The application must support creating, viewing, and editing sessions.

Sessions may also be deleted when entered in error or otherwise no longer wanted. Session deletion should be implemented as a logical/soft deletion rather than physical removal so the record can be retained without risking broken historical relationships.

The exact recovery, audit, and default-visibility behavior for soft-deleted sessions can be defined during implementation design.

### New-session selection rules

When creating a new session:

- Only cellar items with status **Open (30)** are selectable.
- Pipes with status **Primary (10)**, **Secondary (20)**, or **Standby (101)** are selectable.
- Pipes with status **Removed (111)** are not selectable.

These restrictions apply to creation of new sessions. Historical sessions remain valid and intelligible if a referenced cellar item is later Archived or a referenced pipe is later Removed.

### Session history views

Sessions must be viewable:

- Globally
- For a specific pipe
- For a specific blend
- For a specific pipe/blend pairing where useful

Session history is a primary source for maintenance context, usage history, ratings, pairing analysis, and other reports.

### Break-in sessions

Pipestry must retain the useful distinction between ordinary scored sessions and pipe break-in sessions.

In Embers, a session with both function score and flavor score equal to zero represented a break-in bowl. Break-in sessions were displayed as part of pipe history but omitted from score-based averages, pairing rankings, dedication analysis, and flavor rankings.

Pipestry should preserve that functional distinction. The replacement implementation does not need to encode the distinction by using numeric zero values if a clearer explicit representation is chosen.

## Supplies

Pipestry should retain the useful Embers supplies capability.

The confirmed legacy supply is 100-count pipe-cleaner packs. The application should allow the owner to track the number of pipe-cleaner packs on hand and provide projections related to expected need, cost, and depletion/end date.

The legacy database stores the packs-on-hand value directly. The projection formulas are not present in the database script and should be recovered from the legacy application source before implementation logic is finalized.

## Reporting and derived analysis

Reporting and derived analysis are part of the intended Pipestry product, even if individual reports are implemented after the core CRUD workflows.

Reports must be calculated from canonical persisted domain records rather than stored as independent report-result data.

The retained legacy reporting capabilities include the following.

### Pipe and blend pairing analysis

The application should identify frequently or successfully used pipe/blend pairings and support a configurable or specified minimum-session threshold where appropriate.

Pairing analysis uses session count together with average function and flavor scores. Break-in sessions are excluded from score-based pairing analysis.

### Pipe and blend session summaries

For a pipe, the application should support a session summary that includes session count, most recent session date, average function score, and average flavor score over an appropriate history window.

For a blend, the application should support a session summary that includes session count, most recent session date, average function score, and average flavor score.

History time windows should be explicit to the user where a report is time-bounded rather than being hidden implementation constants.

### Pipe history and dedication analysis

For a pipe, the application should support history and analysis by:

- Individual blend
- Blend type
- Blend type category

The application should support averages of relevant session scores where meaningful.

Pipe dedication is a derived analysis based on smoking history by tobacco category/type/blend; it is not a manually maintained attribute of the pipe.

### Blend usage and rating analysis

The application should support:

- Blend usage history
- Flavor-score/rating analysis
- Pipe-pairing history for a blend
- Top blends by usage
- Top blends by average flavor score, using a minimum-session sample threshold so very small samples do not dominate rankings
- Acquisition/usage reporting where supported by the canonical data

Break-in sessions are excluded from score-based flavor rankings.

### Collection composition reporting

The retained legacy reporting includes summary/distribution views for the collection and cellar.

Pipe collection summaries should support grouping or counting by useful characteristics including:

- Bent versus straight
- Manufacturer country
- Pipe manufacturer
- Pipe shape
- Usage/session count

Cellar summaries should support grouping or counting by:

- Blend type category
- Blend cut
- Blend manufacturer
- Blend type

The specific visualization (chart, table, or other presentation) is a UX decision.

### Cellar and inventory reporting

The application should support:

- Cellar stock totals
- Inventory snapshots
- Counts of pipes by lifecycle/status where useful
- Counts of cellar items by relevant lifecycle/status
- Tobacco stock quantities in practical units such as grams, ounces, and pounds
- Pipe-cleaner packs on hand as part of the inventory snapshot
- Cellar projections using user assumptions such as bowls per day and grams per bowl where applicable
- Recently acquired pipes as a useful collection-history view

Because Pipestry does not automatically decrement cellar quantity per smoking session, any projection logic must be designed consistently with the agreed nominal-quantity semantics rather than silently reintroducing automatic per-session consumption.

### Maintenance reporting

The application should support maintenance snapshots and sessions-since-cleaning context for pipes.

### Supply projections

The application should support the pipe-cleaner supply projections described in the Supplies section.

### Calculation verification

The legacy database script has now been reviewed directly. It verifies the database-side existence and general calculations for the retained reports above, including pairing thresholds, pipe/blend histories, dedication aggregates, inventory snapshots, cleaning/maintenance calculations, collection composition summaries, top-blend reports, and session summaries.

Exact legacy constants are evidence rather than requirements unless separately agreed. For example, some procedures use fixed default time windows or sample thresholds that should be made explicit and evaluated during implementation design.

The remaining source-verification need is primarily application-side behavior and any calculations performed outside the database. Pipestry may intentionally modernize legacy calculations when the old behavior is undesirable, but such changes should be explicit.

## List, detail, filtering, and mobile interaction requirements

Pipestry will be used primarily from a phone and secondarily from a laptop. Core operational screens must therefore be responsive and practical on small screens.

The retained useful legacy interaction behavior includes:

- Filterable and sortable pipe lists
- Filterable and sortable blend/cellar lists
- Compact/mobile-aware list presentation
- Pipe detail views that expose relevant session, blend-history, maintenance, and break-in context
- Blend detail views that expose usage history and pipe-pairing history
- Useful list-filter state persistence where it reduces repetitive re-entry during normal use

The exact visual layout, component library, navigation model, and persistence mechanism are implementation decisions, but the capabilities above are functional expectations.

## Historical integrity and record lifecycle

Pipestry must preserve historical relationships among sessions, pipes, cellar items, blends, maintenance records, and reference data.

Operational status changes such as Removed for a pipe or Archived for a cellar item must not destroy historical records.

Domain records should use soft deletion or lifecycle status where needed rather than physical deletion by default. Hard deletion must not create broken historical references or orphaned dependent records.

## Reference and seed data

Existing Embers domain lookup/reference data relevant to the retained Pipestry model should be used as source seed data where practical.

This includes the established lookup domains for pipes, blends, cellar inventory, sessions, manufacturers, countries, ingredients, flavorings, packaging, maintenance, and related classifications.

Legacy identifiers may be preserved where they are useful for migration continuity, including the explicitly agreed pipe and cellar status identifiers above.

The existence of legacy data does not by itself require Pipestry to reproduce legacy implementation details.

## Logical domain relationships

The agreed logical model includes these relationships:

| Relationship | Cardinality / meaning |
| --- | --- |
| Pipe Manufacturer -> Pipe | One manufacturer can have many pipes |
| Pipe -> Pipe Maintenance Entry | One pipe can have many maintenance entries |
| Blend Manufacturer -> Blend | One manufacturer can have many blends |
| Blend Type Category -> Blend Type | One category can contain many blend types |
| Blend Type -> Blend | One blend type can classify many blends |
| Blend <-> Ingredient | Many-to-many membership |
| Blend <-> Flavoring | Many-to-many membership |
| Blend <-> Packaging | Many-to-many commercial availability |
| Blend -> Cellar Item | One blend can have many physically distinct cellar items |
| Packaging -> Cellar Item | Each cellar item has one packaging type |
| Pipe -> Session | One pipe can appear in many sessions |
| Cellar Item -> Session | One cellar item can appear in many sessions |
| Session Helper -> Session | One helper value can appear in many sessions |

Supplies are part of the functional domain, but their final physical ownership/cardinality model should wait until the legacy source verification and implementation design.

This is a logical domain model, not yet a physical database schema or API contract.

## Access and authentication

The initial version uses Google sign-in only.

The application is personal-first for Joey. Multi-user support is not part of the initial scope, but implementation choices should avoid unnecessarily preventing independent users from being supported later.

Before multi-user access is offered, domain ownership rules must be explicit and enforced for user-owned records.

## Functional scope and implementation phasing

The intended Pipestry product includes:

- Pipes and pipe maintenance history
- Master tobacco blends and their classifications/relationships
- Cellar inventory items and their lifecycle
- Smoking sessions
- Supplies tracking
- History/detail views
- Filtering and sorting
- Mobile-aware operational UX
- Maintenance-derived context
- Pairing, usage, dedication, cellar, inventory, and supply reporting

Implementation may be phased. Phasing a capability into a later milestone does not remove it from the product requirements.

The first usable version must at minimum establish the canonical records and relationships needed by later reports so that subsequent features do not require reworking the foundational model.

## Legacy migration

Legacy Embers data must be migrated through a deliberate ETL and reconciliation process as described in `docs/PROJECT-BRIEF.md`.

The legacy schema, seed/reference data, application behavior, stored procedures, and views are useful inputs to the new logical model, but migration mapping, reconciliation rules, and physical import mechanics remain a separate workstream.

Migration should:

- Preserve or map legacy primary keys sufficiently to reconcile source and destination records.
- Reconcile counts and relevant sums for major canonical entities.
- Validate migrated sessions and maintenance entries against valid referenced records.
- Compare a small agreed sample of legacy and replacement reports after import where those reports are retained.
- Treat differences as items to investigate rather than silently accept.

## Remaining legacy-source verification

The current requirements incorporate the known behavior recovered from:

- Direct review of the legacy Embers database schema, stored procedures, views, and functions
- Codegen analysis of the legacy application structure and behavior
- Joey's direct decisions about which legacy capabilities to retain or change

The database-side verification pass is complete for the supplied schema script.

A one-time review of the legacy application source remains recommended before final architecture and implementation planning. Its purpose is to identify material UI, validation, workflow, defaulting, navigation, or client/API behavior not represented in the database and to recover calculations performed outside SQL.

That verification pass should update this document only when it identifies a durable product requirement or clarifies an existing one. The legacy implementation should not become the specification by default.

## Implementation details intentionally deferred

The following are not yet fixed by this requirements document:

- Application technology stack and hosting architecture
- Physical database schema, keys, indexes, and constraints
- API shape and DTO definitions
- Detailed screen layouts and visual design
- Exact formulas and thresholds for reports that still require legacy-source verification
- Detailed ETL mappings and reconciliation procedures
- Exact soft-delete recovery/audit UX

Those decisions should be made from the requirements and logical model above rather than by automatically reproducing the legacy Embers implementation.
