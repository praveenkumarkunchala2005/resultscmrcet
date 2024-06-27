# Node.js Application for WebScrapping

- This Node.js application is designed to fetch student results from a specific website and store them in a MongoDB database.
- This project is implemented with the permission of officials, working on the above project without permission can be considered as offence

## Prerequisites

- Node.js installed on your machine
- MongoDB instance (local or cloud-based)
- Git installed on your machine

## Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/praveenkumarkunchala2005/webScrapper.git]()
   cd webScrapper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   - Set up a MongoDB instance and obtain your MongoDB connection URI. Replace the URI in `index.js` with your actual MongoDB URI

   - Optionally, set the Puppeteer executable path if not using the default:
     ```bash
     export PUPPETEER_EXECUTABLE_PATH=/path/to/chromium
     ```

4. **Run the application:**
   ```bash
   node index.js
   ```

   The server will start at `http://localhost:3000` (or another port if specified).

## Usage

- Open your web browser and navigate to `http://localhost:3000`.
- Enter a student username in the form and submit.
- The application will either fetch the results from MongoDB. The data has to be needed to scrapeed from the www.cmrcetexaminations.com website before accessing.
- You can also click "Show Marks Details" to view detailed marks.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Puppeteer (for web scraping)
- Cheerio (for HTML parsing)
- Bootstrap (for styling)

## Folder Structure

- `index.js`: Main application file.
- `main.html`: HTML template for the front end.
- `page.html`: Temporary file to store scraped data.

---

## the screen recording of this project is present in the below drive

-`Drive Link`:https://drive.google.com/file/d/1-7r3r7z5-gXMAJZXihVdgFtgeKFfU95c/view?usp=sharing

-`Deployed Link`:https://resultscmrcet.onrender.com
