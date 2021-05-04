# Just a MwVersion object for now

import re
import time


class MwVersion(object):
    """Abstract out a MediaWiki version"""

    def __init__(self, version):
        decomposed = self.decompose(version)

        self.raw = version
        self.major = decomposed.get('major', None)
        self.branch = decomposed.get('branch', None)
        self.tag = decomposed.get('tag', None)
        self.prev_version = decomposed.get('prev_version', None)
        self.prev_tag = decomposed.get('prevTag', None)

        # alpha / beta / rc ..
        self.phase = decomposed.get('phase', None)
        self.cycle = decomposed.get('cycle', None)

    @classmethod
    def new_snapshot(cls, branch='master'):
        """Create a new MwVersion for a snapshot"""
        return cls('snapshot-{}-{}'.format(
            branch, time.strftime('%Y%m%d', time.gmtime())))

    def __repr__(self):
        if self.raw is None:
            return "<MwVersion Null (snapshot?)>"

        return """
<MwVersion %s major: %s (prev: %s), tag: %s (prev: %s), branch: %s>
        """ % (
            self.raw,
            self.major, self.prev_version,
            self.tag, self.prev_tag,
            self.branch
        )

    def decompose(self, version):
        """Split a version number to branch / major

        Whenever a version is recognized, a dict is returned with keys:
            - major (ie 1.22)
            - minor
            - branch
            - tag
            - prev_version
            - prevTag

        When one or more letters are found after the minor version we consider
        it a software development phase (ex: alpha, beta, rc) with incremental
        cycles. Hence we will expose:
            - phase
            - cycle

        Default: {}
        """

        ret = {}
        if version is None:
            raise ValueError('Invalid version')
        if version.startswith('snapshot-'):
            snapshot_branch = version.split('-')[1]
            if snapshot_branch.startswith('REL1_'):
                snapshot_major = '1.{}'.format(
                    snapshot_branch.split('_')[1]
                )
            else:
                snapshot_major = 'snapshot'
            return {
                'branch': snapshot_branch,
                'major': snapshot_major,
                'tag': snapshot_branch,
            }

        matches = re.compile(r"""
            (?P<major>(?P<major1>\d+)\.(?P<major2>\d+))
            \.
            (?P<minor>\d+)
            (?:-?
                (?P<phase>[A-Za-z]+)?\.?
                (?P<cycle>\d+)
            )?
        """, re.X).match(version)

        if matches is None:
            raise ValueError('%s is in the wrong format' % version)

        # Clear out unneed phase/cycle
        ret = dict((k, v) for k, v in matches.groupdict().items()
                   if v is not None)

        ret['branch'] = 'REL%s_%s' % (
            ret['major1'],
            ret['major2'],
        )
        del ret['major1']
        del ret['major2']

        try:
            if 'phase' in ret:
                ret['tag'] = 'tags/%s.%s-%s.%s' % (
                    ret['major'],
                    ret['minor'],
                    ret.get('phase', ''),
                    ret.get('cycle', '')
                )
            else:
                ret['tag'] = 'tags/%s.%s' % (
                    ret['major'],
                    ret['minor'],
                )
        except KeyError:
            ret['tag'] = 'tags/%s.%s' % (
                ret['major'],
                ret['minor']
            )

        last = matches.group(matches.lastindex)
        if last != '' and int(last) == 0:
            ret['prev_version'] = None
            ret['prevTag'] = None
            return ret

        bits = [d for d in matches.groups('')]
        last = matches.lastindex - 3
        del bits[1]
        del bits[1]

        bits[last] = str(int(bits[last]) - 1)

        if 'phase' in ret:
            ret['prev_version'] = '%s.%s-%s.%s' % tuple(bits)
        else:
            ret['prev_version'] = '%s.%s' % (bits[0], bits[1])

        ret['prevTag'] = 'tags/' + ret['prev_version']

        return ret
