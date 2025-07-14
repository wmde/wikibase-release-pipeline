## Related Feature Stories

### Implemented

- User can easily setup WBS Deploy on a VPS provider of their choice
- User can configure the initial WBS Deploy setup through a easy to use web based UI with inline documentation
- User is clearly notified when WBS Deploy is done being configured and up and running
- User can start a WBS Deploy instance without having to register domain names
- User can use deploy/docker-compose.yml without modification in Dokploy or similiar Open Source PAAS provider which overlaps traefik configuration

### In Progress

- User can press a "Reset" button to stop all services, DESTROY ALL CURRENT DATA, change/re-apply configuration, and re-start services. 
  - docker compose down --volumes`
  - rm -rf config
  - git checkout config
- User can configure the initial WBS Deploy setup through a easy to use text based CLI with inline documentation
- User has a more clear indication when a service doesn't boot or is left in an unhealthy status, as this indicates a failed installation

### Won't be implemented

- User can trust the access information (passwords) for the WBS services are stored in a secure way (not in plain text in a .env file)
  - .env file should not be retained in the file system, its values are only used in installation and then not actually re-applied if changed
- User can easily and reliably use all WBS Deploy services in a localhost configuration
- User can monitor docker compose service status in a WBS provided dashboard
- User can start/stop/reset docker compose service in a WBS provided dashboard

---

Wikibase Suite Deploy Setup Tool

The Wikibase Suite Deploy Setup Tool is a lightweight, zero-configuration installer for quickly launching a full Wikibase Suite instance on any fresh VPS. Designed for ease and speed, it combines a one-liner install script with a web-based configuration interface and automatic environment setup. No Docker, DNS, or manual file editing is required upfront — everything is generated or guided in-browser.

Features

- One-liner install via curl | bash or cloud-init script
- Immediate startup confirmation via temporary page on port 80
- Browser-based setup interface on port 8888 with live logs
- Auto-generated secure passwords and .env file
- Optional custom hostnames or automatic nip.io configuration
- Optional opt-in to list your instance with the Wikibase community
- Automatic SSL certificate support via nip.io (if desired)
- Clean shutdown of setup utility after installation completes

Steps to Launch a New Wikibase Suite Deploy Instance

1. Provision a VPS with the minimum recommended specification or greater
2. SSH in to your new VPS instance as root user and copy/paste this command:

    `curl -fsSL https://raw.githubusercontent.com/wmde/wikibase-release-pipeline/refs/heads/cloud-config-test/deploy/setup/setup.sh | bash`

3. Open the setup URL printed in the terminal (based on your server’s IP)
4. Once prompted on the web page, enter your MediaWiki admin email, choose whether to advertise your instance, and fill in any optional fields including custom domain names (if preconfigured in DNS)
5. Click save and wait for the installation to complete — you’ll be forwarded to your new running Wikibase homepage automatically
