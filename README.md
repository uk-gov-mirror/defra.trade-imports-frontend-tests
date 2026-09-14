# trade-imports-frontend-tests

This repository runs frontend tests against the `btms-portal-frontend` service.

- [trade-imports-frontend-tests](#trade-imports-frontend-tests)
  - [Local Development](#local-development)
    - [Requirements](#requirements)
      - [Node.js](#nodejs)
    - [Setup](#setup)
    - [Running local tests](#running-local-tests)
    - [Debugging local tests](#debugging-local-tests)
    - [Running BrowserStack tests](#running-browserstack-tests)
  - [Production](#production)
    - [Running the tests](#running-the-tests)
  - [Requirements of CDP Environment Tests](#requirements-of-cdp-environment-tests)
  - [Licence](#licence)
    - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v24` and [npm](https://nodejs.org/) `>= v11.12.1`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and fill out the configuration for each value inside your copied `.env`.

### Running local tests

To run the tests locally, you will first need to clone `btms-local-environment` and run the following command:

```bash
docker compose up -d
```

This will run all the relevant services locally which you can then hit by running tests from inside this repository.

To run the tests locally, run the following command:

```bash
npm run test:local && npm run report:open
```

This will run all the tests including the accessibility tests.

### Debugging local tests

```bash
npm run test:local:debug
```

### Running BrowserStack tests

```bash
npm run test:browserstack
```

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
