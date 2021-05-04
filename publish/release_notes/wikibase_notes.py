#!/usr/bin/env python3
"""
make-deploy-notes.py
====================

Create a wiki-formatted changelog using gitiles and the make-wmf-branch
config.json.
"""
from makedeploynotes import *

def main_wikibase():
    """
    Entry point
    """
    args = parse_args()
    old = args.oldbranch
    new = args.newbranch

    extensions = get_bundle('wikibase')

    for extension in extensions:
        extension_name = os.path.basename(extension)

        print('=== {} ==='.format(extension_name))
        print_formatted_changes(old, new, extension, display_name=extension_name)

    print("== Total Changes ==\n"
          "'''{}''' Changes "
          "in '''{}''' repos "
          "by '''{}''' authors".format(
              TOTALS['changes'],
              TOTALS['repos'],
              len(TOTALS['unique_authors'])))


if __name__ == '__main__':
    main_wikibase()
