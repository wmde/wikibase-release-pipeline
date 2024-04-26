# Logs
# Save these logs inside the container
# TODO: do we need those? Can we not write to the container for logging?
$wgDebugLogGroups = array(
	'resourceloader' => '/var/log/mediawiki/resourceloader.log',
	'exception' => '/var/log/mediawiki/exception.log',
	'error' => '/var/log/mediawiki/error.log',
	'fatal' => '/var/log/mediawiki/fatal.log',
);

# Configured web paths & short URLs
# This allows use of the /wiki/* path
# https://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "/w";        // this should already have been configured this way
$wgArticlePath = "/wiki/$1";

# Set Secret
$wgSecretKey = $_ENV['MW_WG_SECRET_KEY'];

# Number of jobs run on request, 0 with job runner, above 0 without job runner
$wgJobRunRate = $_ENV['MW_WG_JOB_RUN_RATE'];
$wgEnableUploads = $_ENV['MW_WG_ENABLE_UPLOADS'];

## Pingback
$wgWBRepoSettings['wikibasePingback'] = $_ENV['WIKIBASE_PINGBACK'];

# Wikibase Repository
wfLoadExtension( 'WikibaseRepository', "$IP/extensions/Wikibase/extension-repo.json" );
require_once "$IP/extensions/Wikibase/repo/ExampleSettings.php";

# Wikibase Client
wfLoadExtension( 'WikibaseClient', "$IP/extensions/Wikibase/extension-client.json" );
require_once "$IP/extensions/Wikibase/client/ExampleSettings.php";

# Load extensions if present
foreach (glob("LocalSettings.d/*.php") as $filename)
{
    include $filename;
}

# User provided override file to LocalSettings that can be mounted in the container
include "/var/www/html/LocalSettings.override.php";
