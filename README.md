## Web Fortress ##

Web Fortress is a [DFHack](http://github.com/dfhack/dfhack) plugin that
exposes the rendering and input of a game of
[Dwarf Fortress](http://bay12games.com) over a websocket, and an HTML5
client that allows player to join in a shared game over their browsers.

It is a fork of the [Text Will Be Text](https://github.com/mifki/df-twbt) plugin, by Vitaly Pronkin, and can be used in its place.

### Downloading ###

This project manages dependencies through Git submodules. To clone the full
tree:

	git clone --recursive <the git repo>

Windows binaries are provided through [Github](https://github.com/Ankoku/df-webfort/releases).
If you would like to recieve (likely buggy) prerelease builds, email
<alloyed@tfwno.gf>.

### Compiling ###

Web Fortress in known to compile with clang on linux, and VS2010 on
Windows. See <COMPILING.md> for more.

### Installation ###

1. Install webfort plugin as usual.
2. Copy `ShizzleClean.png` or any other text font to `data/art` folder.
3. Copy all `.dll` files to your DF folder.
4. Ensure that `PRINT_MODE` is set to `STANDARD` in your `init.txt`, and set `FONT` to `ShizzleClean.png`.
5. Open `static/js/webchat.js` and edit the `iframeURL` variable to
   point to your preferred embeddable chat client. One possible choice
is [qwebirc](http://qwebirc.org).
6. Use any web server to serve files from `static` folder. You can use [Mongoose](http://cesanta.com/mongoose.shtml), just copy it to `static` folder and run.
7. Navigate to `http://<YOUR HOST>/webfort.html` and enjoy.

### Authors and Links ###

[Original Source](https://github.com/mifki/df-webfort) -- [Discussion](http://www.bay12forums.com/smf/index.php?topic=139167.0) -- [Report an Issue](https://github.com/Ankoku/df-webfort/issues)

Copyright (c) 2014, Vitaly Pronkin <pronvit@me.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
