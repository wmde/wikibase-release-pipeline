import os
import requests
import zipfile

headers = {'Accept': 'application/vnd.github.v3+json'}
print('Getting artifacts for run %s' % os.getenv('WORKFLOW_RUN_NUMBER'))
r = requests.get('https://api.github.com/repos/wmde/wikibase-release-prototype/actions/runs/' + os.getenv('WORKFLOW_RUN_NUMBER') + '/artifacts',  headers=headers)

basepath = os.path.join('/extractedArtifacts', os.getenv('WORKFLOW_RUN_NUMBER'))
artifactsMetadata =  r.json()
for artifact in artifactsMetadata['artifacts']:
    # if artifact['name'] != 'QueryService UI Docker Image':
    #     continue
    print('Downloading %s' % artifact['archive_download_url'])
    r = requests.get( artifact['archive_download_url'], allow_redirects=True, headers={"Authorization": 'Bearer ' + os.getenv('GITHUB_TOKEN') } )
    zipfilePath = os.path.join('/zips' ,artifact['name'] + '.zip')
    open(zipfilePath, 'wb').write(r.content)
    with zipfile.ZipFile(zipfilePath, 'r') as zip_ref:
        extractedFileFath = os.path.join(basepath, artifact['name'])
        zip_ref.extractall(extractedFileFath)

print(os.system('ls -lh ' + basepath))
