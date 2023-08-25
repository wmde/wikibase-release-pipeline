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
            print(file)
            return True
        except PermissionError:
            os.remove(temp_file_path)
        finally:
            os.removedirs(temp_file_dir)
    return False

if __name__ == "__main__":
    extensions = ["js", "jsx", "ts", "tsx", "sh", "json", "py"]

    root_dir = os.path.join(os.getcwd(), "..", "..", "..")

    file_list_stream = os.popen("git diff --staged --name-only")
    for file in file_list_stream.read().split():
        _, ext = os.path.splitext(file)
        if ext.replace(".", "") in extensions:
            if add_newline(file, root_dir):
                os.system(f"git add {os.path.join(root_dir, file)}")
