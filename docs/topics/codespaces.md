# Codespaces

It can be quite pleasent working with this repository in Github Codespaces.
This avoids the need for CPU and network toil while debugging things.

Note: Github provides every user with some number of free codespaces minuites per month.

GOTCHA: There seems to be some issues with actually building the images in codespaces, so you'll only find documentation to test Github artifacts...

You can easily create a codespace for this repository using the Github CLI tool.

```sh
$ gh codespace
X Sorry, your reply was invalid: Value is required
? Repository: wmde/wikibase-release-pipeline
? Branch (leave blank for default branch): addshore-wmde11
? Choose Machine Type: 4 cores, 8 GB RAM, 32 GB storage
addshore-probable-rotary-phone-jq5p99454qhrr7
```

You can then connect directly using the VSCode plugin that allows you to view your code spaces or by typing `gh codespace code`.

Once connected you can download artifacts of a certain Github actions pipeline run.

```sh
WORKFLOW_RUN_NUMBER=4117737654 make download
```

You then need to move them into the correct location

```sh
sudo chown -R codespace:root ./artifacts
cp artifacts/3943709618/BuildArtifacts/* artifacts/
```

And then run the failing tests that you want to debug.

Be sure to select the correct suite, and filter by test file to speed things up.

```sh
make test SUITE=repo_client FILTER=repo_client/item.js
```

Once the test has run, you can immediately view logs and artifacts rather than needing to download them from Github.

The test sites also stay running once the tests are done or you cancel the tests.
With the built in port forwarding you can access these sites.
This allows for easy hands on debugging of the sites exactly as configured during testing.
You can also `docker exec` into the container to poke around if needed.

```sh
docker exec -it test_wikibase_1 bash
```