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


def file_exists(file: str, root_dir: str) -> bool:
    file_path = os.path.join(root_dir, file)
    try:
        with open(file_path, mode="r"):
            return True
    except FileNotFoundError:
        print(f"Missing File: {file_path}")
        return False


def add_newline(file: str, root_dir: str, should_fix: bool) -> bool:
    with open(os.path.join(root_dir, file), mode="r+") as current_file:
        current_file.seek(0, os.SEEK_END)
        current_file.seek(current_file.tell() - 1, os.SEEK_SET)

        last_character = current_file.read(1)
        if last_character != "\n":
            if should_fix:
                current_file.write("\n")
            else:
                print(f"{file} lacks ending newline")
                return False
    return True


if __name__ == "__main__":
    root = sys.argv[1]
    should_fix = False
    if len(sys.argv) > 3:
        if sys.argv[3] == "--fix":
            should_fix = True
    found_errors = False
    for file in sys.argv[2].split("\n"):
        if file_should_be_run(file) and file_exists(file, root):
            found_errors |= not add_newline(file, root, should_fix)
    if found_errors:
        sys.exit(2)
