
# FAQ

## Can I host WBS Deploy locally?

Yes, Wikibase Suite can be hosted locally for testing purposes by using the example domain names `*.example.com` from `template.env` in your `.env` file. Configure those domains in `/etc/hosts` to make them resolve to `127.0.0.1`.

However, due to OAuth requirements, QuickStatements may not function properly without publicly accessible domain names for both the `WIKIBASE_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST`. Also, running locally without publicly accessible addresses will prevent the generation of a valid SSL certificate; to accessing locally running services, you will need to allow the invalid certificate when loading the page for the first time.

## Can I migrate from another Wikibase installation to WBS Deploy?

It is possible to migrate an existing Wikibase installation to WBS Deploy. The general procedure is as follows:

 - [Back up your MediaWiki](https://www.mediawiki.org/wiki/Manual:Backing_up_a_wiki)
 - [Install Wikibase Suite](./02_quickstart.md#initial-setup) as described above
 - Re-apply any changes to `config/LocalSettings.php`
 - Import your database dump
 - Regenerate the WDQS database
 - Regenerate the Elasticsearch database

## My WDQS Updater keeps crashing, what can I do?

Check out the known issue in the [WDQS README](/wdqs#Known-issues). You may find your solution there in the form of a workaround.

## Do you recommend any VPS hosting providers?

As of this writing, we can offer no specific recommendations for VPS providers to host Wikibase Suite. The suite has been tested successfully on various providers; as long as the [minimum technical requirements](./02_quickstart.md#hardware) are met, it should run as expected.

## Where can I get further help?

If you have questions not listed above or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.