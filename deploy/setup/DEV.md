## Remaining TODOs:

- [x] Test/fix updated Docker install script on Debian, Fedora, and CentOS (* the only distros supported by Deploy)
- [ ] Review Web Setup UI inline docs and refine or add/enhance to finalize
- [ ] Double check Password validations to make sure they follow more tightly MediaWiki + MariaDB requirements,
      consider incorporating the common words dictionary lookup here. Have a "Generate" link for passwords or keep
      auto generated if ignored?
- [ ] Documentation diligence, refinement, and alignment from deploy/README.md through to deploy/setup/README.md (et al)
- [ ] Test and better define intention for --local CLI flag
---
- [x] Review CLI options for setup.sh and make sure they are coherent and not too overlapping (--dev in particular)
- [X] Refine content for creating DNS entry for server (Make SERVER_IP visible, etc)
- [X] Add validation that the entered DNS entry actually points to the expected SERVER_IP

---

## Testing:

Full setup process has been tested all the way to running services on Hetzner with the following distros:

- Debian 11
- Debian 12
- Ubuntu 22.04
- Ubuntu 24.04
- Fedora 41
- Fedora 42
- CentOS Stream 9
- CentOS Stream 10

**Note:**

- Assuming support for the above distros and versions, and nothing else at this time.
- Earlier testing was completed on DigitalOcean VPSs and I didn't find any differences with results on Hetzner, but it hasn't been tried again since substantial updates, nor has it been tried on other popular providers (e.g. Linode, et al)

---

# High level narrative introduction of the options available for setting up Wikibase Suite Deploy (DRAFT)

*Possibly a script for a short Wikibase Suite Deploy intro video?*

Wikibase Suite Deploy is the easiest way to get a full Wikibase environment up and running — all the moving parts integrated, configured, and ready to use.

There are two main ways to install it: the manual method, and the setup helper. Both get you to the same place: a fully working Wikibase Suite instance. The manual method is documented in the `deploy` directory’s README and walks you through each step yourself. The setup helper, found in the `deploy/setup` directory, does all of those steps for you — and more.

With the setup helper, you don’t even need to install Git or Docker yourself, or clone the repository. The script will handle that automatically if they aren’t already installed. It also provides:

- Default passwords for all required credentials
- Inline documentation as you enter your configuration
- A web-based interface so you can fill everything in easily
- Live status updates that tell you when your services are starting, when they’re ready, and if anything goes wrong

Once you’ve entered your configuration, the setup helper will launch your Wikibase Suite for the first time, let you know when it’s available, and tell you if there are any issues to fix.

The manual method works equally well — it’s just more hands-on and easier to make mistakes. It can also be useful for debugging if the setup helper isn’t working for some reason. But for most users, the setup helper is the recommended path.

At this stage, if something fails during installation — whether you’ve used the manual method or the setup helper — the safest way to recover is to delete your VPS instance, create a fresh one, and start again. That avoids tricky issues with partially completed installs or SSL certificate conflicts.

You can also run Wikibase Suite Deploy locally. This is only partially supported because it requires HTTPS for all services, and generating a valid SSL certificate for `localhost` isn’t straightforward. Locally, you’ll see a browser warning that the certificate is invalid — you can override this, and in most cases your browser won’t ask again. But QuickStatements won’t work locally at this time because it can’t authenticate without a valid certificate.

So:

- Use the setup helper for the easiest experience
- Use the manual method if you need fine-grained control or are troubleshooting

These instructions are all about getting to your first running instance. For day-to-day operations — things like backing up or resetting your data, starting and stopping services, or debugging in production — you’ll find more details in the main `deploy` README.

One last note: the configuration you enter during setup is for initial deployment only. It’s written to the `.env` file in the deploy directory. Changing these values after the fact won’t reconfigure your running instance — in some cases it will do nothing, in others it may cause unpredictable results.

If you get stuck, the Wikibase Suite team is here to help — reach out, and we’ll work with you to get your instance up and running.

---

- Adds a Deploy Setup script which is started with a one-liner curl command on a new VPS and complete configuration through a Web page or prompts on the command line

## Related Feature Stories

### Implemented

- User can easily setup WBS Deploy on a VPS provider of their choice
- User can configure the initial WBS Deploy setup through a easy to use web based UI with inline documentation
- User is clearly notified when WBS Deploy is done being configured and up and running
- User can trust the access information (passwords) for the WBS services are stored in a secure way (not in plain text in a .env file)
- User can create a WBS Deploy instance without having to register domain names
- User can configure the initial WBS Deploy setup through a easy to use text based CLI with inline documentation

### Won't be implemented

- User can setup WBS Deploy to run on localhost without external access and all services work as expected without warnings or errors
- User can easily and reliably use all WBS Deploy services in a localhost configuration
- User has a clear indication when a service doesn't boot or is left in an unhealthy status, and is provided instructions for debugging / how to proceed
- User can press a "Reset" button to stop all services, DESTROY ALL CURRENT DATA, change/re-apply configuration, and re-start services. 
  - docker compose down --volumes`
  - rm -rf config
  - git checkout config
- User can monitor docker compose service status in a WBS provided dashboard
- User can start/stop/reset docker compose service in a WBS provided dashboard
