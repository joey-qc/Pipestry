# Pipestry Project Brief

## Startup context

This brief is the entry point for Pipestry project context. After reading it, read `docs/REQUIREMENTS.md` for the current agreed functional requirements and logical domain model before making product, data-model, architecture, or implementation decisions.

## Product vision

Pipestry is a personal application for managing a tobacco-pipe collection and tobacco cellar, while also serving as a smoking-session and tasting journal.

It should help the owner keep an accurate inventory of pipes and cellared tobacco blends, record smoking experiences, and preserve the relationships between pipes, blends, and sessions so that useful patterns and reports can be developed over time.

## Intended user

Pipestry is being designed first as a personal application for Joey. Multi-user support is not part of the initial scope, but product and data-model decisions should avoid unnecessarily preventing support for independent additional users later.

The application will be used primarily from a phone while smoking and secondarily from a laptop for collection and cellar management. A browser-based, always-online application is acceptable.

## Core product areas

### Pipe collection

Maintain the owner's collection of tobacco pipes, including creating, viewing, editing, and removing records as the collection changes.

### Tobacco cellar

Maintain a master catalog of tobacco blends and an inventory of physically distinct owned cellar items that are being stored, aged, opened, smoked, and eventually archived. Blend categories, types, ingredients, flavorings, packaging, and cellar-item age are important domain concepts.

### Session and tasting journal

Record smoking sessions that pair a pipe with a specific owned cellar item. Sessions should support personal observations such as tasting notes, flavor impressions, pipe function, and overall flavor performance.

The long-term data model should preserve the relationships among sessions, pipes, cellar items, blends, and blend categories. This will support future analysis such as identifying successful pipe/blend pairings and understanding whether particular pipes perform especially well with certain blend categories or individual blends.

## Initial usable scope

The first usable version must provide management capability for:

- Pipes and pipe maintenance history
- Tobacco blend catalog
- Cellar inventory
- Smoking sessions

More advanced history views, pairing analysis, dedication reporting, and other reports may follow after the core records and relationships are established.

Detailed behavior and the agreed logical domain relationships for this scope are defined in `docs/REQUIREMENTS.md`.

## Access and authentication

The initial version should use Google sign-in only.

Pipestry should not implement native password storage, password-reset or forgot-password flows, or password-oriented administrative account management for the initial version.

The application remains personal-first, while leaving open the possibility of supporting independent additional users later.

## Record lifecycle and historical integrity

Records such as pipes and blends should use soft deletion or explicit lifecycle status rather than being physically removed by default.

Historical records must remain intelligible after a related record is removed from active use. For example, an existing smoking session should continue to show the pipe and cellar item it references even if the pipe is later removed or the cellar item is archived.

Hard deletion must not be allowed when it would break historical relationships or otherwise create orphaned dependent records.

Detailed lifecycle semantics are defined in `docs/REQUIREMENTS.md`.

## Legacy data migration

Legacy Embers data must be migrated into Pipestry through a deliberate ETL and reconciliation process.

The available legacy data may come from more than one source:

- A local development database whose schema is believed to represent the final Embers structure but whose data may be incomplete or stale.
- Spreadsheet exports made from the former Azure production system, including pipe and cellar inventory data.

Records and primary keys may not align cleanly between those sources. Legacy migration should therefore be treated as a separate workstream that includes source assessment, matching/reconciliation, transformation, validation, and import into the new relational model.

Because Embers was a single-user system, its migrated domain records should be assigned to Joey's Pipestry account if the replacement model includes explicit ownership.

The Embers schema and data are evidence about the prior system, not automatic requirements for Pipestry. Agreed carry-forward behavior is recorded in `docs/REQUIREMENTS.md`.

## Current boundaries

- Personal-first application for Joey; multi-user support is deferred, not ruled out
- Browser-based access from phone and laptop
- Always-online operation is acceptable
- Relational data model
- Google-only authentication for the initial version
- Legacy data migration is required
- Historical relationships must survive lifecycle changes or soft deletion of referenced records

Architecture, technology-stack selection, physical database design, API/DTO design, detailed UI design, advanced reporting, and migration mechanics will be defined as the product is developed.

## Current product-definition direction

Core domain requirements for pipes, blends, cellar inventory, smoking sessions, retained reference data, lifecycle semantics, and the logical relationships among those domains are now documented in `docs/REQUIREMENTS.md`.

The next phase is to review the requirements for any remaining material gaps, then use the agreed requirements and logical domain model to make implementation and technology decisions. Physical schema and API/DTO definitions should follow from those decisions rather than from the legacy Embers implementation by default.
