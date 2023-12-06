import logger from '@wdio/logger';

const testLog = logger( 'test-testEnv' );
testLog.setDefaultLevel( 'debug' );

export default testLog;
