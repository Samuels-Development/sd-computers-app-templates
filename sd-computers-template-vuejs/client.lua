-- sd-computers example app (Vue): the client side. The page asks it for what only the game on
-- this machine knows, with computer.fetchNui('getExampleData'): fetchNui reaches this resource's
-- own NUI callbacks, whatever page calls them.

RegisterNUICallback('getExampleData', function(_, cb)
    local player = PlayerId()
    local here = GetEntityCoords(PlayerPedId())
    local street = GetStreetNameAtCoord(here.x, here.y, here.z)
    -- (os.* does not exist in client Lua: the game's own clock gives the time)
    cb({
        playerName = GetPlayerName(player),
        serverId = GetPlayerServerId(player),
        time = ('%02d:%02d'):format(GetClockHours(), GetClockMinutes()),
        street = GetStreetNameFromHashKey(street),
    })
end)
