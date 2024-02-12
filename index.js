const express = require('express');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs-extra');

const app = express();

async function uploadImageAndTakeScreenshot() {
    const options = new chrome.Options();
    options.addArguments('--window-size=500,1080');

    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        await driver.get('https://photo-to-anime.com/en/photo-to-anime');
        const fileInput = await driver.findElement(By.css('input[type="file"]'));

        const folderPath = './frames';
        const files = fs.readdirSync(folderPath).length;

        const imagePath = './frames/frame_0.png';
        await fileInput.sendKeys(imagePath);

        await driver.wait(until.elementTextIs(driver.findElement(By.css('html > body > div:nth-of-type(2) > div:first-of-type > div > div:first-of-type > span')), 'Select a photo'));

        const divClass = await driver.findElement(By.css('html > body > div:nth-of-type(2) > div:first-of-type > div > div:nth-of-type(2) > div:nth-of-type(3)')).getAttribute('class');
        if (divClass.includes('m-4') && divClass.includes('flex') && divClass.includes('space-x-2')) {
            const canvasElement = await driver.findElement(By.css('#resultCanvas'));
            const screenshot = await canvasElement.takeScreenshot();
            const imagePath2 = './images/cartoon_0.png';
            await fs.writeFile(imagePath2, screenshot, 'base64');
            console.log(`Screenshot - 0`);
        } else {
            console.log('The class of the div does not match.');
        }

        for (let i = 1; i < files; i++) {
            const imagePath = `./frames/frame_${i}.png`;
            await fileInput.sendKeys(imagePath);
            await driver.wait(until.elementTextIs(driver.findElement(By.css('html > body > div:nth-of-type(2) > div:first-of-type > div > div:first-of-type > span')), 'Select a photo'));
            const canvasElement = await driver.findElement(By.css('#resultCanvas'));
            const screenshot = await canvasElement.takeScreenshot();
            const imagePath2 = `./images/cartoon_${i}.png`;
            await fs.writeFile(imagePath2, screenshot, 'base64');
            console.log(`Screenshot - ${i}`);
        }

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit();
    }
}

// Route to trigger the image processing
app.get('/process-images', async (req, res) => {
    try {
        await uploadImageAndTakeScreenshot();
        res.send('Images processed successfully');
    } catch (error) {
        res.status(500).send('Error processing images');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
