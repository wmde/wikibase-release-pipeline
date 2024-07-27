import os, json, re, requests
from bs4 import BeautifulSoup

def get_commit(variable: str, url: str, parse_commit: callable, previous_commit: str):
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

gerrit_pattern = re.compile(
    r"# (https://gerrit.*)[ \t\r\n]*([A-Z_]+_COMMIT)=([0-9a-f]+)"
)

def parse_gerrit_commit(response: requests.Response) -> str:
    """Parse webpage using BeautifulSoup"""
    soup = BeautifulSoup(response.content, "lxml")
    return soup.find("th", string="commit").next_sibling.text

github_pattern = re.compile(
    r"# (https://github\.com/(.*/commits.*))[ \t\r\n]*([A-Z_]+_COMMIT)=([0-9a-f]+)"
)

def parse_github_commit(response: requests.Response) -> str:
    """Fetch from API"""
    data = json.loads(response.content)
    return data["sha"]

bitbucket_pattern = re.compile(
    r"# (https://bitbucket\.org/(.*/commits)/branch/master)[ \t\r\n]*([A-Z_]+_COMMIT)=([0-9a-f]+)"
)

def parse_bitbucket_commit(response: requests.Response) -> str:
    """Fetch from API"""
    data = json.loads(response.content)
    return data["values"][0]["hash"]

def run(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist.")
        return

    print(f"Processing {file_path}")

    with open(file_path, "r") as variable_file:
        variable_contents = variable_file.read()

    mediawiki_match = re.search(r"MEDIAWIKI_VERSION=(\d+)\.(\d+)", variable_contents)
    if mediawiki_match:
        rel = f"REL{mediawiki_match.group(1)}_{mediawiki_match.group(2)}"
        print(
            f"Mediawiki Version:\t{mediawiki_match.group(1)}.{mediawiki_match.group(2)}"
        )
        variable_contents = re.sub(r"\bREL\d+_\d+", rel, variable_contents)

    for gerrit_commit in re.findall(gerrit_pattern, variable_contents):
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

    for github_commit in re.findall(github_pattern, variable_contents):
        if commit := get_commit(
            github_commit[2],
            f"https://api.github.com/repos/{github_commit[1]}",
            parse_github_commit,
            github_commit[3],
        ):
            variable_contents = re.sub(
                f"{github_commit[2]}=[0-9a-f]+",
                f"{github_commit[2]}={commit}",
                variable_contents,
            )

    for bitbucket_commit in re.findall(bitbucket_pattern, variable_contents):
        if commit := get_commit(
            bitbucket_commit[2],
            f"https://bitbucket.org/!api/2.0/repositories/{bitbucket_commit[1]}",
            parse_bitbucket_commit,
            bitbucket_commit[3],
        ):
            variable_contents = re.sub(
                f"{bitbucket_commit[2]}=[0-9a-f]+",
                f"{bitbucket_commit[2]}={commit}",
                variable_contents,
            )

    with open(file_path, "w") as variable_file:
        variable_file.write(variable_contents)

if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python script_name.py <path_to_env_file>")
    else:
        run(sys.argv[1])
