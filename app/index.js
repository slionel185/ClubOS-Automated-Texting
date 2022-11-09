const path = require('path')
const { app, BrowserWindow } = require('electron')

if(require('electron-squirrel-startup')) {
    app.quit()
}

const isDev = process.env.IS_DEV === 'true'

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 200,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: true
        },
    })

    // Remove menu for Prod
    mainWindow.setMenu(null)

    if(isDev) {
        mainWindow.loadURL('http://localhost:3000')
        //mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit()
    }
})

const { ipcMain } = require('electron')
const puppeteer = require('puppeteer')

const sleep = require('./util/extra')
const config = require('./config.json')

ipcMain.handle('dispatchTexts', async (event, args) => {
    console.log('Dispatching Texts....')

    const { message, textAmount, previousContact, bucket, sortBy, user } = args
    
    const browser = await puppeteer.launch({ headless: 'false', userDataDir: './tmp', })
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080})
    await page.goto(config.CLUB_OS.LOGIN, { waitUntil: 'networkidle2' })

    const username = await page.$('input[name="username"]')
    const password = await page.$('input[name="password"]')

    // Login
    let IDENTITY

    if(user === 'SETH') {
        IDENTITY = config.IDENTITY.SETH
    } else if(user === 'ALEX') {
        IDENTITY = config.IDENTITY.ALEX
    } else if(user === 'LEVI') {
        IDENTITY = config.IDENTITY.LEVI
    } else if(user === 'MIKAYLA') {
        IDENTITY = config.IDENTITY.MIKAYLA
    }

    await username.type(IDENTITY.USERNAME)
    await password.type(IDENTITY.PASSWORD)
    await password.press('Enter')
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    console.log(`Signed in as ${IDENTITY.USERNAME}`)

    await page.goto(config.CLUB_OS.USER_SEARCH, { waitUntil: 'domcontentloaded' })

    const selectNone = await page.$('a#select-none')
    await selectNone.evaluate(x => x.click())

    const memberSelect = await page.$('input#client-icon')
    const prospectSelect = await page.$('input#lead-icon')

    if(bucket === 'RFC') {
        await memberSelect.evaluate(x => x.click())
        await sleep(500)
        await page.select('select[name="filter.memberSalesFollowUpStatus"]', '16')
    } else if(bucket === 'WEB_LEAD') {
        await prospectSelect.evaluate(x => x.click())
        await sleep(500)
        await page.select('select[name="filter.memberSalesFollowUpStatus"]', '11')
    } else if(bucket === 'GUEST_OF_TOTAL') {
        await prospectSelect.evaluate(x => x.click())
        await sleep(500)
        await page.select('select[name="filter.memberSalesFollowUpStatus"]', '9')
    } else if(bucket === 'MISSED_GUEST') {
        await prospectSelect.evaluate(x => x.click())
        await sleep(500)
        await page.select('select[name="filter.memberSalesFollowUpStatus"]', '3')
    } else if(bucket === 'APPT_NO_SHOW') {
        await prospectSelect.evaluate(x => x.click())
        await sleep(500)
        await page.select('select[name="filter.memberSalesFollowUpStatus"]', '12')
    }

    await sleep(2000)

    if(sortBy === 'DEFAULT') {
        await page.select('select[name="filter.sort"]', 'roleId asc,firstName asc,lastName asc')
    } else if(sortBy === 'CREATED_ASC') {
        await page.select('select[name="filter.sort"]', 'createdDate asc')
    } else if(sortBy === 'CREATED_DESC') {
        await page.select('select[name="filter.sort"]', 'createdDate desc')
    }

    await sleep(2000)

    let localTextAmount = textAmount
    let sentTexts = 0
    
    let d = new Date()
    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()
    let currentDate = `${month}/${day}/${year}`

    console.log('Starting to send texts.')
    while(localTextAmount !== 0) { 
        let smsArray =  await page.$$('a[aria-label="SMS"')

        for(let i = 0; i < smsArray.length; i++) {

            if(localTextAmount === 0) break

            await smsArray[i].evaluate(x => x.click())
    
            await sleep(3000)
            
            let lastContactedObject = await page.$('div.followup-entry-date')
            if(lastContactedObject === null) continue
            lastContactedObject = await lastContactedObject.$('p')
            let lastContactedDate = await lastContactedObject.evaluate(x => x.innerHTML)
            lastContactedDate = lastContactedDate.split(' ')[0]

            let today = new Date(currentDate)
            let lastContactedDateObject = new Date(lastContactedDate)
            let timeSince = today.getTime() - lastContactedDateObject.getTime()
            let daysSince = timeSince / (1000 * 3600 * 24)

            let sendText = false

            if(daysSince >= previousContact) {
                sendText = true
            }

            let sendTextBtn = await page.$('a.save-follow-up')

            if(sendText) {
                let textBox = await page.$('textarea[name="textMessage"]')
                await textBox.type(message)
                await sleep(200)
                await sendTextBtn.evaluate(x => x.click())            
                await sleep(3000)
                sentTexts++
                localTextAmount--
                console.log(`Sending text number ${sentTexts}, ${localTextAmount} left.`)
            } else {
                let closeBtn = await page.$('div.close-button')
                console.log(`Skipping text.`)
                await closeBtn.evaluate(x => x.click())
            }

            await sleep(3000)
        }

        let nextPage = await page.$('a.next')
        await nextPage.evaluate(x => x.click())
        await sleep(3000)
    }

    await browser.close()
    console.log('Browser closed. Returning sent texts.')
    return { sentTexts }
})