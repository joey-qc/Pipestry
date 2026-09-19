# Pipestry Technology Stack

## Purpose

This document records the selected implementation technologies and related operational conventions for Pipestry.

Functional and domain requirements are defined in `docs/REQUIREMENTS.md`. The relational schema is defined in `docs/DATABASE-DESIGN.md`. Application-layer structure and boundaries will be documented separately when the architecture is designed.

## Selected stack

| Area | Decision |
| --- | --- |
| Application framework | Next.js 16.3.x with TypeScript |
| Hosting | Vercel |
| Server runtime | Node.js |
| Database | PostgreSQL hosted on Neon |
| ORM / schema tooling | Drizzle ORM / Drizzle Kit |
| Application database driver | `node-postgres` (`pg`) |
| Authentication | Better Auth with Google OAuth only |

### Next.js version policy

Use the latest patched release in the selected Next.js 16.3.x line. At the time this decision was made, the current patched release is 16.3.3.

Security and maintenance patches should be applied promptly rather than treating the initially selected patch version as fixed indefinitely.

## Hosting and runtime

Pipestry will be hosted on Vercel and use the Node.js runtime for server-side application execution.

The Edge runtime is not required by the current product and is not part of the selected stack.

## Database

Pipestry will use PostgreSQL hosted on Neon.

The finalized relational design in `docs/DATABASE-DESIGN.md` will be implemented in PostgreSQL using database-engine-specific types, constraints, indexes, and DDL appropriate to that design.

### Application database access

Application services will use Drizzle ORM with `node-postgres` (`pg`) against Neon's pooled PostgreSQL connection.

This path is the default for application database access because Pipestry requires transaction-capable services for multi-statement operations that must be atomic.

Where a domain operation requires multiple related reads or writes to succeed or fail together, it must execute inside an explicit database transaction.

## Database migrations

Schema migrations will use a generated, reviewable migration workflow:

1. Change the Drizzle schema in source.
2. Generate migration SQL with Drizzle Kit.
3. Review the generated SQL.
4. Commit the schema change and migration artifacts to Git.
5. Apply unapplied migrations as a controlled deployment step.

Production schema changes must not use `drizzle-kit push`.

Migration execution will use Neon's direct/non-pooled database connection rather than the pooled application connection.

## Authentication

Pipestry will use Better Auth with Google as the only authentication provider.

Authentication must enforce all of the following:

- Google OAuth only.
- The Google identity must be verified.
- Access is restricted by an explicit server-side allowlist for Joey's approved Google identity.
- A valid Google account by itself is not sufficient authorization to Pipestry.
- Allowlist configuration and authentication secrets must not be committed to source control.

Pipestry will not implement native password authentication, password reset, magic-link authentication, or additional identity providers unless the requirements change.

## Alternatives evaluated

SQLite, Turso, and Convex were considered before selecting Neon PostgreSQL.

Plain SQLite is technically sufficient for Pipestry's workload, but durable SQLite storage would require changing the preferred Vercel hosting model or introducing another hosted SQLite service. Turso removes that hosting limitation but also removes much of the simplicity advantage of a local SQLite file.

Convex provides a capable hosted backend and reactive document database, but Pipestry's finalized relational model and reporting requirements are a more natural fit for PostgreSQL.

PostgreSQL on Neon therefore provides the best fit with the existing relational design while remaining compatible with the selected Vercel deployment model.
