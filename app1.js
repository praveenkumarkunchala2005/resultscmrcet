const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://abcd:abcdabcd@cluster0.0lherrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

(async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('results');
        const collection = database.collection('resultsDetails');

        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
    
        console.log('Navigating to login page...');
        await page.goto('https://www.cmrcetexaminations.com/BeeSERP/Login.aspx');

        const username = '22H51A0401';
        const password = '22H51A0401';
        await page.waitForSelector('#txtUserName');
        await page.type('#txtUserName', username);
        await page.waitForSelector('#btnNext');
        await page.click('#btnNext');
        await page.waitForSelector('#txtPassword');
        await page.type('#txtPassword', password);
        await page.waitForSelector('#btnSubmit');
        await page.click('#btnSubmit');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.click('#ctl00_cpStud_lnkOverallMarksSemwiseMarks');
        await new Promise(resolve => setTimeout(resolve, 3000));
    
        const content = await page.content();
        const $ = cheerio.load(content);
    
        const name = $('#ctl00_cpHeader_ucStudCorner_lblStudentName').text().trim();
        console.log('Name:', name);
    
        const cgpa = $('#ctl00_cpStud_lblMarks').text().trim();
        console.log('Name:', cgpa);
    
        const marksData = $('#ctl00_cpStud_pnMarks').html();
        fs.writeFileSync('page.html', marksData);
        await browser.close();
        const userid = username.toLowerCase();
        console.log('User ID:', userid);
        const data = {
            userid: userid,
            name: name,
            cgpa: cgpa,
            marksData: marksData
        };
        await collection.insertOne(data);
        console.log('Data inserted into MongoDB');
        await browser.close();
        await client.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
