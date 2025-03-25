#!/usr/bin/env bash

if [ "$IS_JOBRUNNER" = "true" ]; then
	# Check if the JobRunner process is running
	if pgrep -f "php maintenance/runJobs.php" > /dev/null; then
		# Check if showJobs.php executes successfully
		if php /path/to/mediawiki/maintenance/showJobs.php > /dev/null 2>&1; then
			exit 0  # Healthy
		else
			exit 1  # Unhealthy: showJobs.php did not execute successfully
		fi
	else
		exit 1  # Unhealthy: JobRunner process not found
	fi
else
	if curl --silent --fail "http://localhost/wiki/Main_Page" > /dev/null; then
		exit 0  # Healthy
	else
		exit 1  # Unhealthy
	fi
fi
