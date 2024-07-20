const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core'); 

const uri = "mongodb+srv://abcd:abcdabcd@cluster0.0lherrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let collection;

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    const database = client.db('results');
    collection = database.collection('resultsDetails');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); 
  });

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

app.post('/submit', submitHandler);

async function submitHandler(req, res) {
  try {
    const username1 = req.body.username;
    if (!username1) {
      console.log('Username is required.');
      return res.status(400).send('Username is required.');
    }

    const userid1 = username1.toLowerCase();
    let data = await collection.findOne({ userid: userid1 });

    console.log('Data from MongoDB:', userid1);
    if (data) {
      return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>User Info</title>
              <!-- Bootstrap CSS -->
              <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body>
              <div class="container">
                  <div class="row justify-content-center align-items-center" style="height: 100vh;">
                      <div class="col-md-6">
                          <div class="text-center">
                              <h2 class="mb-4">RESULTS</h2>
                              <form action="/submit" method="POST">
                                  <div class="form-group">
                                      <label for="username">Enter your username:</label>
                                      <input type="text" class="form-control" id="username" name="username">
                                  </div>
                                  <button type="submit" class="btn btn-success btn-block">Submit</button>
                              </form>
                          </div>
                          <div class="text-center mt-4">
                              <h2>User Info</h2>
                              <p>Name: ${data.name}</p>
                              <p>CGPA: ${data.cgpa}</p>
                              <form action="/showMarks" method="POST">
                                  <input type="hidden" name="username" value="${userid1}">
                                  <button type="submit" class="btn btn-primary btn-block">Show Marks Details</button>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          </body>
          </html>
      `);
    }
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();

    console.log('Navigating to login page...');
    await page.goto('https://www.cmrcetexaminations.com/BeeSERP/Login.aspx');

    const username = username1.toUpperCase();
    const password = username;
    await page.waitForSelector('#txtUserName');
    await page.type('#txtUserName', username);
    await page.waitForSelector('#btnNext');
    await page.click('#btnNext');
    await page.waitForSelector('#txtPassword');
    await page.type('#txtPassword', password);
    await page.waitForSelector('#btnSubmit');
    await page.click('#btnSubmit');
    await page.waitForNavigation();

    await page.click('#ctl00_cpStud_lnkOverallMarksSemwiseMarks');
    await page.waitForTimeout(3000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const nameElement = $('#ctl00_cpHeader_ucStudCorner_lblStudentName');
    let name = nameElement.text().trim();
    name = name.replace("WELCOME", "").trim();
    console.log('Name:', name);
    const cgpa = $('#ctl00_cpStud_lblMarks').text().trim();
    console.log('CGPA:', cgpa);

    const marksData = $('#ctl00_cpStud_pnMarks').html();
    fs.writeFileSync('page.html', marksData);

    const userid = username.toLowerCase();
    console.log('User ID:', userid);
    data = {
      userid: userid,
      name: name,
      cgpa: cgpa,
      marksData: marksData
    };
    await collection.insertOne(data);
    console.log('Data inserted into MongoDB');
    await browser.close(); 
    return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>User Info</title>
              <!-- Bootstrap CSS -->
              <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body>
              <div class="container">
                  <div class="row justify-content-center align-items-center" style="height: 100vh;">
                      <div class="col-md-6">
                          <div class="text-center">
                              <h2 class="mb-4">RESULTS</h2>
                              <form action="/submit" method="POST">
                                  <div class="form-group">
                                      <label for="username">Enter your username:</label>
                                      <input type="text" class="form-control" id="username" name="username">
                                  </div>
                                  <button type="submit" class="btn btn-success btn-block">Submit</button>
                              </form>
                          </div>
                          <div class="text-center mt-4">
                              <h2>User Info</h2>
                              <p>Name: ${data.name}</p>
                              <p>CGPA: ${data.cgpa}</p>
                              <form action="/showMarks" method="POST">
                                  <input type="hidden" name="username" value="${userid1}">
                                  <button type="submit" class="btn btn-primary btn-block">Show Marks Details</button>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          </body>
          </html>
      `);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Info</title>
        <!-- Bootstrap CSS -->
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center align-items-center" style="height: 100vh;">
                <div class="col-md-6">
                    <div class="text-center">
                        <h2 class="mb-4">RESULTS</h2>
                        <form action="/submit" method="POST">
                            <div class="form-group">
                                <label for="username">Enter your username:</label>
                                <input type="text" class="form-control" id="username" name="username">
                            </div>
                            <button type="submit" class="btn btn-success btn-block">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
`);
  }
}

app.post('/showMarks', async (req, res) => {
  try {
    const username = req.body.username;
    if (!username) {
      console.log('Username is required.');
      return res.status(400).send('Username is required.');
    }

    const userid = username.toLowerCase();
    let data = await collection.findOne({ userid: userid });
    console.log('Data from MongoDB:', userid);
    if (data) {
      return res.send(`
        <p>${data.marksData}</p>
      `);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
