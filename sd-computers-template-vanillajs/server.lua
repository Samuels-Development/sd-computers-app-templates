-- sd-computers example app (Vanilla JS): the server side, where the app is registered.
--
-- What it does:
--   1. Registers the app with sd-computers whenever sd-computers is ready: at its start, at every
--      restart, and once now in case it was already running.
--   2. Answers computer.callServer('example:status') from the page (page -> server).
--   3. Adds /computerping_vanilla so you can push a message into every open copy of the app (server -> page).

local RESOURCE = GetCurrentResourceName()

---The page the computer frames: the one in this resource, or Config.DevServer while you work on it.
---@return string
local function page()
    return Config.DevServer or (RESOURCE .. '/' .. Config.Page)
end

local function register()
    local ok, err = exports['sd-computers']:AddCustomApp({
        id = Config.Id,
        label = Config.Label,
        description = Config.Description,
        developer = Config.Developer,
        color = Config.Color,
        ui = page(),
        icon = RESOURCE .. '/' .. Config.Icon,
        size = { w = 900, h = 640 },
        pinned = Config.Pinned,
        groups = Config.Groups,
        computers = Config.Computers,

        -- What the page can call with computer.callServer(name, data). Each runs as (source, data, ctx),
        -- and only ever for a player signed in at a computer that has this app. Answer with the data,
        -- or with false and a message, which the page's call rejects with.
        endpoints = {
            ['example:status'] = function(source, data, ctx)
                return {
                    online = #GetPlayers(),
                    time = os.date('%H:%M:%S'),
                    computer = ctx.computer.label,
                    hostname = ctx.computer.hostname,
                    you = ctx.name,
                }
            end,
        },

        onOpen = function(source, ctx)
            print(('[%s] %s opened the app at %s'):format(Config.Id, ctx.name, ctx.computer.label))
        end,
        onClose = function(source, ctx)
            print(('[%s] %s closed the app'):format(Config.Id, ctx.name))
        end,
    })
    if ok then
        print(('[%s] registered with sd-computers'):format(Config.Id))
    else
        print(('[%s] registration failed: %s'):format(Config.Id, err or 'unknown error'))
    end
end

-- sd-computers keeps its apps in memory, so register whenever it is ready (its start, every restart).
-- onResourceStart is too early for this: sd-computers' exports are not there yet when it fires.
AddEventHandler('sd-computers:ready', register)

-- Once now, in case sd-computers was already running when this resource started.
CreateThread(function()
    if GetResourceState('sd-computers') == 'started' then pcall(register) end
end)

-- Server -> page: /computerping_vanilla hello pushes "hello" to everyone with the app open, where
-- computer.onMessage('ping', ...) hears it.
RegisterCommand(Config.PingCommand, function(source, args)
    local text = table.concat(args, ' ')
    if text == '' then text = 'Hello from the server' end
    exports['sd-computers']:SendAppMessage(-1, Config.Id, 'ping', {
        text = text,
        from = source == 0 and 'the server console' or GetPlayerName(source),
    })
end, false)
