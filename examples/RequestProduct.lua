--[[
  // AUTHOR: General_Scripter
  \\ CREATION DATE: 30/01/20 17:21
  // MODIFIED BY: General_Scripter
  \\ MODIFIED DATE: 25/08/21 17:55
--]]

local serverKey = ""
local baseUrl = "https://YOUR-APP-NAME-HERE.glitch.me/"
local productNameFormat = "%s Robux Donation"
local httpServ = game:GetService("HttpService")
local universeId = game.GameId

local function formatNumber(number)
	local i, j, minus, int, fraction = string.find(tostring(number), "([-]?)(%d+)([.]?%d*)")
	int = string.gsub(string.reverse(int), "(%d%d%d)", "%1,")
	
	return minus..string.gsub(string.reverse(int), "^,", "")..fraction
end

return function(price)
	local res = httpServ:RequestAsync({
		Url = baseUrl.."requestProduct";
		Method = "POST";
		Headers = {
			["Content-Type"] = "application/json"
		};
		Body = httpServ:JSONEncode({
			["serverKey"] = serverKey;
			["universeId"] = universeId;
			["name"] = string.format(productNameFormat, formatNumber(price));
			["price"] = price;
		});
	})
	
	return res
end
