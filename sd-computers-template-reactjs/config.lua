-- Every value below goes into AddCustomApp (server.lua).
Config = {}
Config.Id          = 'sd-computers-template-reactjs' -- unique app id: a-z, 0-9, _ and -
Config.Label       = 'Example (React JS)' -- the name under the icon and on the window
Config.Description = 'sd-computers example app built with React JS.'
Config.Developer   = 'sd-computers'
Config.Color       = '#61dafb' -- '#rrggbb', the tile behind the icon until it loads
Config.Pinned      = false -- also on the taskbar (modern) and the dock (mac)
Config.Groups      = nil -- only these jobs or gangs, e.g. { mechanic = 0 } (nil = everyone)
Config.Computers   = nil -- only these computers, e.g. { 'public_pc' } (nil = every computer)

Config.Page        = 'ui/dist/index.html' -- the page, inside this resource
Config.Icon        = 'ui/dist/icon.svg'
Config.DevServer   = nil -- 'http://localhost:5173' while `npm run dev` runs in ui/ (live reload)

Config.PingCommand = 'computerping_react' -- /computerping_react hello pushes "hello" to everyone with the app open
