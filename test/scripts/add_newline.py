import os


EXTENSIONS = ["js", "jsx", "ts", "tsx", "sh", "json", "py"]
EXCLUSIONS = ["node_modules"]


def is_excluded(path: str) -> bool:
    for exclusion in EXCLUSIONS:
        if exclusion in path:
            return True
    return False


def add_newline(file: str, root_dir: str) -> bool:
    file_path = os.path.join(root_dir, file)

    with open(file_path, mode='r+') as current_file:
        current_file.seek(0, os.SEEK_END)
        current_file.seek(current_file.tell()-1, os.SEEK_SET)

        contents = current_file.read(1)
        if not contents.endswith("\n"):
            current_file.write("\n")
            return True
    return False


if __name__ == "__main__":
    for root, _, files in os.walk("/tmp"):
        if not is_excluded(root):
            for file in files:
                _, ext = os.path.splitext(file)
                if ext.replace(".", "") in EXTENSIONS:
                    add_newline(file, root)
