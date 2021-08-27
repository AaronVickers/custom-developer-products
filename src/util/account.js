// Dependencies
const noblox = require("noblox.js")
const path = require("path")
const fs = require("fs")

// Constants
const COOKIE_FILE = path.join(__dirname, "..", "cookie.json")

exports.cookieLogin = async (cookie) => {
  if (fs.existsSync(COOKIE_FILE)) {
    console.log("Attempting to set cookie with stored cookie")
    
    const cookieJSON = JSON.parse(fs.readFileSync(COOKIE_FILE))
    const savedCookie = cookieJSON.cookie

    const [isValidCookie, setCookieResult] = await noblox.setCookie(savedCookie).then(() => {
      return [true, "Cookie set successfully"]
    }).catch((err) => {
      return [false, err.message] // Invalid or expired
    })

    if (isValidCookie) {
      return savedCookie
    }

    console.warn(`Use of stored cookie failed. Error: ${setCookieResult}`)
  }

  if (cookie) {
    console.log("Attempting to set cookie with supplied cookie")

    const [isValidCookie, setCookieResult] = await noblox.setCookie(cookie).then(() => {
      return [true, "Cookie set successfully"]
    }).catch((err) => {
      return [false, err.message]
    })

    if (isValidCookie) {
      fs.writeFile(COOKIE_FILE, JSON.stringify({
        cookie: cookie,
        time: Date.now()
      }), (err) => {
        if (err) {
          console.warn(`Failed to write cookie to file. Error: ${err.message}`)
        }
      })

      return cookie
    }

    console.warn(`Use of supplied cookie failed. Error: ${setCookieResult}`)
  }

  throw new Error("Cookie login failed, supplied and stored cookies are either missing or invalid")
}

exports.cookieRefresh = async (cookie) => {
  const [refreshSuccess, refreshResult] = await noblox.refreshCookie(cookie).then((newCookie) => {
    return [true, newCookie]
  }).catch((err) => {
    return [false, err.message]
  })

  if (refreshSuccess) {
    fs.writeFile(COOKIE_FILE, JSON.stringify({
      cookie: refreshResult,
      time: Date.now()
    }), (err) => {
      if (err) {
        console.warn(`Failed to write refreshed cookie. Error: ${err.message}`)
      }
    })

    return refreshResult
  }

  throw new Error(refreshResult)
}