#!/usr/bin/env python3
import os
import re

def update_imports(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()

                    # Replace import from 'next/link'
                    updated_content = content.replace("from 'next/link'", "from 'next-view-transitions'")
                    updated_content = updated_content.replace('from "next/link"', 'from "next-view-transitions"')

                    if content != updated_content:
                        with open(filepath, 'w') as f:
                            f.write(updated_content)
                        print(f"Updated: {filepath}")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    update_imports("src")
    print("Done updating imports!")