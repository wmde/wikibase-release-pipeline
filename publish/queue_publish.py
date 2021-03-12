import os
import requests
import zipfile
import json 
from pprint import pprint

print('Queing publish for %s' % os.getenv('WORKFLOW_RUN_NUMBER'))

headers = {'Accept': 'application/vnd.github.v3+json'}

url = "https://api.github.com/repos/wmde/wikibase-release-pipeline/actions/workflows/publish.yml/dispatches"
data = {'ref': 'main', 'inputs': { 'workflow_run_number': os.getenv('WORKFLOW_RUN_NUMBER'), 'env_file': os.getenv('env_file') } }

r = requests.post(url, data=json.dumps(data), headers={"Authorization": 'Bearer ' + os.getenv('GITHUB_TOKEN'), 'Accept': 'application/vnd.github.v3+json' } )
if r.status_code != 204:
    errorMessage = "Unknown error (http " + str(r.status_code) + ")."
    try:
        errorMessage = r.json()['message']
    except:
        pass
    raise Exception("Github API request failed: " + errorMessage)

