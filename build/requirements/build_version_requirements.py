import yaml
import os

def getVar( varName ):
    if varName in os.environ:
        name = components[varName]
        return name + " " + os.environ[varName]
    else:
        return 'undefined'

components =	{
  "RELEASE_MAJOR_VERSION": "MediaWiki",
  "ELASTICSEARCH_VERSION": "Elasticsearch",
  "WDQS_VERSION": "WDQS",
}

databases = []

# read databases
with open('config.yml') as f:
  data = yaml.load(f, Loader=yaml.FullLoader)
  databases = data['jobs']['test_wikibase']['strategy']['matrix']['databaseImageName']

f = open("artifacts/built_versions.log", "w+")

for key in components:
  f.write(getVar(key) + '\n')

f.write('Databases: ' + ', '.join(databases))
f.close()