-- Every value below goes into AddCustomApp (server.lua).
Config = {}
Config.Id          = 'sd-computers-template-vanillajs' -- unique app id: a-z, 0-9, _ and -
Config.Label       = 'Example (Vanilla JS)' -- the name under the icon and on the window
Config.Description = 'sd-computers example app built with Vanilla JS.'
Config.Developer   = 'sd-computers'
Config.Color       = '#f7df1e' -- '#rrggbb', the tile behind the icon until it loads
Config.Pinned      = false -- also on the taskbar (modern) and the dock (mac)
Config.Groups      = nil -- only these jobs or gangs, e.g. { mechanic = 0 } (nil = everyone)
Config.Computers   = nil -- only these computers, e.g. { 'public_pc' } (nil = every computer)

Config.Page        = 'ui/index.html' -- the page, inside this resource
Config.Icon        = 'ui/icon.svg'
Config.DevServer   = nil -- a full http(s) address to frame a page served from elsewhere while you work on it

Config.PingCommand = 'computerping_vanilla' -- /computerping_vanilla hello pushes "hello" to everyone with the app open
