# S9 Contracts

Relevant contract surfaces:

- `.env.example`
- `docker-compose.yml`
- API health endpoint.
- Worker readiness endpoint or log probe.
- Migration and seed commands.

Required contract behavior:

- A clean local checkout must be enough to start the demo after env setup.
- Service names in Docker Compose must match env defaults.
- Health checks must fail loudly when database, Redis or object storage is unreachable.
