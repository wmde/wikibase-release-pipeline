import os, re, sys


FILE_PATTERNS = [
    ".+\.js",
    ".+\.jsx",
    ".+\.ts",
    ".+\.tsx",
    ".+\.sh",
    ".+\.json",
    ".+\.py",
    ".+\.yml",
    ".+\.env",
    ".+\.lua",
    ".+\.sql",
    ".+\.sx",
    ".+\.php",
    ".+\.xml",
    ".+\.md",
    ".+\.template",
    "Dockerfile",
]
EXCLUDE_DIRS = ["node_modules", ".git", "git_cache", "cache", "artifacts"]


def is_excluded(path: str) -> bool:
    for exclusion in EXCLUDE_DIRS:
        if exclusion in os.path.normpath(path).split(os.sep):
            return True
    return False


def file_should_be_run(file: str) -> bool:
    for extension in FILE_PATTERNS:
        if re.match(extension, file):
            return True
    return False


def add_newline(file: str, root_dir: str) -> bool:
    file_path = os.path.join(root_dir, file)

    with open(file_path, mode="r+") as current_file:
        current_file.seek(0, os.SEEK_END)
        current_file.seek(current_file.tell() - 1, os.SEEK_SET)

        contents = current_file.read(1)
        if not contents == "\n":
            current_file.write("\n")
            return True
    return False


if __name__ == "__main__":
    for root, _, files in os.walk(sys.argv[1]):
        if not is_excluded(root):
            for file in files:
                if file_should_be_run(file):
                    add_newline(file, root)
