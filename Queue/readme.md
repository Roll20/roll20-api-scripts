# Queue

Queue keeps an ordered list of players who want the GM's attention, with the reason for each request. It replaces Roll20's raise-hand toast, which disappears after a few seconds and doesn't say what the player wants.

Requests are handled first in, first out. Requests marked urgent go to the top, unless the GM turns that off.

## Getting started

1. Install the script. On startup it creates a macro named 🛎 (visible to all players), a GM-only **Queue** handout and a **Help: Queue** handout.
2. The GM is asked once whether to run the queue from **Chat** or from the **Queue handout**. This can be changed at any time.
3. Each player opens the Collection tab, finds the 🛎 macro and checks **In Bar**. The API can't do this for them.

Roll20's built-in `/raisehand` and `/rh` commands are not connected to the queue. Players use the 🛎 macro or `!q`.

## For players

- Click the 🛎 macro, or type `!queue` or `!q`. A menu of request types is whispered to you. Click one to join the queue.
- You get a whisper confirming your place in line.
- You can have one request at a time. Choosing a new one replaces the old one and keeps your place.
- **Make urgent** moves your request to the top. **Make normal** returns it to its original place.
- **Other...** lets you type your own request.
- **Help someone...** and **Talk with...** ask which character the request involves. The choices are party members first, then other players' tokens on your page, a token you click on the map, or a typed name. The player of the chosen character is told about the request.
- Your request is listed under your character. If you have your token selected, that token is used. Otherwise your character's token on the current page is used. If none is found, your player name is used.
- **Withdraw** removes your request.
- **Add note**, or `!q note` followed by text, adds a line to the GM's session notes.

## For the GM

The GM runs the queue from one of two interfaces, with the same control panel in each:

- **Chat:** the queue is posted to the GM's chat when it changes. Nothing to open, but it adds to chat.
- **Handout:** the panel lives in the GM-only Queue handout and updates in place. Chat gets a one-line notice with an **Open** link for each change. The API can't open a handout on screen, so open it once per session.

Players always use chat.

Each request in the panel has:

- **Token image:** ping and pull everyone to that token.
- **Name:** ping and pull only the GM and that player.
- **Eye (Seen):** tells the player their request has been seen, without removing it. Click again to un-mark.
- **Speech balloon (Announce):** removes the request and posts a public spotlight card showing who has the floor.
- **X:** removes the request quietly. The player is told it was cleared.

The **SPOTLIGHT** line at the top of the queue shows the last announced request until the next one, or until the GM clears it.

The footer has **Refresh**, **Clear all**, **Log** (recently resolved requests), **Notes** (opens the session notes handout), the **Interface** switch and **Tracker sync**.

**Clear all** empties the queue and posts a public **QUEUE CLEARED** card, which signals that free-form play resumes.

## Settings

The gear button in the queue header opens Settings:

- **Interface:** Chat or Handout.
- **Queue visible to:** GM only, or Everyone.
- **GM chat** and **player chat:** Off, a one-line notice, or the full list on each change. Players can turn the shared queue off for themselves in **My settings**.
- **Urgent jumps the line:** on or off.
- **Sound:** a Jukebox track to play when a request arrives.
- **Categories:** rename, reorder, add or remove request types, mark them urgent, or set them to ask for a character.
- **Session notes handout:** name and time zone.
- **Turn tracker:** sync, combat insertion and auto-open (see below).

## Session notes

`!q note` followed by text adds a line to the GM-only **Session Notes** handout, with the time, the player's name and the note. Times are UTC unless a time zone is chosen in Settings. Players' notes are also whispered to the GM.

Other scripts can read the notes with `Queue.getNotes()`.

## Turn tracker (optional)

Every player can see the turn tracker. With sync on, the queue is shown to everyone even when it is set to GM only.

- When the turn order has no token turns, each request appears as a custom turn. Deleting a turn dismisses that request, dragging reorders the queue and **Next Turn** announces the top request.
- **During combat**, requests can be inserted right after the asking character's turn, or hidden until combat ends. Turns added by other scripts are never touched.

## Practice mode

`!q --test` opens a test panel for trying the queue alone before using it in a game. It adds stand-in requests from selected tokens, lets the GM act as those players, and removes only the stand-in requests afterward.

## Commands

| Command | What it does |
|---|---|
| `!queue` or `!q` | Request menu (player) or queue (GM) |
| `!q --view` | Show the queue |
| `!q --withdraw` | Withdraw your request |
| `!q --settings` | Settings |
| `!q note <text>` | Add a session note |
| `!q --iface chat` / `!q --iface handout` | Choose the GM interface (GM) |
| `!q --test` | Practice mode panel (GM) |
| `!q --whoami` | Troubleshooting: how your request would be identified (report goes to the GM) |
| `!q --help` | Link to the help handout |

Full documentation is in the **Help: Queue** handout.
