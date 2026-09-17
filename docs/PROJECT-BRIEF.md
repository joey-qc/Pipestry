# Pipestry Project Brief

## Product vision

Pipestry is a personal application for managing a tobacco-pipe collection and tobacco cellar, while also serving as a smoking-session and tasting journal.

It should help the owner keep an accurate inventory of pipes and cellared tobacco blends, record smoking experiences, and preserve the relationships between pipes, blends, and sessions so that useful patterns and reports can be developed over time.

## Intended user

Pipestry is being designed for a single owner. Multi-user support is not currently a product goal.

The application will be used primarily from a phone while smoking and secondarily from a laptop for collection and cellar management. A browser-based, always-online application is acceptable.

## Core product areas

### Pipe collection

Maintain the owner's collection of tobacco pipes, including creating, viewing, editing, and removing records as the collection changes.

### Tobacco cellar

Maintain an inventory of tobacco blends that are owned and being stored or aged for future use. Blend categories and types are important domain concepts.

### Session and tasting journal

Record smoking sessions that pair a pipe with a tobacco blend. Sessions should support personal observations such as tasting notes, flavor impressions, pipe function, and overall flavor performance.

The long-term data model should preserve the relationships among sessions, pipes, blends, and blend categories. This will support future analysis such as identifying successful pipe/blend pairings and understanding whether particular pipes perform especially well with certain blend categories or individual blends.

## Initial usable scope

The first usable version must provide CRUD capability for:

- Pipes
- Tobacco blends
- Smoking sessions

More advanced history views, pairing analysis, dedication reporting, and other reports may follow after the core records and relationships are established.

## Access and authentication

Pipestry does not need a custom user-account or password-management system. Since it is intended for one owner, authentication should remain lightweight. Signing in with the owner's Google account is acceptable.

## Legacy data migration

Legacy Embers data must be migrated into Pipestry through a deliberate ETL and reconciliation process.

The available legacy data may come from more than one source:

- A local development database whose schema is believed to represent the final Embers structure but whose data may be incomplete or stale.
- Spreadsheet exports made from the former Azure production system, including pipe and cellar inventory data.

Records and primary keys may not align cleanly between those sources. Legacy migration should therefore be treated as a separate workstream that includes source assessment, matching/reconciliation, transformation, validation, and import into the new relational model.

## Current boundaries

- Single-owner application
- Browser-based access from phone and laptop
- Always-online operation is acceptable
- Relational data model
- Lightweight Google-based authentication
- Legacy data migration is required

Detailed functional requirements, data-model design, reporting requirements, architecture, and implementation planning will be defined separately as the product is developed.
