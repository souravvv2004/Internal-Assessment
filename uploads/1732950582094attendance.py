import pandas as pd
from bs4 import BeautifulSoup
import requests
import time

# Function to scrape candidate details and attendance data


def scrape_attendance(roll_no):

	#For Dynamic Url 
	url = "https://sgtbkhalsa.online/q_attCompiled.php"
	data = {"rollno": roll_no}

	# Make the POST request
	response = requests.post(url, data=data)

	# Parse the HTML
	soup = BeautifulSoup(response.text, 'html.parser')

	# Find the form tag
	form = soup.find('center')

	# Check if the form is found
	if form is None:
		print(f"Failed to find the form in the HTML for roll number {roll_no}.")
		return None, None
		


	# Find the candidate details
	CandidateDetails = form.find('h1')
	# CandidateRollNo = form.find('font').text.strip()
	CandidateName = []

	# Extract text between <br> tags within <h1> tag
	if CandidateDetails:
		for br_tag in CandidateDetails.find_all('br'):
			next_sibling = br_tag.next_sibling
			if next_sibling and next_sibling.name == 'br':
				continue
			CandidateName.append(next_sibling.strip())

		CandidateName = CandidateName[0]

	# Find the table within the form

	table = form.find('table')

	# Check if the table is found within the form
	if table is None:
		print(f"Failed to find the table within the form for roll number {roll_no}.")
		return None, None

	# Find all rows in the table
	rows = table.find_all('tr')
	#print(rows)

	# Extract headers
	headers = [header.text.strip() for header in rows[0].find_all('th')]

	# Verify headers and find indices of "Attended" and "Delivered"
	try:
		attended_index = headers.index("Attended")
		delivered_index = headers.index("Delivered") + 1
	except ValueError as e:
		print(f"Error finding header: {e}")
		return None, None

	# Extract values for "Attended" and "Delivered"
	attended_values = []
	delivered_values = []
	for row in rows[1:]:
		cols = row.find_all('td')
		attended_values.append(int(cols[attended_index].text.strip()))
		delivered_values.append(int(cols[delivered_index].text.strip()))

	# Calculate attendance percentage
	AttendedSum = sum(attended_values)
	DeliveredSum = sum(delivered_values)
	attendance_percentage = (AttendedSum / DeliveredSum) * 100

	return CandidateName, attendance_percentage

# Load Excel file
'''
start_time=time.time();
excel_file = '/home/sourabh/Downloads/14.xlsx'
df = pd.read_excel(excel_file)

# Iterate through each row and scrape attendance data
for index, row in df.iterrows():
    roll_no = row.iloc[0]  # Assuming roll number is in the 1st column (index 0)
    

    # Scrape candidate details and attendance data
    candidate_name, attendance_percentage = scrape_attendance(roll_no)
    time.sleep(0.5)
    if candidate_name is not None:
        # Write name and percentage to 2nd and 3rd columns (index 1 and 2)
        df.iloc[index, 1] = str(candidate_name)  # Explicitly cast to string
        df.iloc[index, 2] = attendance_percentage
    else:
        print(f"Unable to scrape data for roll number {roll_no}")
df.to_excel(excel_file, index=False)
end_time=time.time();
elapsed_time=end_time-start_time
# Write back to Excel file
df.to_excel(excel_file, index=False)
print("Attendance data including names and percentages has been updated in", excel_file)
elapsed_time = end_time - start_time

print(f"Elapsed time: {elapsed_time} seconds")
'''

print(scrape_attendance(i))

