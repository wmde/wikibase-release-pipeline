import re
import glob
import os

trailing_whitespace = re.compile(r"([ \t\r]+)(\n)")
root_dir = os.path.join(os.getcwd(), "..", "..")

for file in glob.glob("**/*.js", root_dir= root_dir, recursive=True):
    if "node_modules" not in file:
        file_path = os.path.join(root_dir, file)
        temp_file_path = os.path.join(root_dir, "temp", file)
        temp_file_dir = os.path.dirname(temp_file_path)

        replacing = False
        with open(file_path, mode='r+') as current_file:
            contents = current_file.read()
            while found := re.search(trailing_whitespace, contents):
                contents = re.sub(trailing_whitespace, r"\2", contents)
                replacing = True
            if not contents.endswith('\n'):
                contents += "\n"
                replacing = True
            if replacing:
                os.makedirs(temp_file_dir)
                with open(temp_file_path, mode='w+') as new_file:
                    new_file.write(contents)
        if replacing:
            os.remove(file_path)
            os.rename(temp_file_path, file_path)
            os.removedirs(temp_file_dir)
