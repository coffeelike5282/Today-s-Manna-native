import os

# Define paths
input_path = os.path.join("data", "mannaData.ts")
output_path = "full_content_data.js"

try:
    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Simple transformation:
    # 1. Remove "export " kwd if present (it is)
    # 2. Remove ": any[]" type annotation
    
    # We expect the file to start with: export const MANNA_DATA: any[] = [
    # We want: const MANNA_DATA = [
    
    new_content = content.replace("export const MANNA_DATA: any[] =", "const MANNA_DATA =")
    
    # If there are any imports or other TS syntax at the top, we might need to be more careful.
    # But based on inspection, it starts directly with the data.
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Successfully created {output_path}")

except Exception as e:
    print(f"Error: {e}")
