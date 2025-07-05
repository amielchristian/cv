
import http.client
import os

file_path = os.path.join(os.path.dirname(__file__), 'Mala-ay_CV.tex')
with open(file_path, 'r', encoding='utf-8') as f:
    file_content = f.read()

conn = http.client.HTTPSConnection("texlive.net")
headers = {'Content-type': 'text/plain'}
conn.request("POST", "/compile", file_content.encode('utf-8'), headers)

response = conn.getresponse()
if response.status == 200 and response.getheader('Content-Type') == 'application/pdf':
    with open('output.pdf', 'wb') as f:
        f.write(response.read())
    print("PDF compiled and saved as output.pdf")
else:
    print(f"Error: Received status code {response.status}")
    print("Response body:", response.read().decode('utf-8'))

conn.close()
