// Dependencies
const express = require("express")
const noblox = require("noblox.js")
const path = require("path")
const fs = require("fs")

// Utilities
const account = require("./util/account.js")

// Constants
const PORT = process.env.PORT || 8080
const COOKIE = process.env.COOKIE || ""
const COOKIE_FILE = path.join(__dirname, "cookie.json")
const COOKIE_REFRESH_INTERVAL = (1 * 1000 * 60 * 60 * 24) * 0.5

// Express initialisation
const app = express()
app.use(express.json())
app.use(require("./routes/routes.js"))

const refreshCookieLoop = async (initialCookie) => {
  fs.readFile(COOKIE_FILE, (err, data) => {
    var cookieToRefresh = initialCookie
    var initialRefreshDelay = COOKIE_REFRESH_INTERVAL

    if (err) {
      console.warn(`Failed to read cookie file to get last updated time. Error: ${err.message}`)
    } else {
      const cookieJSON = JSON.parse(data)
      const timeSinceRefresh = Date.now() - cookieJSON.time

      initialRefreshDelay = COOKIE_REFRESH_INTERVAL - timeSinceRefresh
    }

    const doCookieRefresh = async () => {
      account.cookieRefresh(cookieToRefresh).then((refreshedCookie) => {
        console.log(`Cookie has been refreshed.`)

        cookieToRefresh = refreshedCookie
      }).catch((err) => {
        console.warn(`Failed to refresh cookie. Error: ${err.message}`)
      })
    }

    setTimeout(() => {
      doCookieRefresh()
      setInterval(doCookieRefresh, COOKIE_REFRESH_INTERVAL);
    }, initialRefreshDelay);
  })
}

const initialiseApp = async () => {
  const [loginSuccess, loginResult] = await account.cookieLogin(COOKIE).then((validCookie) => {
    return [true, validCookie]
  }).catch((err) => {
    return [false, err.message]
  })

  if (!loginSuccess) {
    throw new Error(`Failed to log in. Error: ${loginResult}`)
  }

  refreshCookieLoop(loginResult)
  
  noblox.getCurrentUser({
    option: "UserName"
  }).then((username) => {
    console.log(`Logged in as ${username}`)
  }).catch((err) => {
    console.error(`Failed to get details of authenticated user. Error: ${err.message}`)
  })

  const server = app.listen(PORT)

  return server
}

initialiseApp().then(async (server) => {
  console.log(`Listening on port ${PORT}`)
}).catch((err) => {
  console.error(err.message)
})