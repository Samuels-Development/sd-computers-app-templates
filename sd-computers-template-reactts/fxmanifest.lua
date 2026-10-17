fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'sd-computers-template-reactts'
author 'sd-computers'
version '1.0.0'
description 'sd-computers custom app template: React TS'

shared_script 'config.lua'
client_script 'client.lua'
server_script 'server.lua'

-- The page, served as https://cfx-nui-sd-computers-template-reactts/ui/dist/... for the computer to frame. There is no
-- ui_page on purpose: FiveM would also lay that page over the game at all times, and the computer
-- does not need it.
files {
    'ui/dist/*',
    'ui/dist/**/*',
}
