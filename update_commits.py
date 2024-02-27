import re, requests, json
from bs4 import BeautifulSoup


def get_commit(
    variable: str, url: str, parse_commit: callable, previous_commit: str
) -> str | bool:
    print(f"Variable:\t{variable}")
    print(f"\tURL:\t{url}")
    try:
        response = requests.get(url)
        commit = parse_commit(response)
        if previous_commit != commit:
            print(f"\tOld Commit:\t{previous_commit}")
            print(f"\tNew Commit:\t{commit}")
            return commit
        else:
            print(f"\tCommit:\t{commit}")
            return False
    except Exception as exc:
        print(f"\tError:\t{exc}")
        return False


mediawiki_gerrit_pattern = re.compile(
    r"# (https://gerrit.*/heads/REL\d+_\d+)[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)
not_mediawiki_gerrit_pattern = re.compile(
    r"# (https://gerrit.*/heads/master)[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)


def parse_gerrit_commit(response: requests.Response) -> str:
    """Parse webpage using BeautifulSoup"""
    soup = BeautifulSoup(response.content, "lxml")
    return soup.find("th", text="commit").next_sibling.text


github_pattern = re.compile(
    r"# (https://github\.com/(.*/commits.*))[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)


def parse_github_commit(response: requests.Response) -> str:
    """Fetch from API"""
    data = json.loads(response.content)
    return data["sha"]


bitbucket_pattern = re.compile(
    r"# (https://bitbucket\.org/(.*/commits)/branch/master)[ \t\r\n]*([A-Z]+_COMMIT)=([0-9a-f]+)"
)


def parse_bitbucket_commit(response: requests.Response) -> str:
    """Fetch from API"""
    data = json.loads(response.content)
    return data["values"][0]["hash"]


def user_approves() -> bool:
    return "y" in input("Update Commit? Y/n ").lower()


def run():
    with open("variables.env", "r") as variable_file:
        variable_contents = variable_file.read()

    mediawiki_match = re.search(r"MEDIAWIKI_VERSION=(\d+)\.(\d+)", variable_contents)
    rel = f"REL{mediawiki_match.group(1)}_{mediawiki_match.group(2)}"
    print(f"Mediawiki Version:\t{mediawiki_match.group(1)}.{mediawiki_match.group(2)}")
    variable_contents = re.sub(r"\bREL\d+_\d+", rel, variable_contents)

    for gerrit_commit in re.findall(mediawiki_gerrit_pattern, variable_contents):
        if commit := get_commit(
            gerrit_commit[1],
            gerrit_commit[0],
            parse_gerrit_commit,
            gerrit_commit[2],
        ):
            variable_contents = re.sub(
                f"{gerrit_commit[1]}=[0-9a-f]+",
                f"{gerrit_commit[1]}={commit}",
                variable_contents,
            )
    for gerrit_commit in re.findall(not_mediawiki_gerrit_pattern, variable_contents):
        if (
            commit := get_commit(
                gerrit_commit[1],
                gerrit_commit[0],
                parse_gerrit_commit,
                gerrit_commit[2],
            )
        ) and user_approves():
            variable_contents = re.sub(
                f"{gerrit_commit[1]}=[0-9a-f]+",
                f"{gerrit_commit[1]}={commit}",
                variable_contents,
            )

    for github_commit in re.findall(github_pattern, variable_contents):
        if (
            commit := get_commit(
                github_commit[2],
                f"https://api.github.com/repos/{github_commit[1]}",
                parse_github_commit,
                github_commit[3],
            )
        ) and user_approves():
            variable_contents = re.sub(
                f"{github_commit[2]}=[0-9a-f]+",
                f"{github_commit[2]}={commit}",
                variable_contents,
            )

    for bitbucket_commit in re.findall(bitbucket_pattern, variable_contents):
        if (
            commit := get_commit(
                bitbucket_commit[2],
                f"https://bitbucket.org/!api/2.0/repositories/{bitbucket_commit[1]}",
                parse_bitbucket_commit,
                bitbucket_commit[3],
            )
        ) and user_approves():
            variable_contents = re.sub(
                f"{bitbucket_commit[2]}=[0-9a-f]+",
                f"{bitbucket_commit[2]}={commit}",
                variable_contents,
            )

    with open("variables.env", "w") as variable_file:
        variable_file.write(variable_contents)


if __name__ == "__main__":
    run()
