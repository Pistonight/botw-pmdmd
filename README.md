# botw-pmdmd
PauseMenuDataMgr debugging/logging tool for BOTW

**experimental quality**

## Setup
On the switch, you need to have BOTW 1.5.0.
Download `main.npdm` and `subsdk9` from the release page
and put them in `/atmosphere/contents/01007EF00011E000/exefs`

Boot the game, if things work, you should see the number `9`
on the top-left corner of the screen after the game is done booting.

On your PC, download `relay.py` from the release page.
(You need to have python installed).
Run the script with `python relay.py`

Lastly, go to https://pistonight.github.io/botw-pmdmd/
and enter the IP of your switch on the local network
and the port the relay script is running on.

Open the devtools console (Press F12) and click "Dump from console" to get a dump.
There will be a global object `pmdm` for you to query.
The object will be replaced when you dump the next time.

You can also save the current dump to a file with "Save dump" and import it later
with the file selection input.

## Known Issues
Sometimes, a couple of bytes get lost for some reason. If you see pointer values
being misaligned that could be the reason. Retry the dump when this happens.

