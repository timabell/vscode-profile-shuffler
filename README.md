# vscode-profile-shuffler

An attempt to make a vscode extension to move extensions between vscode profiles, for which I could see no easy way.

<https://marketplace.visualstudio.com/items?itemName=timabell.vscode-profile-shuffler>

<https://github.com/timabell/vscode-profile-shuffler>

AGPL-3.0 license

Hacked together with github co-pilot

Usage:

1. Ctrl-Shift-P
2. Move Extensions
3. Enter target profile name (can't find a way to list profiles, patches welcome)
4. Choose extensions to move
5. Press okay to move extensions to new profile


## Publishing an extension

This is completely bananas. Recorded here because I won't remember it

<https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions>

Create a publishing account (timabell) over here: <https://marketplace.visualstudio.com/manage/publishers/timabell>

Then in this completely different place in the derelict temple of ~~Visual Studio Online~~ Azure DevOops:

Create a token here <https://timwise.visualstudio.com/_usersSettings/tokens> - max expiry 1 year, hello repeating yaks

Then register the token and name with the cli:

```sh
vsce login timabell
https://marketplace.visualstudio.com/manage/publishers/
Personal Access Token for publisher 'timabell': ...
The Personal Access Token verification succeeded for the publisher 'timabell'.
```
