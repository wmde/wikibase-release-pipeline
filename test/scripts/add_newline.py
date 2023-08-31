import os


def add_newline(file: str, root_dir: str) -> bool:
    file_path = os.path.join(root_dir, file)

    with open(file_path, mode='r+') as current_file:
        contents = current_file.read()
        if not contents.endswith('\n'):
            current_file.write("\n")
            return True
    return False


if __name__ == "__main__":
    extensions = ["js", "jsx", "ts", "tsx", "sh", "json", "py"]

    for root, _, files in os.walk(os.getcwd()):
        if "node_modules" not in root:
            for file in files:
                _, ext = os.path.splitext(file)
                if ext.replace(".", "") in extensions:
                    add_newline(file, root)
