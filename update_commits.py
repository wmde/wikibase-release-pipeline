import re, requests, json
from bs4 import BeautifulSoup


def return_commit(commit: str, previous_commit: str) -> str | bool:
    """Return commit if changed, otherwise False"""
    if previous_commit != commit:
        print(f"\tOld Commit:\t{previous_commit}")
        print(f"\tNew Commit:\t{commit}")
        return commit
    else:
        print(f"\tCommit:\t{commit}")
        return False


mediawiki_gerrit_pattern = re.compile(
    r"# (https://gerrit.*/heads/)REL\d+_\d+[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)
not_mediawiki_gerrit_pattern = re.compile(
    r"# (https://gerrit.*/heads/master)[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)


def get_gerrit_commit(variable: str, url: str, previous_commit: str) -> str | bool:
    """Parse webpage using BeautifulSoup"""
    print(f"Variable:\t{variable}")
    print(f"\tURL:\t{url}")
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "lxml")
        commit = soup.find("th", text="commit").next_sibling.text
        return return_commit(commit, previous_commit)
    except Exception as exc:
        print(f"\tError:\t{exc}")
        return False


github_pattern = re.compile(
    r"# (https://github\.com/(.*/commits.*))[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)


def get_github_commit(variable: str, url: str, previous_commit: str) -> str | bool:
    """Fetch from API"""
    print(f"Variable:\t{variable}")
    print(f"\tURL:\t{url}")
    try:
        response = requests.get(url)
        data = json.loads(response.content)
        return return_commit(data["sha"], previous_commit)
    except Exception as exc:
        print(f"\tError:\t{exc}")
        return False


bitbucket_pattern = re.compile(
    r"# (https://bitbucket\.org/(.*/commits)/branch/master)[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)


def get_bitbucket_commit(variable: str, url: str, previous_commit: str) -> str | bool:
    """Fetch from API"""
    print(f"Variable:\t{variable}")
    print(f"\tURL:\t{url}")
    try:
        response = requests.get(url)
        data = json.loads(response.content)
        return return_commit(data["values"][0]["hash"], previous_commit)
    except Exception as exc:
        print(f"\tError:\t{exc}")
        return False


def run():
    with open("variables.env", "r") as variable_file:
        variable_contents = variable_file.read()

    mediawiki_match = re.search(r"MEDIAWIKI_VERSION=(\d+)\.(\d+)", variable_contents)
    rel = f"REL{mediawiki_match.group(1)}_{mediawiki_match.group(2)}"

    mediawiki_gerrit_commits = re.findall(mediawiki_gerrit_pattern, variable_contents)
    non_mediawiki_gerrit_commits = re.findall(
        not_mediawiki_gerrit_pattern, variable_contents
    )

    for gerrit_commit in mediawiki_gerrit_commits:
        if commit := get_gerrit_commit(
            gerrit_commit[1], gerrit_commit[0] + rel, gerrit_commit[2]
        ):
            variable_contents = re.sub(
                f"{gerrit_commit[1]}=[0-9a-f]+",
                f"{gerrit_commit[1]}={commit}",
                variable_contents,
            )
    for gerrit_commit in non_mediawiki_gerrit_commits:
        if commit := get_gerrit_commit(
            gerrit_commit[1], gerrit_commit[0], gerrit_commit[2]
        ):
            variable_contents = re.sub(
                f"{gerrit_commit[1]}=[0-9a-f]+",
                f"{gerrit_commit[1]}={commit}",
                variable_contents,
            )

    github_commits = re.findall(github_pattern, variable_contents)

    for github_commit in github_commits:
        if commit := get_github_commit(
            github_commit[2],
            f"https://api.github.com/repos/{github_commit[1]}",
            github_commit[3],
        ):
            variable_contents = re.sub(
                f"{github_commit[2]}=[0-9a-f]+",
                f"{github_commit[2]}={commit}",
                variable_contents,
            )

    bitbucket_commits = re.findall(bitbucket_pattern, variable_contents)

    for bitbucket_commit in bitbucket_commits:
        if commit := get_bitbucket_commit(
            bitbucket_commit[2],
            f"https://bitbucket.org/!api/2.0/repositories/{bitbucket_commit[1]}",
            bitbucket_commit[3],
        ):
            variable_contents = re.sub(
                f"{bitbucket_commit[2]}=[0-9a-f]+",
                f"{bitbucket_commit[2]}={commit}",
                variable_contents,
            )

    with open("variables.env", "w") as variable_file:
        variable_file.write(variable_contents)


if __name__ == "__main__":
    run()
