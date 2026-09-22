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

The application must expose maintenance history for a pipe and support creating, editing, and deleting maintenance entries.

Maintenance entries entered in error may be hard deleted. They do not use the session soft-deletion model.

The application must also provide maintenance-derived context that distinguishes cleaning-specific history from general maintenance history.

For cleaning context, the application must provide the number of smoking sessions since the pipe's most recent cleaning. If no cleaning has been recorded, the pipe's acquisition date is the legacy baseline for this calculation.

For general maintenance context, the application should provide the most recent maintenance date together with sessions and elapsed days since that maintenance event.

These calculations are derived from canonical maintenance and session records rather than stored as independent report data.

## Blend catalog

The blend catalog is the application's master reference collection of tobacco blends. It is separate from owned cellar inventory and is not partitioned by user.

A blend carries forward the useful Embers attributes:

- Manufacturer
- Blend name
- Blend type
- Blend cut
- Derived average flavor rating
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

### Derived blend rating

A blend's Pipestry rating is derived from the average qualifying Flavor score of its smoking sessions rather than maintained as a separate manual rating.

The derived rating is persisted in `blends.rating` and must be recalculated whenever qualifying sessions are created, edited, restored, or soft deleted so it remains consistent with the canonical session data.

Break-in sessions and N/A Flavor scores do not contribute to the derived blend rating.

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
| 40 | Archived | No usable tobacco remains in the item; retained for history |

A received date is not required. Moving an item from Shipped to Cellared is sufficient to represent receipt.

Moving an item to Archived must atomically set its inventory status to Archived and its on-hand quantity to zero.

### Quantity semantics

While a cellar item is Shipped, Cellared, or Open, quantity represents the item's nominal contents rather than a running consumption counter.

Canonical cellar quantity is stored in grams. The user interface may accept quantities in grams or ounces and may display equivalent grams, ounces, or pounds as appropriate, using a single consistent conversion policy.

Recording smoking sessions does not reduce the quantity. Quantity is not automatically decremented as tobacco is smoked.

When a cellar item is archived, its on-hand quantity is set to zero. Archiving represents that no usable tobacco from that physical holding remains, whether because it was fully consumed, discarded, or otherwise removed from the cellar.

Archiving does not remove the cellar item record and does not alter historical sessions that reference it. Those sessions continue to identify the same cellar item and blend even though the item's current quantity is zero and its status is Archived.

### Aging semantics

For an unopened cellar item with a tin/cellar date, its current age is derived from the current date and the tin/cellar date when displayed or reported.

When a cellar item is opened:

- The opened date defaults to the current date.
- The user can override the opened date.
- Age at open is determined from the opened date and tin/cellar date.
- Once opened, the age-at-open value is treated as fixed historical information rather than continuing to age.

Age at open is persisted in `cellar_items.age_at_open_days`. It is recalculated when the item is opened or when its tin/opened dates change, and otherwise remains fixed historical information.

For user-facing age and elapsed-duration text, Pipestry should preserve the legacy approximate display convention of 365-day years and 30-day months. This is presentation shorthand rather than exact calendar arithmetic.

### Blending tobaccos

Blend Type 50 ("Blending") is retained.

Blending tobaccos are hidden from the standard cellar view by default, with an option to include/show them.

A Blending tobacco otherwise participates in the normal blend and cellar model. If a specific Blending cellar item is Open, it is eligible for a smoking session just like any other Open cellar item.

## Smoking sessions

A session represents one smoking/tasting event.

Each session carries forward the useful Embers session information:

- Date/time
- Pipe
- Specific cellar item
- Notes
- Pipe/function score
- Flavor score
- Explicit break-in indicator

A session references the specific cellar item used, not only the master blend. This preserves the association with that holding's packaging, tin/cellar date, opened date, and age context.

The legacy Session Helper concept is not retained in Pipestry.

Session notes are stored as plain-text Markdown. Display rendering should support a safe, limited Markdown feature set such as bold, italic, lists, links, and line breaks, with raw HTML disabled or otherwise safely sanitized.

Session entry should retain the useful legacy quick-note phrases that can be inserted into the Markdown note field.

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

