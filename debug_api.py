import json
import sys

data = json.load(sys.stdin)
print("Raw KPI data:")
for k in data["data"]["kpis"]:
    if "is_separate_card" not in k:
        print(f"Name: {k['name']}, Target: {k['target']}, Result: {k['result']}, Formatted Result: {k.get('formatted_result', 'N/A')}")
