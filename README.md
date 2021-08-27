# Custom Developer Products
Providing a backend for donation centers, product shops and the like. This gives you the ability to have developer products of any price added on request.

Using either the [example place provided](https://github.com/GeneralScripter/Custom-Developer-Products/raw/master/examples/CustomDonationSystem.rbxl), the [example module provided](https://raw.githubusercontent.com/GeneralScripter/Custom-Developer-Products/master/examples/RequestProduct.lua), or your own Roblox frontend, you can use this to add developer products any price whenever it's required! Sending a POST request to the backend server's `/requestProduct` page with the required headers will return 1 of 2 possible results - both in JSON format. If the request is successful, the server will respond with a *message* (string) and *productId* (integer). If the request is unsuccessful, the server will respond with an *error* (string) message.

The way it's currently set up is so that products are re-used where possible. This has been done to reduce the number of products created, making it more organised, and so that the products don't have to have any random (possibly moderated) string added to their names. You can change this by making the requested product name to be something random (such as a [GUID](https://developer.roblox.com/en-us/api-reference/function/HttpService/GenerateGUID)).

If you don't want to download the example place, you can go ahead and edit [this uncopylocked place](https://www.roblox.com/games/4643041269/Uncopylocked-Donation-Center)!

**Required request headers:**
- (String) `serverKey`: Authorization key to verify requests
- (Integer) `universeId`: The game.GameId property
- (String) `name`: The name that will be given to the developer product (must be unique)
- (Integer) `price`: The price that the the developer product will be on sale for

You will need to put a Roblox account cookie in the `.env` file (or in the `index.js` file, though I don't recommend this for security reasons). This project uses the [noblox.js package](https://github.com/suufi/noblox.js), so you will need to use an alternative acount to prevent yourself from being logged out. I recommend using a randomly generated key as the server key to prevent unauthorized access to your backend server; this goes in the `.env` file.

As a result of the Roblox filtration system, some products may end up with filtered names. If two products both end up with the same name after filtering (even though the original names might have been unique), this will throw an exception and the product will not be created.

## Demo
If you're feeling generous, or just want to check it out in action before you set it up for yourself, then head [over here](https://www.roblox.com/games/291509783/Donation-Center).

## Glitch
Feel free to remix [my Glitch app](https://glitch.com/edit/#!/custom-developer-products) to make the setup process easier. However, I cannot guarentee this project will be kept up to date.

## License
[MIT](https://github.com/GeneralScripter/Custom-Developer-Products/blob/master/LICENSE)
