<p align="center">
  <img src="./docs/assets/banner.svg" alt="Simple Vite React Express: a full-stack starter with working CRUD" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Avinava/simple-vite-react-express/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Avinava/simple-vite-react-express/ci.yml?branch=master&style=flat-square&label=CI" alt="CI"></a>
  <img src="https://img.shields.io/badge/Node-22%2B-5FA04E.svg?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node 22+">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=React&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-7-646CFF.svg?style=flat-square&logo=Vite&logoColor=white" alt="Vite 7">
  <img src="https://img.shields.io/badge/Express-5-000000.svg?style=flat-square&logo=Express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/Prisma-7-2D3748.svg?style=flat-square&logo=Prisma&logoColor=white" alt="Prisma 7">
  <img src="https://img.shields.io/badge/PostgreSQL-4169e1.svg?style=flat-square&logo=PostgreSQL&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License">
</p>

> [!TIP]
> **Starting something new?** The successor, [`agentic-react-express-ts`](https://github.com/Avinava/agentic-react-express-ts), is this stack in TypeScript with tRPC and pre-wired guardrails. This repo stays maintained as the simple JavaScript version. [Migration guide](docs/migrating-to-agentic.md).

A full-stack starter with **working examples**, not empty folders: real CRUD, database relationships,
forms with validation, and a clean layered structure you can read in an afternoon.

**Version 2.2** · [Changelog](CHANGELOG.md) · [Docs](docs/getting-started.md)

## Quick Start

### AspireCrm: run with Aspire

This fork adds a **TypeScript AppHost**, not a rewrite of the JavaScript application.
Use Node.js 22.13+ (or 24+), npm, Docker with Linux containers, the .NET 10 SDK,
and an Aspire CLI supporting TypeScript AppHosts. The authored SDK and integration
defaults are **13.6.4**.
The default dashboard uses HTTPS; configure a trusted development certificate with
`aspire certs trust` if the machine does not already have one.

```bash
npm ci
npm ci --prefix aspire-apphost
aspire restore --non-interactive
aspire start --non-interactive --isolated --apphost aspire-apphost/apphost.mts
aspire wait web --apphost aspire-apphost/apphost.mts
aspire describe --apphost aspire-apphost/apphost.mts
```

Open the `web` URL reported by `aspire describe` or the dashboard. Ports are assigned
dynamically; no `.env`, manually created database, or `db:setup` is needed for Aspire.
The AppHost models `pg` (PostgreSQL with a data volume), `crm` (database),
`migrations` (Prisma client generation and non-interactive migration deployment),
`api` (Express with database-backed `/api/v1/health`), and `web` (Vite/React).
The API waits for migrations to exit successfully; Vite waits for the healthy API.
All Node resources share the root npm installation, so dependencies are installed once
before starting instead of racing three installers.

Aspire supplies a PostgreSQL URI as `DATABASE_URL`, the API's endpoint as Vite's
`API_URL`, and Vite's endpoint as the API's `FRONTEND_URL`. Existing standalone
scripts and `.env` settings remain supported. Aspire suppresses Vite's automatic
browser opening. Application logs appear in the dashboard; additional application
OpenTelemetry instrumentation is not included.

```bash
aspire logs api --apphost aspire-apphost/apphost.mts
aspire stop --non-interactive --apphost aspire-apphost/apphost.mts
```

Stopping preserves the database volume. Keep the AppHost's local secret storage with
that volume: resetting secrets or changing SDK/secret-store identity can produce a new
password that does not match an existing volume. Do not delete a volume containing
data you need. `.aspire/` and `aspire-apphost/.aspire/modules/` are generated/local
state, never template inputs or hand-edited source.

### Stamp out a new application

The repository root is one **unpacked .NET template**, described by
`.template.config/template.json`; this is not just a GitHub repository template.
Directory and Git sources require the feature CLI from
[microsoft/aspire#21263](https://github.com/microsoft/aspire/pull/21263), or a later CLI
whose `aspire new --help` lists `--template-path` and `--template-repository`.
The CLI used for this proof of concept is `17.0.0-pr.21263.gdb30e07c`.
The installed daily CLI `17.0.0-preview.1.26520.10` does **not** have those flags.
Use the feature executable as `aspire` for the following generation commands.

From a local checkout:

```bash
aspire new --template-path /absolute/path/to/simple-vite-react-express \
  --name MyCrm --output ./MyCrm --suppress-agent-init --non-interactive
```

Or from this fork (replace the branch ref with a full commit SHA for reproducibility):

```bash
aspire new \
  --template-repository https://github.com/mitchdenny/simple-vite-react-express \
  --template-repository-ref mitchdenny-react-express-aspire-template \
  --template-path . --name MyCrm --output ./MyCrm \
  --suppress-agent-init --non-interactive
```

Then use the run commands above from the generated directory:

```bash
cd MyCrm
npm ci
npm ci --prefix aspire-apphost
aspire restore --non-interactive
aspire start --non-interactive --isolated --apphost aspire-apphost/apphost.mts
aspire wait web --apphost aspire-apphost/apphost.mts
aspire describe --apphost aspire-apphost/apphost.mts
```

Template post-actions/scripts are not executed: generation does not install npm
dependencies or run database migrations. Startup runs the modeled migration resource.
The template excludes Git metadata, dependency/build/cache directories, generated
Aspire state, `.env` secrets, and its own authoring metadata. It retains `example.env`,
both npm lockfiles, migrations, source, tests, licensing, and project-local Aspire skills.
The name changes the generated directory and `AspireCrm` documentation label; npm
package identifiers deliberately remain unchanged, so names such as `MyCrm` do not
introduce invalid uppercase npm names or broken imports.

`AspireVersion` is a string parameter with an authored `13.6.4` default. The custom-source
CLI supplies its actual SDK identity, including PR suffixes. `JavaScriptVersion` and
`PostgreSQLVersion` independently select integration package versions from the effective
NuGet feeds; they must not inherit the CLI's SDK version blindly. Each symbol replaces
only its corresponding JSON value in `aspire.config.json`. Host metadata permits
prereleases and uses the unrestricted `*-*` version range for those integration choices.
This pure TypeScript AppHost has no user-authored .NET restore consumers and does not
request a root `NuGet.config`.

For local PR builds, set `ASPIRE_CLI_PACKAGES` to the matching shipping-package directory
when invoking the feature CLI. This explicitly selects the CLI SDK identity and makes
that directory an identity package source; it is not `--source`. Also enable the local
feed in the effective NuGet configuration used for integration selection and restore.
For example, with an existing isolated NuGet configuration:

```bash
export ASPIRE_CLI_PACKAGES=/absolute/path/to/matching/Shipping
dotnet nuget add source "$ASPIRE_CLI_PACKAGES" --name aspire-pr \
  --configfile /absolute/path/to/isolated/NuGet.Config
```

Use that configuration through the validation user's home or another standard NuGet
configuration discovery location. Generated PR SDK identities need their matching
packages available at restore/start time too. Do not use
`--source`, `--version`, `--channel`, or `--language` with custom-template sources:
the feature rejects those combinations. No machine-local package path is embedded in
the generated application.

Ordinary .NET template tooling can use the stable authored defaults:

```bash
dotnet new install /absolute/path/to/simple-vite-react-express
dotnet new aspire-react-express --name MyCrm --output ./MyCrm
```

### Standalone development (without Aspire)

You need **Node.js 22+** and a running **PostgreSQL** ([no Postgres? see options](docs/getting-started.md#1-prerequisites)).

```bash
npx degit Avinava/simple-vite-react-express my-project
cd my-project
npm install

cp example.env .env        # then set DATABASE_URL in .env
createdb simple-vite-db    # skip if the database already exists
npm run db:setup           # migrations + Prisma client
npm run db:seed            # optional sample data
npm run dev
```

Open <http://localhost:3000>. The API runs on <http://localhost:8080/api/v1>.

Something not working? See [Troubleshooting](docs/troubleshooting.md).

## What's inside

A small CRM that shows the patterns you'll reuse:

- **Contacts**: full CRUD with Formik + Yup forms
- **Tasks**: status workflow, assigned to contacts
- **Projects**: many-to-many team membership
- **Plumbing**: health check, toasts, error handling, security headers, rate limiting, tests

```
Browser ─► React 19 + MUI 7 ─► Express 5 ─► Prisma 7 ─► PostgreSQL
Client: Pages → Hooks → Services → Axios      Server: Routes → Services → Prisma
```

More in [Architecture](docs/architecture.md) and the [API reference](docs/api.md).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Client and server together |
| `npm run build` / `npm start` | Production build / run |
| `npm run db:setup` | Migrate + generate Prisma client |
| `npm run db:seed` | Load sample data |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:reset` | Drop and re-create the database schema |
| `npm run test:run` | Tests once (`npm test` for watch) |
| `npm run lint` / `npm run format` | ESLint / Prettier |

## Tech stack

| Layer | Tools |
|-------|-------|
| Client | React 19, Vite 7, MUI 7, React Router 7, Formik + Yup, Axios, react-toastify |
| Server | Express 5, Prisma 7 (pg adapter), celebrate/Joi, Helmet, express-rate-limit |
| Quality | ESLint 9 (flat config), Prettier, Vitest 4, React Testing Library, GitHub Actions CI |

## Screenshots

<div align="center">
  <img src="screenshots/homepage.png" alt="Homepage" width="48%">
  <img src="screenshots/contacts.png" alt="Contacts" width="48%">
  <img src="screenshots/tasks.png" alt="Tasks" width="48%">
  <img src="screenshots/projects.png" alt="Projects" width="48%">
</div>

## Using it as your own project

Rename the project, swap the logo and theme, replace the demo models, then delete what you don't need.
The checklist lives in [Getting Started](docs/getting-started.md#make-it-yours) and
[Architecture](docs/architecture.md#removing-the-demo).

Using an AI coding agent? [AGENTS.md](AGENTS.md) describes the conventions.

## Contributing

Small, focused PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
