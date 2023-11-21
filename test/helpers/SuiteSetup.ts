import { spawnSync } from 'child_process'
import { mkdir, rm, stat } from 'fs/promises';
import axios from 'axios';
import asyncWaitUntil from 'async-wait-until';
import dotenv from 'dotenv';

// Load current local build variables
dotenv.config( { path: 'default.env' } );
dotenv.config( { path: 'variables.env' } );
dotenv.config( { path: 'local.env' } );

const { waitUntil, TimeoutError } = asyncWaitUntil;

const suiteName = process.env.SUITE;
const isBaseSuite = suiteName.startsWith('base__');
const suiteConfigName = isBaseSuite ? suiteName.replace( 'base__', '' ) : suiteName;
process.env.SUITE_CONFIG_NAME = suiteConfigName;

const resultsDir = `suites/${suiteName}/results`;
const testLog = `${resultsDir}/${suiteName}.log`;
export const screenshotPath = `${resultsDir}/screenshots`;
export const resultFilePath = `${resultsDir}/result.json`;

let dockerComposeCmd = `docker compose --env-file variables.env --env-file default.env --env-file local.env -f suites/docker-compose.yml --project-directory ${process.env.HOST_PWD}/suites`;
const composeOverrideFilePath = `suites/${suiteName}/docker-compose.override.yml`

try {
  await stat(composeOverrideFilePath)
  dockerComposeCmd += ` -f ${composeOverrideFilePath}`
} catch {}


export const SuiteSetup = {
  setupLogs: async (): Promise<void> => {
    console.log(`\n▶️  Setting-up "${suiteName}" test suite`);
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename, @typescript-eslint/no-empty-function
      await rm( resultsDir, { recursive: true, force: true } );
      // eslint-disable-next-line security/detect-non-literal-fs-filename, @typescript-eslint/no-empty-function
      await mkdir( resultsDir, { recursive: true } );
    } catch (e) {
      console.log('❌ Error occurred in setting-up logs:', e);
    }
  },

  loadDockerImages: (): void => {
    const loadLocalDockerImage = ( imageName: string ): void => {
      const result = spawnSync('docker', [ 'images', '-q', imageName ], { encoding: 'utf-8' });

      if ( !result.stdout ) {
        // eslint-disable-next-line security/detect-child-process
        spawnSync( 'docker', [ 'load', '-i', `artifacts/${imageName}.docker.tar.gz` ], {
          stdio: 'inherit',
          shell: true
        } );
      }
    };

    process.env.DATABASE_IMAGE_NAME = process.env.DATABASE_IMAGE_NAME || process.env.DEFAULT_DATABASE_IMAGE_NAME;
    process.env.WIKIBASE_TEST_IMAGE_NAME = isBaseSuite
      ? process.env.WIKIBASE_IMAGE_NAME
      : process.env.WIKIBASE_BUNDLE_IMAGE_NAME;

    const defaultImages = [
      process.env.WIKIBASE_TEST_IMAGE_NAME,
      process.env.WDQS_IMAGE_NAME,
      process.env.WDQS_FRONTEND_IMAGE_NAME,
      process.env.WDQS_PROXY_IMAGE_NAME
    ];

    const bundleImages = [
      process.env.ELASTICSEARCH_IMAGE_NAME,
      process.env.QUICKSTATEMENTS_IMAGE_NAME
    ];

    // # Does it do anything to be adding the ":latest" tag to these?
    process.env.WIKIBASE_TEST_IMAGE_NAME = `${process.env.WIKIBASE_TEST_IMAGE_NAME}:latest`;
    process.env.QUERYSERVICE_IMAGE_NAME = `${process.env.QUERYSERVICE_IMAGE_NAME}:latest`;
    process.env.QUERYSERVICE_UI_IMAGE_NAME = `${process.env.QUERYSERVICE_IMAGE_NAME}:latest`;
    process.env.WDQS_PROXY_IMAGE_NAME = `${process.env.WDQS_PROXY_IMAGE_NAME}:latest`;
    process.env.QUICKSTATEMENTS_IMAGE_NAME = `${process.env.QUICKSTATEMENTS_IMAGE_NAME}:latest`;
    process.env.ELASTICSEARCH_IMAGE_NAME = `${process.env.ELASTICSEARCH_IMAGE_NAME}:latest`;

    defaultImages.forEach( defaultImage => loadLocalDockerImage(defaultImage) );
    
    if (!isBaseSuite) {
      bundleImages.forEach( bundleImage => loadLocalDockerImage(bundleImage) );
    };
  },

  stopServices:  (): void => {
    const stopServiceCmd = `${dockerComposeCmd} down --volumes --remove-orphans --timeout 1`;
    console.log(stopServiceCmd);

    // eslint-disable-next-line security/detect-child-process
    spawnSync( stopServiceCmd, {
      stdio: 'inherit',
      shell: true
    } );
  },

  startServices: (): void => {
    const startServicesCmd = `${dockerComposeCmd} up -d`;
    console.log(startServicesCmd);

    // eslint-disable-next-line security/detect-child-process
    spawnSync( startServicesCmd, {
      stdio: 'inherit',
      shell: true
    } );
  },

  // after: async (): Promose<void> => {
  //   //	console.log(`🔄 \"process.env.SUITE\" test suite run complete. Removing running Docker test services and volumes\n`)
	//   // 	SuiteSetup.stopServices();
  // },

  checkIfUp: async (
    serverURL: string,
    // default timeout is 1 second less than default Mocha test timeout
    timeout: number = ( Number.parseInt( process.env.MOCHA_OPTS_TIMEOUT ) ||
      90 * 1000 ) - 1000,
    timeoutMsg: string = null
  ): Promise<void> => {
    try {
      const predicate = async () => {
        try {
          const result = await axios.get( serverURL );
          return true;
        } catch ( e ) {
          return false;
        }
      }
      await waitUntil( predicate, { timeout } );
      console.log( `ℹ️  Successfully loaded ${serverURL}` );
    } catch (e) {
      if (e instanceof TimeoutError) {
        console.log(
          timeoutMsg ||
            `❌ Could not load ${serverURL} after ${
              timeout / 1000
            } seconds.`
        );
      } else {
        console.log(
          `❌ Could not load ${serverURL} with error: ${e}`
        );
      }
    }
  }
}
