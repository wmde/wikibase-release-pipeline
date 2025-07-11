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
