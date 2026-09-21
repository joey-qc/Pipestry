# Pipestry Project Brief

## Startup context

This brief is the entry point for Pipestry project context. Before making product, data-model, architecture, or implementation decisions, read the current durable project documents in this order:

1. `docs/PROJECT-BRIEF.md` — product intent, boundaries, and current direction
2. `docs/REQUIREMENTS.md` — agreed functional and domain requirements
3. `docs/DATABASE-DESIGN.md` — finalized relational database design
4. `docs/TECHNOLOGY-STACK.md` — selected implementation technologies and operational conventions
5. `docs/ARCHITECTURE.md` — application structure, responsibility boundaries, and database/application interaction

These documents are the authoritative durable project context. When they already contain a settled decision, do not reconstruct or reopen it from conversational memory unless a genuine conflict or implementation problem is discovered.

## Product vision

Pipestry is a personal application for managing a tobacco-pipe collection and tobacco cellar, while also serving as a smoking-session and tasting journal.

It should help the owner keep an accurate inventory of pipes and cellared tobacco blends, record smoking experiences, preserve maintenance and supplies context, and preserve the relationships among pipes, blends, cellar items, and sessions so that useful history, maintenance, pairing, cellar, and usage reports can be developed over time.

## Intended user

Pipestry is a single-user personal application for Joey. The application data belongs to this Pipestry installation as a whole; the domain model does not need per-record user ownership or multi-user data partitioning.

Authentication exists to protect access to the application, not to scope pipes, blends, cellar items, sessions, manufacturers, reference data, or other domain records by user.

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

Pipestry should use Google sign-in to protect access to the application.

Pipestry should not implement native password storage, password-reset or forgot-password flows, or password-oriented administrative account management.

The authenticated identity is an access-control concern only. A minimal local user/authentication record may be used as needed for login and display identity, but domain and reference records are not owned or partitioned by that user record.

## Record lifecycle and historical integrity

Records should use explicit lifecycle status or soft deletion where appropriate rather than being physically removed by default.

Historical records must remain intelligible after a related record is removed from active use. For example, an existing smoking session should continue to show the pipe and cellar item it references even if the pipe is later removed or the cellar item is archived. Archiving a cellar item means no usable tobacco remains: its status becomes Archived and its on-hand quantity becomes zero, while its historical session relationships remain intact.

Sessions may be logically/soft deleted when entered in error or otherwise no longer wanted. Hard deletion must not be allowed when it would break historical relationships or create orphaned dependent records.

Detailed lifecycle semantics are defined in `docs/REQUIREMENTS.md`.

## Legacy data migration

Legacy Embers data must be migrated into Pipestry through a deliberate ETL and reconciliation process.

The available legacy data may come from more than one source:

- A local development database whose schema is believed to represent the final Embers structure but whose data may be incomplete or stale.
- Spreadsheet exports made from the former Azure production system, including pipe and cellar inventory data.

Records and primary keys may not align cleanly between those sources. Legacy migration should therefore be treated as a separate workstream that includes source assessment, matching/reconciliation, transformation, validation, and import into the new relational model.

Because Pipestry remains a single-user application, migrated Embers domain records do not require assignment to a user/account foreign key. Authentication and migrated domain data remain separate concerns.

The Embers schema, application, and data are evidence about the prior system, not automatic requirements for Pipestry. Agreed carry-forward behavior is recorded in `docs/REQUIREMENTS.md`.

## Legacy-source verification

The broad legacy verification work is complete for the supplied materials.

The database-side pass covered the Embers schema, stored procedures, views, and functions. The application-side pass used a focused Codegen behavior audit of the legacy client/API/domain source. Material behaviors recovered from those reviews, together with Joey's explicit decisions about what to retain, change, or remove, are now incorporated into `docs/REQUIREMENTS.md`.

Any future source inspection should be targeted to a specific unresolved question rather than repeating a broad audit. The old implementation remains evidence, not the specification.

## Current boundaries

- Single-user personal application for Joey
- Authentication protects application access; domain/reference records are not partitioned by user
- Browser-based access from phone and laptop
- Always-online operation is acceptable
- Relational data model
- Google authentication
- Legacy data migration is required
- Historical relationships must survive lifecycle changes and soft deletion
- Retained reporting and history features are product requirements even if implementation is phased

The technology stack, hosting approach, relational database design, and application architecture are settled in the durable documents listed in Startup context. Database-engine-specific schema implementation, detailed visual design, authentication implementation details, feature implementation, and detailed migration mechanics remain implementation work.

## Current product-definition direction

The current functional/domain requirements, relational database design, technology stack, and application architecture are settled and documented in the durable project documents listed in Startup context.

The next phase is implementation design and implementation. The expected sequence is:

1. Implement the finalized relational model in Drizzle/PostgreSQL.
2. Generate and review the initial migration SQL.
3. Define authentication implementation details from the settled Better Auth / Google-only / allowlist requirements.
4. Establish the initial Next.js project structure and deployment configuration.
5. Proceed into feature implementation in a sensible vertical order.

Legacy Embers remains evidence for migration and targeted behavior questions, not the implementation specification.
