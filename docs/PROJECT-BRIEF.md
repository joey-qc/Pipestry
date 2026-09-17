# Pipestry Project Brief

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

The initial version should use Google sign-in only.

Pipestry should not implement native password storage, password-reset or forgot-password flows, or password-oriented administrative account management for the initial version.

The application remains personal-first, while leaving open the possibility of supporting independent additional users later.

## Record lifecycle and historical integrity

Records such as pipes and blends should use soft deletion rather than being physically removed by default.

Historical records must remain intelligible after a related record is soft-deleted. For example, an existing smoking session should continue to show the pipe and blend it references even if either has later been marked deleted or archived.

Hard deletion must not be allowed when it would break historical relationships or otherwise create orphaned dependent records.

The exact user-facing distinction between deleted and archived states can be refined as the relevant workflows are defined.

## Legacy data migration

Legacy Embers data must be migrated into Pipestry through a deliberate ETL and reconciliation process.

The available legacy data may come from more than one source:

- A local development database whose schema is believed to represent the final Embers structure but whose data may be incomplete or stale.
- Spreadsheet exports made from the former Azure production system, including pipe and cellar inventory data.

Records and primary keys may not align cleanly between those sources. Legacy migration should therefore be treated as a separate workstream that includes source assessment, matching/reconciliation, transformation, validation, and import into the new relational model.

Because Embers was a single-user system, its migrated domain records should be assigned to Joey's Pipestry account if the replacement model includes explicit ownership.

## Current boundaries

- Personal-first application for Joey; multi-user support is deferred, not ruled out
- Browser-based access from phone and laptop
- Always-online operation is acceptable
- Relational data model
- Google-only authentication for the initial version
- Legacy data migration is required
- Historical relationships must survive soft deletion of referenced records

Detailed functional requirements, data-model design, reporting requirements, architecture, and implementation planning will be defined as the product is developed.

## Current product-definition direction

Audience/ownership and record-deletion semantics have been discussed and agreed at the product level.

The next unresolved product decision to work through is cellar inventory semantics: whether a smoking session reduces inventory, and if so, how consumption should be represented.
