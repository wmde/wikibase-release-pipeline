## REMAINING TODOs:

- [ ] Test/fix updated Docker install script on Debian, Fedora, and CentOS
- [ ] Double check Password validations to make sure they follow more tightly MediaWiki + MariaDB requirements,
      consider incorporating the common words dictionary lookup here.
- [ ] "Generate" link for passwords or keep auto generated if ignored?
- [ ] Review Web Setup UI inline docs and refine or add/enhance to finalize
- [ ] Documentation diligence, refinement, and alignment from deploy/README.md through to deploy/setup/README.md (et al)

- [ ] Review CLI options for setup.sh and make sure they are coherent and not too overlapping (--dev in particular)
- [ ] Look into and better define intention and next steps for --local / LOCALHOST CLI flag
- [ ] Keep or remove password removal feature? Add it to the de-prioritized CLI version?
- [ ] Very brief pass on Beta CLI Setup feature to make sure it is not fundamentally broken after recent updates
- [X] Refine content for creating DNS entry for server (Make SERVER_IP visible, etc)
- [X] Add validation that the entered DNS entry actually points to the expected SERVER_IP

---

# Wikibase Suite Deploy – Setup Script

This script bootstraps a Wikibase Suite Deploy installation by:

1. **Check for Git** – Installs Git if it is not already available on the system.  
2. **Clone the repository** – Downloads the Wikibase Suite Deploy code from the official repository.  
3. **Check for Docker** – Installs Docker if it is not already available on the system.  
4. **Prompt for configuration** – Collects all required setup values interactively through a web interface (use `--cli` for terminal-based config).  
5. **Launch deployment** – Starts the deployment process once configuration is complete and notifies you once your new Suite instance is available.

## Setup on a new VPS instance

Run the following on a **freshly created VPS instance** (with supported specs):

Replace `[OPTIONS]` with any of the CLI options described below.

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/wmde/wikibase-release-pipeline/refs/heads/deploy-setup-script/deploy/setup/setup.sh) -- [OPTIONS]"
```

## Setup using a manually cloned copy of wikibase-release-pipeline

You can run the setup script directly if you have cloned the repository, or run it remotely using `curl`. From the root of the repo, run:

```bash
cd deploy/setup
./setup.sh
```

## CLI Options

| Option           | Description |
|------------------|-------------|
| `--debug`        | Enable verbose/debug logging for troubleshooting. |
| `--skip-clone`   | Skip cloning the repository (use an existing checkout). |
| `--skip-deps`    | Skip dependency installation (assumes Git & Docker are already installed). |
| `--skip-launch`  | Do not launch services after configuration completes. |

### Dev-only or in beta

| Option           | Description |
|------------------|-------------|
| `--dev`          | Development mode: skips clone, dependency installs, and launch; uses a relative repo path for local development. |
| `--local`        | Mark this run as local (affects background/interactive behavior).|
| `--cli`          | Use a CLI (terminal) flow for configuration instead of the web UI. |

---

# High level narrative introduction of the 2 options for setting up Wikibase Suite Deploy (DRAFT)

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
