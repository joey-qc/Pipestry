# Pipestry Application Architecture

## Purpose

This document defines the application structure and responsibility boundaries for Pipestry.

Functional and domain requirements are defined in `docs/REQUIREMENTS.md`. The relational database design is defined in `docs/DATABASE-DESIGN.md`. Selected implementation technologies are defined in `docs/TECHNOLOGY-STACK.md`.

This document intentionally does not duplicate those specifications. It records how the application is organized and where application, database, validation, transaction, and reporting responsibilities belong.

## Architectural shape

Pipestry is a single Next.js full-stack application organized as a modular monolith.

There is no separate backend service, application server, or internal REST API tier. The Next.js application contains both the user-facing application and its server-side application logic.

The primary flow is:

```text
Next.js UI
    |
    v
server-side commands and queries
    |
    v
Drizzle and/or PostgreSQL functions/views
    |
    v
PostgreSQL
```

The architecture should remain proportional to Pipestry as a single-user personal application. Additional services, repository abstractions, interfaces, class-library layers, or other indirection should be introduced only when a concrete requirement justifies them.

## Application organization

Application code is organized primarily by domain feature rather than by generic technical layer.

Primary feature areas include:

- pipes
- blends
- cellar
- sessions
- maintenance
- supplies
- reports
- authentication

A feature should keep its UI, server-side commands, focused query helpers, and feature-specific validation close together where practical.

Shared infrastructure belongs outside feature modules only when it is genuinely cross-cutting, such as:

- database connection and schema infrastructure
- common validation utilities
- date and duration formatting
- unit conversion
- Markdown rendering and sanitization
- reusable UI primitives

Feature-specific business logic should remain with its owning feature or in PostgreSQL when the logic is deliberately database-resident.

## UI and server responsibilities

UI components are responsible for presentation, interaction, and collecting user input.

Authoritative data mutations occur in server-side code. Client-side code must not be the sole enforcement point for business rules or data integrity.

Server-side commands represent meaningful application operations such as recording a session, archiving a cellar item, opening a cellar item, or maintaining a pipe.

Simple reads and straightforward persistence may use focused Drizzle queries directly without requiring a service or repository wrapper.

## Database interaction

PostgreSQL is used for more than passive persistence where database-resident logic provides a clear benefit.

### Direct Drizzle access

Drizzle is appropriate for:

- straightforward CRUD operations
- simple list and detail queries
- lookup/reference data access
- focused reads whose logic is clear and local

These operations should not be wrapped in additional repository or service abstractions merely for architectural symmetry.

### PostgreSQL functions and views

PostgreSQL functions and views may be used selectively for:

- multi-step data-centric operations
- operations that must update related state atomically
- persisted derived values that must remain synchronized
- substantial set-based reporting and aggregation
- reusable database-side calculations

Examples include session operations that maintain the persisted blend rating and cellar lifecycle operations that must update multiple related values together.

The intent is not to reproduce the full stored-procedure surface of legacy Embers. Database objects should be added only where they make the Pipestry implementation simpler, safer, or more efficient.

## Validation and data integrity

Validation responsibilities are split by purpose.

The application layer handles:

- required user-input validation
- user-facing validation messages
- workflow and contextual rules
- authorization and access checks
- validation needed before invoking a database operation

PostgreSQL handles structural and invariant protection through:

- foreign keys
- uniqueness constraints
- check constraints
- non-null constraints
- database-resident operation logic where selected

Important invariants may be protected in both places when doing so improves user feedback while preserving database integrity.

## Transactions

The layer that owns a multi-step operation owns its transaction boundary.

If a PostgreSQL function encapsulates a multi-step operation, the function is responsible for completing that operation atomically.

If multi-statement application logic remains in TypeScript, it must use an explicit database transaction when the statements must succeed or fail together.

Transaction ownership should not be split unnecessarily across layers.

## Reporting and derived calculations

Report results are derived from canonical domain records and are not persisted as independent report-result tables.

Straightforward operational reads may be implemented with Drizzle.

Heavier reporting and aggregate calculations should preferentially use set-based PostgreSQL queries, functions, or views where that keeps the logic concise and close to the data.

Examples include:

- pipe/blend pairing analysis
- dedication analysis
- sessions-since-maintenance calculations
- usage summaries
- top-blend calculations
- cellar and inventory summaries

Persisted derived values already defined by the database design, such as blend rating, must remain synchronized whenever their canonical source data changes.

## API boundary

Pipestry does not require a separate internal REST or JSON API layer.

The Next.js application may use route handlers where an actual HTTP endpoint is required, such as authentication integration, but application features should not create internal API endpoints merely to separate the UI from server-side code.

If Pipestry later gains a genuinely separate client or external integration, an API boundary can be introduced at that time.

## Dependency direction

Feature modules may depend on shared infrastructure.

Shared infrastructure must not depend on feature modules.

Features should avoid importing another feature's internal implementation details. When cross-feature behavior is genuinely required, it should use a small intentional boundary rather than arbitrary internal imports.

The general rule is:

```text
feature code -> shared infrastructure
shared infrastructure -X-> feature code
```

Code should move into shared modules only after it is genuinely reused and has no feature-specific meaning.

## Architectural constraint

Pipestry should remain easy to understand as a small personal application.

Architecture should favor directness over abstraction. New layers, services, interfaces, repositories, packages, or deployment units require a concrete need rather than being introduced as default patterns.