An existing historical session remains editable even when its referenced pipe is now Removed or its referenced cellar item is now Archived. The existing historical references must remain visible and selectable for that record. If the user changes the pipe or cellar item, the replacement selection must satisfy the current new-session eligibility rules.

### Session history views

Sessions must be viewable:

- Globally
- For a specific pipe
- For a specific blend
- For a specific pipe/blend pairing where useful

Session history is a primary source for maintenance context, usage history, ratings, pairing analysis, and other reports.

### Break-in sessions and score semantics

Break-in is an explicit session attribute rather than being inferred from numeric score values.

Function and Flavor use the familiar N/A, 1, 2, 3, and 4 scoring choices. N/A means genuinely unscored.

When Break-in is selected, Function and Flavor may both be N/A and should default to N/A. Break-in sessions remain part of session history and usage counts where appropriate, including maintenance context such as sessions since cleaning, but they do not contribute to function/flavor averages, derived blend rating, pairing rankings, dedication scores, or other score-based rankings.

This allows break-in sessions to be recorded without penalizing the long-term function or flavor values of the pipe or blend.

### New-record defaults

Pipestry should preserve the useful Embers defaults unless a later workflow decision explicitly changes them:

- New cellar inventory: Cellared status, 50 grams, tin/cellar date set to the current date/time, grams as the input unit, and the legacy default packaging value.
- New sessions: date/time set to now; the retained Function and Flavor choices are N/A and 1 through 4. When Break-in is selected, both scores default to N/A.
- New maintenance entries: date/time set to now, pre-associated with the pipe from which the workflow was opened, and the legacy default maintenance action.

Legacy numeric IDs may generally be mapped to corresponding replacement records rather than treated as implementation requirements, except where `docs/DATABASE-DESIGN.md` explicitly fixes an ID relied on by the Pipestry design.

## Supplies

Pipestry should retain the useful Embers supplies capability.

The confirmed legacy supply is 100-count pipe-cleaner packs. The application should allow the owner to track the number of pipe-cleaner packs on hand and provide projections related to expected need, cost, and depletion/end date.

The legacy database stores the packs-on-hand value directly. The application source confirms the retained projection behavior: defaults of 2 grams per bowl, 4 bowls per day, 2 cleaners per bowl, and $2.25 per 100-cleaner pack. These values are adjustable on the projection screen; only pipe-cleaner packs on hand are persisted from that workflow.

Projection logic must guard invalid zero/negative inputs and must not reproduce legacy error fallbacks that silently substituted arbitrary dates.

## Reporting and derived analysis

Reporting and derived analysis are part of the intended Pipestry product, even if individual reports are implemented after the core CRUD workflows.

Reports must be calculated from canonical persisted domain records rather than stored as independent report-result data.

The retained legacy reporting capabilities include the following.

### Pipe and blend pairing analysis

The application should identify frequently or successfully used pipe/blend pairings and support a configurable minimum qualifying-session threshold.

The default threshold is at least 5 qualifying sessions. Pairing and dedication reports should use the same inclusive threshold semantics rather than reproducing the legacy >5 versus >=5 inconsistency.

Pairing analysis uses session count together with average function and flavor scores. Break-in sessions and N/A scores are excluded from score-based pairing analysis.

### Pipe and blend session summaries

For a pipe, the application should support a session summary that includes session count, most recent session date, average function score, and average flavor score.

For a blend, the application should support a session summary that includes session count, most recent session date, average function score, and average flavor score.

History/detail screens should default to the 100 most recent relevant sessions, ordered newest first, rather than a fixed calendar window. Older history must remain accessible.

The Top 100 presentation limit does not limit long-term aggregates. Derived ratings, averages, dedication, pairing analysis, and other historical metrics use all qualifying canonical sessions unless a report explicitly defines a recent-history scope.

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

- Cellar stock totals based on current on-hand quantities, with archived items contributing zero
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

The legacy application behavior audit has also been reviewed and has supplied the application-side calculations and defaults retained in this document. Any future source lookup should be targeted to a specific ambiguity. Pipestry may intentionally modernize legacy calculations when the old behavior is undesirable, but such changes should be explicit.

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

