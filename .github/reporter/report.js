import { existsSync, readFileSync } from 'fs';
import { extractModuleLineAndColumn } from 'mocha-json-streamier-reporter/lib/parse-stack-trace';
import core from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';

if( !process.env.SUITE ) {
    return;
}

const filePath = `../../test/suites/${process.env.SUITE}/results/result.json`;

var resultObject = {};

if (existsSync(filePath)) {
    resultObject = JSON.parse(readFileSync(filePath, 'utf8'))[process.env.SUITE];

    if (resultObject.fail.length != 0) {

        resultObject.fail.forEach(test => {
            const error = extractModuleLineAndColumn(test.error.stack);
            let filePath = '';
            if( error.file ) {
                filePath = error.file.replace('/usr/src/app/', 'test/');
            }
            const message = test.fullTitle + ": " + test.error.message;
            
            issueCommand('error', {
                file: filePath,
                line: error.line,
                col: error.column
            }, message);
        });

    } else {
        resultObject.pass.forEach(test => {
            core.info( 'OK: ' + test.fullTitle );
        });

        resultObject.skip.forEach(test => {
            core.warning( 'SKIP: ' + test.fullTitle );
        });

        core.info('\u001b[1mAll good 👍')
    }
} else {
    core.error('No tests executed!');
}
