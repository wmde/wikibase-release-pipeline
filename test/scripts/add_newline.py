import os


EXTENSIONS = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "sh",
    "json",
    "py",
    "yml",
    "env",
    "lua",
    "sql",
    "sx",
    "php",
    "xml",
    "md",
    "template",
]
EXCLUSIONS = ["node_modules", ".git", "git_cache", "cache", "artifacts"]


def is_excluded(path: str) -> bool:
    for exclusion in EXCLUSIONS:
        if exclusion in path:
            return True
    return False


def file_should_be_run(file: str) -> bool:
    if file == "Dockerfile":
        return True

    _, ext = os.path.splitext(file)
    if ext.replace(".", "") in EXTENSIONS:
        return True
    return False


def add_newline(file: str, root_dir: str) -> bool:
    file_path = os.path.join(root_dir, file)

    with open(file_path, mode="r+") as current_file:
        current_file.seek(0, os.SEEK_END)
        current_file.seek(current_file.tell() - 1, os.SEEK_SET)

        contents = current_file.read(1)
        if not contents.endswith("\n"):
            current_file.write("\n")
            return True
    return False


if __name__ == "__main__":
    for root, _, files in os.walk("/tmp"):
        if not is_excluded(root):
            for file in files:
                if file_should_be_run(file):
                    add_newline(file, root)
