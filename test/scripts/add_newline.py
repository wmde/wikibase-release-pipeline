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


def file_should_be_run(file: str) -> bool:
    for extension in FILE_PATTERNS:
        if re.match(extension, file):
            return True
    return False


def add_newline(file: str, root_dir: str, should_fix: bool) -> bool:
    file_path = os.path.join(root_dir, file)

    with open(file_path, mode="r+") as current_file:
        current_file.seek(0, os.SEEK_END)
        current_file.seek(current_file.tell() - 1, os.SEEK_SET)

        contents = current_file.read(1)
        if not contents == "\n":
            if should_fix:
                current_file.write("\n")
            else:
                print(f"{file} lacks ending newline")
                sys.exit(2)
            return True
    return False


if __name__ == "__main__":
    root = sys.argv[1]
    fix = False
    if len(sys.argv) > 3:
        if sys.argv[3] == '--fix':
            fix = True
    for file in sys.argv[2].split("\n"):
        if file_should_be_run(file):
            add_newline(file, root, fix)
