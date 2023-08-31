import os


def add_newline(file: str, root_dir: str) -> bool:
    file_path = os.path.join(root_dir, file)
    temp_file_path = os.path.join(root_dir, "temp", file)
    temp_file_dir = os.path.dirname(temp_file_path)

    replacing = False
    with open(file_path, mode='r') as current_file:
        contents = current_file.read()
        if not contents.endswith('\n'):
            contents += "\n"
            replacing = True
        if replacing:
            os.makedirs(temp_file_dir)
            with open(temp_file_path, mode='w+') as new_file:
                new_file.write(contents)
    if replacing:
        try:
            os.remove(file_path)
            os.rename(temp_file_path, file_path)
            os.removedirs(temp_file_dir)
            print(f"Added newline to {file}")
            return True
        except PermissionError:
            os.remove(temp_file_path)
            os.removedirs(temp_file_dir)
    return False


if __name__ == "__main__":
    extensions = ["js", "jsx", "ts", "tsx", "sh", "json", "py"]

    for root, _, files in os.walk(os.getcwd()):
        if "node_modules" not in root:
            for file in files:
                _, ext = os.path.splitext(file)
                if ext.replace(".", "") in extensions:
                    add_newline(file, root)