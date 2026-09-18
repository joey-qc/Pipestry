# Pipestry Functional and Domain Requirements

## Purpose

This document captures the agreed functional and domain requirements for Pipestry at a level suitable for guiding data-model, architecture, and implementation work.

It complements `docs/PROJECT-BRIEF.md`. The project brief remains the high-level source for product intent, boundaries, and direction; this document is the durable source for the detailed behavior and domain model agreed so far.

The legacy Embers database is evidence about the prior system. Pipestry intentionally carries forward the parts of that domain model that remain useful, while modernizing structures where explicitly agreed.

## Core domain terminology

Pipestry distinguishes between:

- **Blend**: the master definition of a tobacco blend, independent of whether any is currently owned.
- **Cellar item**: one physically distinct owned container or holding of a blend.
- **Pipe**: one physical tobacco pipe in the collection.
- **Session**: one smoking/tasting event using one pipe and one specific cellar item.

A blend can therefore exist without being owned, and multiple cellar items can reference the same blend while retaining their own dates, packaging, status, and age information.

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

Pipe maintenance history carries forward as part of the pipe domain. A maintenance entry associates a pipe with a maintenance action, date/time, and optional note.

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

### New-session selection rules

When creating a new session:

- Only cellar items with status **Open (30)** are selectable.
- Pipes with status **Primary (10)**, **Secondary (20)**, or **Standby (101)** are selectable.
- Pipes with status **Removed (111)** are not selectable.

These restrictions apply to creation of new sessions. Historical sessions remain valid and intelligible if a referenced cellar item is later Archived or a referenced pipe is later Removed.

## Historical integrity and record lifecycle

Pipestry must preserve historical relationships among sessions, pipes, cellar items, blends, and reference data.

Operational status changes such as Removed for a pipe or Archived for a cellar item must not destroy historical records.

Domain records should use soft deletion or lifecycle status where needed rather than physical deletion by default. Hard deletion must not create broken historical references or orphaned dependent records.

## Reference and seed data

Existing Embers domain lookup/reference data relevant to the retained Pipestry model should be used as source seed data where practical.

This includes the established lookup domains for pipes, blends, cellar inventory, sessions, manufacturers, countries, ingredients, flavorings, packaging, and related classifications.

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

This is a logical domain model, not yet a physical database schema or API contract.

## Access and authentication

The initial version uses Google sign-in only.

The application is personal-first for Joey. Multi-user support is not part of the initial scope, but implementation choices should avoid unnecessarily preventing independent users from being supported later.

## Initial functional scope

The first usable version must support management of:

- Pipes and pipe maintenance history
- Master tobacco blends and their classifications/relationships
- Cellar inventory items and their lifecycle
- Smoking sessions

The application must support creating, viewing, editing, and lifecycle removal/archive behavior appropriate to these records while preserving historical integrity.

Advanced pairing analysis, dedication reporting, richer history/reporting, and similar analytics can follow after the core records and relationships are established.

## Legacy migration

Legacy Embers data must be migrated through a deliberate ETL and reconciliation process as described in `docs/PROJECT-BRIEF.md`.

The legacy schema and seed/reference data are useful inputs to the new logical model, but migration mapping, reconciliation rules, and physical import mechanics remain a separate workstream.

## Implementation details intentionally deferred

The following are not yet fixed by this requirements document:

- Application technology stack and hosting architecture
- Physical database schema, keys, indexes, and constraints
- API shape and DTO definitions
- Detailed screen layouts and interaction design
- Advanced reporting and analytics specifications
- Detailed ETL mappings and reconciliation procedures

Those decisions should be made from the requirements and logical model above rather than by automatically reproducing the legacy Embers implementation.
