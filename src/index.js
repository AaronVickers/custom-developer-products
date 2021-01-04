const fs = require("fs")
const express = require("express")
const rbx = require("noblox.js")

const app = express()
app.use(express.json())

const port = process.env.PORT || 8080
const serverKey = process.env.SERVERKEY || ""
const cookie = process.env.COOKIE || ""
const productCacheName = "./products.json"

const cookieFile = "./cookie.json"
const cookieRefreshInterval = (1*1000*60*60*24)*0.5

app.post("/requestProduct", function(req, res, next) {
  const key = req.body.serverKey
  
  if (key !== serverKey) {
    console.log("Invalid server key supplied.")

    return res.status(403).json({
        error: "You do not have permission to use this."
    })
  }
  
  const universeId = parseInt(req.body.universeId)
  const name = req.body.name
  const price = parseInt(req.body.price)
  
  var productCache = require(productCacheName)
  var productId = productCache[price.toString()]
  
  if (productId) {
    return res.status(200).json({
      message: "["+universeId+"] Product found "+name+" for "+price+" Robux.",
      productId: parseInt(productId)
    })
  }
  
  const args = {
    universeId: universeId,
    name: name,
    priceInRobux: price
  }

  rbx.addDeveloperProduct(args).then(function(productDetails) {
    productId = productDetails.productId

    productCache[price.toString()] = parseInt(productId)

    fs.writeFile(productCacheName, JSON.stringify(productCache, null, 2), function(err) {
      if (err) {
        console.log("["+universeId+"] Failed to save product "+name+" for "+price+" Robux to file: "+err.message)
      }
    })

    console.log("["+universeId+"] Created product "+name+" for "+price+" Robux.")

    return res.status(200).json({
      message: "["+universeId+"] Created product "+name+" for "+price+" Robux.",
      productId: parseInt(productId)
    })
  }).catch(function(err) {
    console.log("["+universeId+"] Failed to create product "+name+" for "+price+" Robux: "+err.message)

    return res.status(400).json({
      error: err.message
    })
  })
})

app.get("/*", function(req, res, next) {
  return res.status(200).json({})
})

async function cookieRefresh(useCookie, initialTime) {
    setTimeout(async function() {
        var newCookie = useCookie

        try {
            newCookie = await rbx.refreshCookie(useCookie)

            fs.writeFile(cookieFile, JSON.stringify({
                cookie: newCookie,
                time: Date.now()
            }), function(err) {
                if (err) {
                    console.error(`Failed to write refreshed cookie: ${err}`)
                }
                
                return true
            })
        } catch(err) {
            console.log(`Cookie refresh failed. Error: ${err}`)
        }
        
        await cookieRefresh(newCookie)
    }, initialTime || cookieRefreshInterval)
}

async function cookieLogin(defaultCookie) {
    if (fs.existsSync(cookieFile)) {
        const cookieJSON = JSON.parse(fs.readFileSync(cookieFile))
        const savedCookie = cookieJSON.cookie
        const timeSinceRefresh = Date.now()-cookieJSON.time
        
        try {
            const isValidCookie = await rbx.setCookie(savedCookie)
            
            if (isValidCookie) {
                await cookieRefresh(savedCookie, cookieRefreshInterval-timeSinceRefresh)
                
                return
            } else {
               throw new Error("Invalid or expired")
            }
        } catch(err) {
            console.error(`Use of stored cookie failed: ${err}. Trying with supplied cookie.`)
        }
    }
    
    if (defaultCookie) {
        try {
            const isValidCookie = await rbx.setCookie(defaultCookie)
            
            if (isValidCookie) {
                fs.writeFile(cookieFile, JSON.stringify({
                    cookie: defaultCookie,
                    time: Date.now()
                }), function(err) {
                    if (err) {
                        console.error(`Failed to write cookie: ${err}`)
                    }
                    
                    return true
                })
                
                await cookieRefresh(defaultCookie)
                
                return
            } else {
               throw new Error("Invalid or expired")
            }
        } catch(err) {
            console.error(`Use of supplied cookie failed: ${err}`)
        }
    }
    
    throw new Error("Cookie login failed, supplied and stored cookies are either missing or invalid.")
}

function logIn(newCookie) {
    cookieLogin(newCookie).then(function() {
        rbx.getCurrentUser({option: "UserName"}).then(function(username) {
            console.log(`Logged in as ${username}`)
        })
        
        console.log(`Listening on port ${port}`)
        
        return app.listen(port)
    }).catch(function(err) {
        console.error(`Failed to log in. Error: ${err.message}`)
        
        const errorApp = express()
        errorApp.use(express.json())
        
        errorApp.get("/*", function(req, res, next) {
            res.status(503).json({
                error: `Failed to log in. Error: ${err.message}`
            })
        })
        
        return errorApp.listen(port)
    })
}

const server = logIn(cookie)