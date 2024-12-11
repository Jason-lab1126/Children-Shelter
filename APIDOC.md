# Children Shelter Program API Documentation
This API manages user interactions and registration processes for the Children Shelter Program.
It allows for data management and client authentication through a variety of endpoints.


## Retrieve Index Page Data
**Request Format:** /index.html

**Request Type:** GET

**Returned Data Format**: HTML

**Description:** Returns data necessary for rendering the main index page, specifically roles for
login and the current mode of the interface (e.g., light or dark).

**Example Request:** GET http://localhost:3000/index.html

**Example Response:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Index Page</title>
  </head>
  <body>
    <h1>Welcome to the Index Page!</h1>
  </body>
</html>

**Error Handling:**
500 Internal Server Error: If there is an issue retrieving page data.


## Retrieve Login data
**Request Format:** /api/login

**Request Type:** POST

**Body Parameters:**
- name: The username of the user attempting to log in.
- password: The password of the user attempting to log in.
- role: The role of the user

**Returned Data Format**: JSON

**Description:** Fetches The login page information like the username, password, and
role (parent/elder).

**Example Request:** POST http://localhost:3000/api/login

**Example Response:**
```json
{
  "id": 1,
  "name": "John",
  "password": "password123",
  "email": "john@example.com",
  "role": "Parent"
}

**Error Handling:**
400 Invalid Request:
  - The requested login data is missing or invalid input return an error with text
    "Missing password", "Missing username", and "Missing role."
500 Internal Server Error:
  - Server-side issue when fetching the data return an error with text
    "An error occurred on the server. Try again later."


## Retireve Elder data
**Request Format:** /api/elders

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Fetches a list of elder records from the database, with optional filtering based on various query parameters. The query parameters can be used to filter the elders based on specific attributes, such as ID, age, education level, years of work experience, name, and price.

**Example Request:** GET http://localhost:3000/api/elders

**Example Response:**
```json
{
  "elders": [
    {
      "id": 1,
      "name": "John",
      "age": 65,
      "education": "High School",
      "yearsOfWork": 40,
      "price": 3000.5,
    },
    {
      "id": 2,
      "name": "Mary",
      "age": 70,
      "education": "Bachelor",
      "yearsOfWork": 35,
      "price": 2500,
    }
  ]
}

**Error Handling:**
500 Internal Server Error:
- Server-side issue when fetching the data or looking in the database return an error with text "Database query error" and "Error reading data."


## Order data
**Request Format:**  /api/orders

**Query Parameters:**
- pid (parent ID): If you want to retrieve orders related to a specific parent.
- eid (elder ID): If you want to retrieve orders related to a specific elder.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This fetches the order based on either parent or elder id provided in the query parameters. It returns the details of shelter orders, including associated information about the parent, elder, and their respective attributes.


**Example Request:** GET http://localhost:3000/api/orders?eid=2


**Example Response:**
```eid: 2
{
  "orders": [
    {
      "id": 2,
      "parentId": 2,
      "elderId": 2,
      "startTime": "2024-12-01 09:00:00",
      "endTime": "2024-12-01 18:00:00",
      "address": "456 Elm St",
      "confirmNum": "CONF123457",
      "comment": "Second test order",
      "fileName": null,
      "mark": 4,
      "child_name": "Jerry",
      "age": 70,
      "email": "9876543210",
      "elderName": "Mary",
      "phone": "9876543210",
      "price": 2500,
      "education": "Bachelor",
      "yearsOfWork": 35
    }
  ]
}

**Error Handling:**
400 Bad Request:
- If the user is not logged in return an error with text "user does not log in."
500 Internal Server Error:
- If an error occurs with missing parameters return a text "Missing parameter."


## Create shelter order data
**Request Format:** /api/shelterOrder

**Body Parameters:**
- parentId (string): The ID of the parent making the shelter order.
- elderId (string): The ID of the elder being assigned to the shelter order.
- startTime (string): The start time of the shelter order in a valid date-time format (e.g., "YYYY-MM-DD HH:MM:SS").
- endTime (string): The end time of the shelter order in a valid date-time format (e.g., "YYYY-MM-DD HH:MM:SS").
- address (string): The address where the elder will be sheltered.

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Used for creating a new shelter order for a parent and an elder. It ensures that both the parent and elder exist and that the elder is available within the given time range. The order is then inserted into the database, and a confirmation number is generated for the order.

**Example Request:** POST http://localhost:3000/api/shelterOrder

**Example Body:**
{
  "parentId": "123",
  "elderId": "456",
  "startTime": "2024-12-15T08:00:00",
  "endTime": "2024-12-15T10:00:00",
  "address": "123 Elder St, Cityville"
}

**Example Response:**
```json
{
  "result": "WyspzJ"
}

**Error Handling:**
400 Bad Request:
- If there is any missing or invalid data or conflicting times return text "user does not log in." and
  missing parameters.
500 Internal Server Error:
- If there is an issue with the server or database return error: err


## Review
**Request Format:** /api/review

**Query Parameters:**
- mark: A numeric or textual rating for the shelter order.
- comment: A textual comment or review about the shelter order.
- id: The id of the shelterOrder record to update.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Handles updating a review for a specific shelterOrder database

**Example Request:** GET http://localhost:3000/api/review

**Example Response:**
{
  "result": "success"
}

**Error Handling:**
400 Bad request:
- If the user is not logged in return a text "User not logged in" and needs the parameters
500 Internal Server Error:
- If there is an issue processing the transaction return a text "Error reading data."

## Register
**Request Format:** /api/register

**Request Type:** POST

**Body Parameters:**
- username (string): The username of the new user. Must be unique.
- password (string): The password for the new user. This will be hashed before being stored in the database.
- childname (string): The users child name.
- age (integer): the users child age.
- email (string): The email address of the new user. Must be unique.
- address (string): the users address.

**Returned Data Format**: Plain text

**Description:** Allow user to register by providing a username, password, and email.
If the registration is successful, a confirmation message is sent.

**Example Request:**
{
  "name": "JohnDoe",
  "password": "password123",
  "childName": "JaneDoe",
  "age": 10,
  "email": "johndoe@example.com",
  "address": "123 Main Street"
}

**Example Response:**
User registered successfully


**Error Handling:**
500 Internal Server Error:
-  If there is a problem querying the database or registration process return a text "Failed to register user"

## Upload
**Request Format:** /api/upload

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Handles file uploads

**Example Request:** POST http://localhost:3000/api/upload

**Example Response:**
{
  message: 'File uploaded successfully!',
  fileName: Something,
}

**Error Handling:**
400 Error upload:
- If there is no file uploaded return a text "No file uploaded."


## Dowload file
**Request Format:** /api/download/:fileName

**Request Type:** GET

**Route Parameter**
- fileName: Placeholder for the actual file name you want to download.

**Returned Data Format**: Downloadable attachment

**Description:** Provides a file download functionality.

**Example Request:** GET http://localhost:3000/api/download/example.txt

**Example Response:**
The file is downloaded

**Error Handling:**
404 File not found:
- If there is no file that match return a text "File not found!"

