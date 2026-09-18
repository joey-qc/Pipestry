# Pipestry Project Brief

## Startup context

This brief is the entry point for Pipestry project context. After reading it, read `docs/REQUIREMENTS.md` for the current agreed functional requirements and logical domain model before making product, data-model, architecture, or implementation decisions.

## Product vision

Pipestry is a personal application for managing a tobacco-pipe collection and tobacco cellar, while also serving as a smoking-session and tasting journal.

It should help the owner keep an accurate inventory of pipes and cellared tobacco blends, record smoking experiences, preserve maintenance and supplies context, and preserve the relationships among pipes, blends, cellar items, and sessions so that useful history, maintenance, pairing, cellar, and usage reports can be developed over time.

## Intended user

Pipestry is being designed first as a personal application for Joey. Multi-user support is not part of the initial scope, but product and data-model decisions should avoid unnecessarily preventing support for independent additional users later.

The application will be used primarily from a phone while smoking and secondarily from a laptop for collection and cellar management. A browser-based, always-online application is acceptable.

## Core product areas

### Pipe collection

Maintain the owner's collection of tobacco pipes, including creating, viewing, editing, lifecycle removal, maintenance history, and maintenance-derived context such as sessions since cleaning.

### Tobacco cellar

Maintain a master catalog of tobacco blends and an inventory of physically distinct owned cellar items that are being stored, aged, opened, smoked, and eventually archived. Blend categories, types, ingredients, flavorings, packaging, and cellar-item age are important domain concepts.

### Session and tasting journal

Record smoking sessions that pair a pipe with a specific owned cellar item. Sessions support personal observations such as notes, pipe/function scoring, flavor scoring, and historical analysis.

### Supplies

Track useful consumable supplies, including the retained legacy pipe-cleaner capability and related projections.

### Reporting and history

Provide the retained useful history and reporting capabilities built from canonical domain records, including pipe/blend pairing analysis, pipe dedication/history, blend usage and ratings, cellar/inventory views, maintenance context, and supply projections.

The long-term data model must preserve the relationships needed to support these views without making report results independent sources of truth.

## Functional scope and phasing

The intended product includes the full set of retained functional requirements recorded in `docs/REQUIREMENTS.md`, including:

- Pipes and pipe maintenance
- Tobacco blend catalog and classifications
- Cellar inventory
- Smoking sessions
- Supplies tracking
- Mobile-aware list/detail workflows
- Filtering and sorting
- History and maintenance context
- Pairing, usage, dedication, cellar, inventory, and supply reporting

Implementation may be phased. A feature being scheduled for a later milestone does not remove it from the product requirements.

The foundational implementation must establish the canonical records and relationships required by the retained reporting and history features so later phases do not require redesigning the core model.

## Access and authentication

The initial version should use Google sign-in only.

Pipestry should not implement native password storage, password-reset or forgot-password flows, or password-oriented administrative account management for the initial version.

The application remains personal-first, while leaving open the possibility of supporting independent additional users later.

## Record lifecycle and historical integrity

Records should use explicit lifecycle status or soft deletion where appropriate rather than being physically removed by default.

Historical records must remain intelligible after a related record is removed from active use. For example, an existing smoking session should continue to show the pipe and cellar item it references even if the pipe is later removed or the cellar item is archived.

Sessions may be logically/soft deleted when entered in error or otherwise no longer wanted. Hard deletion must not be allowed when it would break historical relationships or create orphaned dependent records.

Detailed lifecycle semantics are defined in `docs/REQUIREMENTS.md`.

## Legacy data migration

Legacy Embers data must be migrated into Pipestry through a deliberate ETL and reconciliation process.

The available legacy data may come from more than one source:

- A local development database whose schema is believed to represent the final Embers structure but whose data may be incomplete or stale.
- Spreadsheet exports made from the former Azure production system, including pipe and cellar inventory data.

Records and primary keys may not align cleanly between those sources. Legacy migration should therefore be treated as a separate workstream that includes source assessment, matching/reconciliation, transformation, validation, and import into the new relational model.

Because Embers was a single-user system, its migrated domain records should be assigned to Joey's Pipestry account if the replacement model includes explicit ownership.

The Embers schema, application, and data are evidence about the prior system, not automatic requirements for Pipestry. Agreed carry-forward behavior is recorded in `docs/REQUIREMENTS.md`.

## Legacy-source verification

The legacy database-side verification pass is complete for the supplied Embers schema script. The current requirements now incorporate behavior recovered directly from its tables, stored procedures, views, and functions, together with Codegen's legacy-application discovery documents and Joey's explicit decisions about what to retain or change.

A one-time review of the legacy application source remains before final architecture and implementation planning. Its purpose is to:

- Identify material UI, workflow, validation, navigation, defaulting, or client/API behaviors not represented in SQL.
- Recover calculations performed outside the database, including remaining supply-projection behavior.
- Confirm any application-side presentation or interpretation of retained reporting features.
- Avoid repeatedly reintroducing legacy discovery files into future project conversations.

That verification should refine the requirements only where it reveals durable product behavior worth retaining. The old implementation remains evidence, not the specification.

## Current boundaries

- Personal-first application for Joey; multi-user support is deferred, not ruled out
- Browser-based access from phone and laptop
- Always-online operation is acceptable
- Relational data model
- Google-only authentication for the initial version
- Legacy data migration is required
- Historical relationships must survive lifecycle changes and soft deletion
- Retained reporting and history features are product requirements even if implementation is phased

Technology-stack selection, physical database design, API/DTO design, detailed visual design, remaining application-side behavior/formulas, and detailed migration mechanics remain to be defined.

## Current product-definition direction

Core domain requirements and the currently known retained Embers behavior are documented in `docs/REQUIREMENTS.md`.

The next requirements activity is the one-time legacy application source-code verification pass described above. The database schema/procedure/view/function review is complete for the supplied SQL artifact. After the application-source pass, any material findings should be incorporated into the requirements before finalizing architecture, technology choices, physical schema, and implementation planning.
