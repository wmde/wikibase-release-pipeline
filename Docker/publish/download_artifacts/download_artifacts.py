import os
import requests
import zipfile

print('Getting artifacts for run %s' % os.getenv('WORKFLOW_RUN_NUMBER'))

headers = {'Accept': 'application/vnd.github.v3+json'}
artifactsPath = 'https://api.github.com/repos/wmde/wikibase-release-prototype/actions/runs/' + os.getenv('WORKFLOW_RUN_NUMBER') + '/artifacts'
r = requests.get(artifactsPath,  headers=headers)

basepath = os.path.join('/extractedArtifacts', os.getenv('WORKFLOW_RUN_NUMBER'))
artifactsMetadata =  r.json()

if artifactsMetadata['total_count'] == 0:
    raise Exception("This run does not contain any artifacts to publish!") 

if not os.path.exists(basepath):
    for artifact in artifactsMetadata['artifacts']:
        print('Downloading %d bytes from %s' % (artifact['size_in_bytes'], artifact['name']))

        r = requests.get( artifact['archive_download_url'], allow_redirects=True, headers={"Authorization": 'Bearer ' + os.getenv('GITHUB_TOKEN') } )
        zipfilePath = os.path.join('/tmp' ,artifact['name'] + '.zip')
        open(zipfilePath, 'wb').write(r.content)

        with zipfile.ZipFile(zipfilePath, 'r') as zip_ref:
            extractedFileFath = os.path.join(basepath, artifact['name'])
            zip_ref.extractall(extractedFileFath)

print(os.system('ls -lh ' + basepath))
