import os
import re

pages_dir = r"d:\smart student portal\frontend\src\pages"

# Skip files we've already manually edited
skip_files = ["Profile.jsx", "Marks.jsx"]

replacements = [
    (r"\bblue-", "purple-"),
    
    # Backgrounds
    (r'\bbg-white\b(?!\s*dark:bg-)', 'bg-white dark:bg-gray-800'),
    (r'\bbg-gray-50\b(?!\s*dark:bg-)', 'bg-gray-50 dark:bg-gray-900'),
    (r'\bbg-gray-100\b(?!\s*dark:bg-)', 'bg-gray-100 dark:bg-gray-800'),
    
    # Text colors
    (r'\btext-gray-900\b(?!\s*dark:text-)', 'text-gray-900 dark:text-white'),
    (r'\btext-gray-800\b(?!\s*dark:text-)', 'text-gray-800 dark:text-white'),
    (r'\btext-gray-700\b(?!\s*dark:text-)', 'text-gray-700 dark:text-gray-300'),
    (r'\btext-gray-600\b(?!\s*dark:text-)', 'text-gray-600 dark:text-gray-400'),
    (r'\btext-gray-500\b(?!\s*dark:text-)', 'text-gray-500 dark:text-gray-400'),
    
    # Borders
    (r'\bborder-gray-100\b(?!\s*dark:border-)', 'border-gray-100 dark:border-gray-700'),
    (r'\bborder-gray-200\b(?!\s*dark:border-)', 'border-gray-200 dark:border-gray-700'),
    (r'\bborder-gray-300\b(?!\s*dark:border-)', 'border-gray-300 dark:border-gray-600'),
]

for filename in os.listdir(pages_dir):
    if filename.endswith(".jsx") and filename not in skip_files:
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        new_content = content
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, new_content)
            
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"No changes for {filename}")

print("Theme update complete.")
