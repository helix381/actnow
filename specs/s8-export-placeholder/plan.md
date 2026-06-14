# S8 Plan

## Implementation Order

1. Add CompositionJob schema and API placeholder.
2. Build export frame with episode selection and job status.
3. Worker creates a placeholder export artifact.
4. Store export artifact as GeneratedFile with `is_current` support.
5. Add signed URL download flow.

## Engineering Notes

- Keep S8 P1; do not block S1-S7/S9.
- Reuse storage and generated file lifecycle rules from `spec/storage.md`.
- User chooses the current export version. The system can suggest local archive packaging when versions become large.

## Verification

- Create an export job from seeded completed video files.
- Confirm output file record is retained.
- Confirm signed URL expires and can be reissued.
