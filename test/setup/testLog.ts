import logger from '@wdio/logger';

const testLog = logger( 'test-environment' );
testLog.setDefaultLevel( 'debug' );

export default testLog;
