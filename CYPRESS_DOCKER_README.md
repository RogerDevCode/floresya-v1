# Cypress Docker Setup

This setup allows you to run Cypress E2E tests in a Docker container against the Node.js application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js application with Cypress tests configured

## Services

### App Service

- Builds and runs the Node.js application on port 3001
- Uses the Dockerfile in the root directory
- Environment: PORT=3001, NODE_ENV=development

### Cypress Service

- Uses Cypress included image (cypress/included:13.17.0)
- Runs E2E tests against the app service
- Base URL: http://app:3001

## Usage

### Starting the services persistently

```bash
docker compose up -d
```

This starts both the app and cypress services in the background, keeping Cypress always available.

### Running tests on demand

```bash
docker compose exec cypress npx cypress run --spec "tests/e2e/**/*.cy.js"
```

This runs Cypress tests in headless mode against the running app service.

### Interactive mode

```bash
docker compose exec cypress npx cypress open --config-file /cypress.config.js
```

This opens the Cypress Test Runner in interactive mode.

### Stopping services

```bash
docker compose down
```

This stops and removes the containers.

## Customization

### Ports

To change the app port, modify the docker-compose.yml:

```yaml
app:
  ports:
    - 'YOUR_PORT:YOUR_PORT'
  environment:
    - PORT=YOUR_PORT
```

And update the Cypress baseUrl accordingly.

### Test Specs

To run specific test specs, modify the command in docker-compose.yml:

```yaml
cypress:
  command: npx cypress run --spec "cypress/integration/specific-test.js" --config-file /cypress.config.js
```

### Environment Variables

You can pass additional environment variables to Cypress:

```yaml
cypress:
  environment:
    - CYPRESS_baseUrl=http://app:3001
    - CYPRESS_CUSTOM_VAR=value
```

Or create a .env file in the root and reference it.

## Volumes

The setup mounts the following volumes:

- `./tests/e2e:/e2e` - Test files
- `./cypress:/cypress` - Screenshots and videos
- `./cypress.config.js:/cypress.config.js` - Cypress configuration

## Troubleshooting

- Ensure the app service is healthy before Cypress starts
- Check Docker logs: `docker compose logs app`
- For interactive debugging, use `docker compose run --rm cypress bash` to access the container
