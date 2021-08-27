// Dependencies
const express = require("express")
const fs = require("fs")

// Utilities
const auth = require("../util/auth.js")
const products = require("../util/products.js")

// Router initialisation
const router = express.Router()

router.post("/requestProduct", async (req, res, next) => {
  const serverKey = req.body.serverKey
  const universeId = parseInt(req.body.universeId)
  const name = req.body.name
  const price = parseInt(req.body.price)

  const [isValidKey, validationResult] = await auth.validateServerKey(serverKey)

  if (!isValidKey) {
    console.warn(`Request rejected. Reason: ${validationResult}`)

    return res.status(403).json({
        error: "You do not have permission to use this."
    })
  }
  
  const [cachedProductExists, cachedProductResult] = await products.getCachedProduct(price).then((cachedProductId) => {
    return [true, cachedProductId]
  }).catch((err) => {
    return [false, err.message]
  })
  
  if (cachedProductExists) {
    return res.status(200).json({
      message: `[${universeId}] Found product ${name} for ${price} Robux.`,
      productId: cachedProductResult
    })
  }

  const [newProductCreated, newProductResult] = await products.createNewProduct(universeId, name, price).then((newProductId) => {
    return [true, newProductId]
  }).catch((err) => {
    return [false, err.message]
  })

  if (newProductCreated) {
    console.log(`[${universeId}] Created product ${name} for ${price} Robux.`)

    return res.status(200).json({
      message: `[${universeId}] Created product ${name} for ${price} Robux.`,
      productId: newProductResult
    })
  }

  console.log(`[${universeId}] Failed to create product ${name} for ${price} Robux. Error: ${newProductResult}`)

  return res.status(400).json({
    error: newProductResult
  })
})

router.get("/*", async (req, res, next) => {
  return res.status(200).json({})
})

module.exports = router