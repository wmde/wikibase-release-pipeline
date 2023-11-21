import { spawn } from 'child_process'
import { mkdir, rm, stat } from 'fs';
import axios from 'axios';
import asyncWaitUntil from 'async-wait-until';
import dotenv from 'dotenv';

const { waitUntil, TimeoutError } = asyncWaitUntil;

const suiteName = process.env.SUITE;
const isBaseSuite = suiteName.startsWith('base__');
const suiteConfigName = isBaseSuite ? suiteName.replace( 'base__', '' ) : suiteName;
process.env.SUITE_CONFIG_NAME = suiteConfigName;

const resultsDir = `suites/${suiteName}/results`;
const testLog = `${resultsDir}/${suiteName}.log`;
export const screenshotPath = `${resultsDir}/screenshots`;
export const resultFilePath = `${resultsDir}/result.json`;


let dockerComposeCmd = 'docker compose --env-file default.env -f docker-compose.yml -f suites/docker-compose.yml';
const composeOverrideFilePath = `suites/${suiteName}/docker-compose.override.yml`

stat(composeOverrideFilePath, ( err ) => {
  if ( !err ) {
    dockerComposeCmd += ` -f ${composeOverrideFilePath}`
  }
});

export const SuiteSetup = {
  setupLogs: (): boolean => {
    try {
      console.log(`\n▶️  Setting-up "${suiteName}" test suite`);
      // eslint-disable-next-line security/detect-non-literal-fs-filename, @typescript-eslint/no-empty-function
      rm( resultsDir, { recursive: true, force: true }, () => {} );
      // eslint-disable-next-line security/detect-non-literal-fs-filename, @typescript-eslint/no-empty-function
      mkdir( resultsDir, { recursive: true }, () => {} );
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      rm( screenshotPath, { recursive: true, force: true }, () => {} );
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      rm( resultFilePath, { force: true }, () => {} );
      return true;
    } catch (e) {
      console.log('❌ Error occurred in setting-up logs:', e);
      return false;
    }
  },

  loadDockerImages: (): boolean => {
    const loadLocalDockerImage = ( imageName: string ): boolean => {
      // if ( `docker images -q ${imageName}` ) {
      //   console.log(`ℹ️  Image ${imageName} already loaded.`);
      // } else {
      // }

      console.log(`🔄 Loading image: ${imageName}`);
      // eslint-disable-next-line security/detect-child-process
      spawn( `docker load -i "../artifacts/${imageName}.docker.tar.gz"`, {
        stdio: 'inherit',
        shell: true
      } );
  
      return true;
    };

    // Load current local build variables
    dotenv.config( { path: '../variables.env' } );

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

    defaultImages.forEach( loadLocalDockerImage );
    
    if (!isBaseSuite) {
      bundleImages.forEach( loadLocalDockerImage );
    };

    return true;
  },

  stopServices:  (): void => {
    const stopServiceCmd = `${dockerComposeCmd} down --volumes --remove-orphans --timeout 1`;

    // eslint-disable-next-line security/detect-child-process
    spawn( stopServiceCmd, {
      stdio: 'inherit',
      shell: true
    } );
  },

  startServices:  (): void => {
    const startServicesCmd = `${dockerComposeCmd} up -d --build --scale test-runner=0 `;

    // eslint-disable-next-line security/detect-child-process
    spawn( startServicesCmd, {
      stdio: 'inherit',
      shell: true
    } );
  },

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
