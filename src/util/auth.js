// Constants
const SERVER_KEY = process.env.SERVERKEY || ""

exports.validateServerKey = async (inputServerKey) => {
  if (SERVER_KEY === "") {
    return [false, "Server key has not been set"]
  }

  if (inputServerKey !== SERVER_KEY) {
    return [false, "Invalid server key supplied"]
  }

  return [true, "Server key validated"]
}