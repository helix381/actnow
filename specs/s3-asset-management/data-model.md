# S3 Data Model

## Tables

- assets
- characters
- character_forms
- shot_asset_refs
- shot_character_form_refs

## Key Rules

- Files live in object storage; metadata lives in PostgreSQL.
- CharacterForm references an Asset as its visual source.
- Global asset reuse is future-facing; MVP can keep project scope.
