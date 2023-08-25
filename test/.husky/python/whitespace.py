import glob
import os

root_dir = os.path.join(os.getcwd(), "..", "..")

print(root_dir)


def add_newline(file: str, root_dir: str):
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
        except PermissionError:
            os.remove(temp_file_path)
        finally:
            os.removedirs(temp_file_dir)


extensions = ["js", "jsx", "ts", "tsx", "sh", "json"]


for ext in extensions:
    for file in  glob.glob(f"**/*.{ext}", root_dir=root_dir, recursive=True) :
        if "node_modules" not in file:
            add_newline(file, root_dir)
