import os
import requests
import zipfile
import logging
logging.basicConfig(level=logging.DEBUG)

headers = {'Accept': 'application/vnd.github.v3+json'}
r = requests.get('https://api.github.com/repos/wmde/wikibase-release-prototype/actions/runs/465817659/artifacts',  headers=headers)

artifactsMetadata =  r.json()

print( 'token:' + os.getenv('GITHUB_TOKEN')[1] + 'token ends' )

for artifact in artifactsMetadata['artifacts']:
    # if artifact['name'] != 'QueryService UI Docker Image':
    #     continue
    r = requests.get( artifact['archive_download_url'], allow_redirects=True, headers={"Authorization": 'Bearer ' + os.getenv('GITHUB_TOKEN') } )
    zipfilePath = os.path.join('/zips' ,artifact['name'] + '.zip')
    open(zipfilePath, 'wb').write(r.content)
    with zipfile.ZipFile(zipfilePath, 'r') as zip_ref:
        extractedFileFath = os.path.join('/extractedArtifacts', artifact['name'])
        zip_ref.extractall(extractedFileFath)


print(os.system('ls -lh "/extractedArtifacts/QueryService UI Docker Image"'))
