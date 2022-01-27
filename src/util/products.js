// Dependencies
const noblox = require("noblox.js")
const path = require("path")
const fs = require("fs")

// Constants
const PRODUCT_CACHE_FILE = path.join(__dirname, "..", "products.json")

exports.getCachedProduct = async (price) => {
  const productCache = require(PRODUCT_CACHE_FILE)
  const cachedProductId = productCache[price.toString()]

  if (cachedProductId !== undefined) {
    return cachedProductId
  }

  throw new Error("Cached product doesn't exist")
}

exports.createNewProduct = async (universeId, name, price, overrideCache = false) => {
  if (overrideCache !== true) {
    const [cachedProductExists, cachedProductResult] = await exports.getCachedProduct(price).then((cachedProductId) => {
      return [true, cachedProductId]
    }).catch((err) => {
      return [false, err.message]
    })

    if (cachedProductExists) {
      throw new Error(`Cached product already exists`)
    }
  }

  const [newProductCreated, newProductResult] = await noblox.addDeveloperProduct(universeId, name, price).then((productDetails) => {
    const newProductId = parseInt(productDetails.productId)

    var productCache = require(PRODUCT_CACHE_FILE)
    productCache[price.toString()] = newProductId

    fs.writeFile(PRODUCT_CACHE_FILE, JSON.stringify(productCache, null, 2), (err) => {
      if (err) {
        console.warn(`[${universeId}] Failed to save product ${name} for ${price} Robux to file. Error: ${err.message}`)
      }
    })

    return [true, newProductId]
  }).catch((err) => {
    return [false, err.message]
  })

  if (newProductCreated) {
    return newProductResult
  }

  throw new Error(newProductResult)
}