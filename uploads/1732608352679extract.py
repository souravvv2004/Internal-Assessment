import requests
import json
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_subjects(roll_no):
    data = {
        'rollno': roll_no,
        'papersearch': 'Search'
    }
    url = 'https://sgtbkhalsa.online/q_papers.php'
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            return (roll_no, response.text) 
        else:
            print(f"Failed to retrieve the page for roll number {roll_no}. Status code: {response.status_code}")
            return (roll_no, None)
    except requests.RequestException as e:
        print(f"Request error for roll number {roll_no}: {e}")
        return (roll_no, None)

def save_results(results, filename='subjects.json'):
    with open(filename, 'w') as f:
        json.dump(results, f, indent=4)

def main():
    results = {}
    error_occurred = False
    try:
        # Read roll numbers from Excel file
        excel_file_path = '/home/sourabh/Documents/temp.xlsx'  # Update with the correct path to your Excel file
        df = pd.read_excel(excel_file_path)
        
        # Assuming the roll numbers are in the first column
        rollcall = df.iloc[:, 0].tolist()
        
        num_threads = 10
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            future_to_rollno = {executor.submit(get_subjects, roll_no): roll_no for roll_no in rollcall}
            for future in as_completed(future_to_rollno):
                roll_no, result = future.result()
                if result:
                    results[roll_no] = result
                    print(roll_no)
                else:
                    results[roll_no] = 'Error'
        save_results(results)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        error_occurred = True
    if error_occurred:
        save_results(results)

if __name__ == "__main__":
    main()