## Notes and formatted text

Pipe, blend, session, and maintenance notes are stored as plain-text Markdown rather than trusted raw HTML.

The display layer should render a safe, constrained Markdown subset sufficient for normal formatting such as bold, italic, lists, links, and line breaks. Raw embedded HTML should be disabled or sanitized so stored notes cannot introduce unsafe markup.

## Historical integrity and record lifecycle

Pipestry must preserve historical relationships among sessions, pipes, cellar items, blends, maintenance records, and reference data.

Operational status changes such as Removed for a pipe or Archived for a cellar item must not destroy historical records.

Domain records should use soft deletion or lifecycle status where needed rather than physical deletion by default. Hard deletion must not create broken historical references or orphaned dependent records.

A master blend that is referenced by cellar inventory or historical sessions must not be hard-deleted; it may instead be made inactive/hidden. An unused blend entered in error may be physically deleted if nothing references it.

The same principle applies to manufacturers and lookup/reference records: referenced values must not be physically deleted. Maintenance entries entered in error may be hard deleted because they have no dependent historical relationships that require a soft-deletion lifecycle.

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

Supplies are part of the functional domain. Their physical storage model is defined in `docs/DATABASE-DESIGN.md`.

This section describes the logical domain relationships. The finalized physical relational design is defined in `docs/DATABASE-DESIGN.md`; application structure and API boundaries are defined in `docs/ARCHITECTURE.md`.

## Access and authentication

Pipestry is a single-user personal application for Joey.

Google sign-in is used to protect access to the application. Authentication is a security boundary, not a domain-ownership model.

A minimal local user/authentication record may be retained as needed to associate the authorized Google identity with Pipestry and to provide a local display name or identifier. That record does not imply ownership of domain data.

Pipes, blends, cellar items, sessions, maintenance entries, supplies, manufacturers, countries, classifications, lookup/reference data, and other application records do not require a UserId or equivalent ownership foreign key. The fact that the data belongs to Joey is implicit in this single-user Pipestry installation.

Multi-user data partitioning is not a current requirement. If Pipestry is ever redesigned as a shared multi-user service, ownership and tenant boundaries would be a separate future architectural change rather than a constraint on the current schema.

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

Because Pipestry is single-user and domain records are not user-owned, the ETL does not need to discover, inject, or map a Pipestry UserId onto imported domain/reference records.

Migration should:

- Preserve or map legacy primary keys sufficiently to reconcile source and destination records.
- Reconcile counts and relevant sums for major canonical entities.
- Validate migrated sessions and maintenance entries against valid referenced records.
- Compare a small agreed sample of legacy and replacement reports after import where those reports are retained.
- Treat differences as items to investigate rather than silently accept.

## Legacy-source verification status

The current requirements incorporate the known behavior recovered from:

- Direct review of the legacy Embers database schema, stored procedures, views, and functions
- A focused Codegen behavior audit of the legacy application source
- Joey's explicit decisions about which legacy capabilities to retain, change, or remove

The broad legacy verification pass is complete for the supplied materials. Any future source inspection should be targeted only at a specific unresolved or ambiguous behavior rather than repeating a general audit.

The legacy implementation remains evidence, not the specification.

## Implementation details outside this document

This requirements document does not attempt to specify every implementation detail. Settled implementation-level decisions are recorded in the other durable project documents:

- `docs/DATABASE-DESIGN.md` defines the finalized relational database design.
- `docs/TECHNOLOGY-STACK.md` defines the selected technology stack and hosting approach.
- `docs/ARCHITECTURE.md` defines application structure, responsibility boundaries, and the API approach.

The following details remain to be resolved during implementation where needed:

- PostgreSQL-specific types, DDL, and generated migration details
- Detailed screen layouts and visual design
- Presentation details not already fixed by the requirements
- Detailed ETL mappings and reconciliation procedures
- Exact recovery, audit, and default-visibility UX for soft-deleted sessions

These implementation decisions should remain consistent with the settled requirements and durable design documents rather than automatically reproducing the legacy Embers implementation.
