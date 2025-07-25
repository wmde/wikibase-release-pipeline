Wikibase Suite Deploy Setup Tool

The Wikibase Suite Deploy Setup Tool is a lightweight, zero-configuration installer for quickly launching a full Wikibase Suite instance on any freshly-created VPS instance. Designed for ease and speed, it combines a one-liner install script with a web-based configuration interface and automatic environment setup. No Docker or manual file editing is required upfront — everything is generated or guided in-browser, resulting in a running Wikibase Suite Deploy instance.

Features

- One-liner install via curl | bash or cloud-init script
- Browser-based setup interface on port 8888 with live logs
- Optional custom hostnames which otherwise default to <SERVER-IP>.nip.io names
- Auto-generated secure passwords
- Optional opt-in to list your instance with the Wikibase community, with a default of true
- Clean shutdown of setup utility after installation completes (10 min timeout), including removal of passwords from .env

Steps to Launch a New Wikibase Suite Deploy Instance

1. Provision a VPS with the minimum recommended specification or greater
2. SSH in to your new VPS instance as root user and copy/paste this command:

    `curl -fsSL https://raw.githubusercontent.com/wmde/wikibase-release-pipeline/refs/heads/deploy-setup-script/deploy/setup/setup.sh | bash`

3. Open the setup URL printed in the terminal once prompted
4. On the webpage enter your MediaWiki admin email, base host name, and whether to advertise your instance. Advanced options also available, such as manually setting database password, etc.
5. Click Save, and wait for services to boot

---

## Related Feature Stories

### Implemented

- User can easily setup WBS Deploy on a VPS provider of their choice
- User can configure the initial WBS Deploy setup through a easy to use web based UI with inline documentation
- User is clearly notified when WBS Deploy is done being configured and up and running
- User can trust the access information (passwords) for the WBS services are stored in a secure way (not in plain text in a .env file)
- User can create a WBS Deploy instance without having to register domain names
- _User can use deploy/docker-compose.yml without modification in Dokploy or similiar Open Source PAAS provider which overlaps traefik configuration_

### In Progress

- User can configure the initial WBS Deploy setup through a easy to use text based CLI with inline documentation
- User can setup WBS Deploy to run on localhost without external access and all services work as expected without warnings or errors

### Won't be implemented

- User has a clear indication when a service doesn't boot or is left in an unhealthy status, and is provided instructions for debugging / how to proceed
- User can press a "Reset" button to stop all services, DESTROY ALL CURRENT DATA, change/re-apply configuration, and re-start services. 
  - docker compose down --volumes`
  - rm -rf config
  - git checkout config
- User can easily and reliably use all WBS Deploy services in a localhost configuration
- User can monitor docker compose service status in a WBS provided dashboard
- User can start/stop/reset docker compose service in a WBS provided dashboard
