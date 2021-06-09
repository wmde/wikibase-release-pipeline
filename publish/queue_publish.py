import os
import requests
import zipfile
import json 
from pprint import pprint

print('Queing publish for %s' % os.getenv('WORKFLOW_RUN_NUMBER'))

headers = {'Accept': 'application/vnd.github.v3+json'}
# set -o allexport; source .env; source variables.env; source local.env; set +o allexport

workflow_file = "built_and_test.yml"
url = "https://api.github.com/repos/wmde/wikibase-release-pipeline/actions/workflows/%s/dispatches" % workflow_file

data = {'ref': 'main', 'inputs': { 'env_file': '.env' } }

r = requests.post(url, data=json.dumps(data), headers={"Authorization": 'Bearer ' + os.getenv('GITHUB_TOKEN'), 'Accept': 'application/vnd.github.v3+json' } )
if r.status_code != 204:
    errorMessage = "Unknown error (http " + str(r.status_code) + ")."
    try:
        errorMessage = r.json()['message']
    except:
        pass
    raise Exception("Github API request failed: " + errorMessage)
else:
    print(r.content)
    print(r.text)
    print(r.json())
    pprint(dir(r))


