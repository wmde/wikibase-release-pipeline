# Logs
# Save these logs inside the container
# TODO: do we need those? Can we not write to the container for logging?
$wgDebugLogGroups = array(
	'resourceloader' => '/dev/stdout',
	'exception' => '/dev/stderr',
	'error' => '/dev/stderr',
	'fatal' => '/dev/stderr',
);

# Number of jobs run on request, 0 with job runner, above 0 without job runner
$wgJobRunRate = $_ENV['MW_WG_JOB_RUN_RATE'];
$wgEnableUploads = $_ENV['MW_WG_ENABLE_UPLOADS'];

# Pingback
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
