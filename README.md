
<div align="center">
  <h2><a href="https://modd.io">Moddio Game Engine 2</a></h2>
  <p>Moddio is a Multiplayer-First Game Engine. It has a built-in server-authoritative netcode, including snapshot interpolation and client-side reconciliation. It can support 50+ concurrent players or 300+ moving entities hosted on a $5/month VM. Join us on <a href="https://discord.gg/XRe8T7K">Discord</a>
</div>

<div align="center">
  <img src="https://img.shields.io/github/contributors/moddio/moddio2?style=for-the-badge&color=f01313">
  <img src="https://img.shields.io/github/last-commit/moddio/moddio2?style=for-the-badge&color=f01313">
  <img src="https://img.shields.io/github/languages/code-size/moddio/moddio2?style=for-the-badge&color=f01313">
</div>


<h3><a href="http://modd.io/play/two-houses">Demo</a></h3>
<br>

## What's included in the box.
- Box2D Physics
- Server-authoritative netcode using Websocket, Snapshot interpolation, Client-side reconciliation, and LZ-string compression
- Inventory & Item system
- Built-in Attributes (e.g. HP, Energy, etc) with regeneration rates
- Built-in Item system (melee & projectile)
- Dialogues (ideal for visual novel-style games)
- Shops (for selling items)
- Unit control (top-down WASD or platformer)
- Client-side predicted projectile + unit movement (optional)
- Unit AI including A* pathfinding
- Mobile controls
- and more!

## Running a game server
Moddio will run games made using [modd.io game editor](https://www.modd.io).

To run the game server, execute the following command:
```
npm run server
```
*The engine will use game.json stored in `/src` directory.

You can download Game JSON from your modd.io's game's in-game editor. Go to `Editor` -> Click `Export JSON`.

<img src="./assets/images/gamejson2.png" width="600" alt="How to get game json in game's in-game editor">

Alternatively, you can download Game JSON from your modd.io's game's sandbox. ([example](https://modd.io/edit/two-houses)). Go to `Menu` -> Click `Export JSON`.

<img src="./assets/images/gamejson.png" width="600" alt="How to get game json in game's sandbox">

Next, rename the downloaded Game JSON as `game.json` and move it to the `./src` directory.

## Quick start example - Run "Two Houses" locally

Install [Node 18](https://nodejs.org) or later and then...

```
git clone https://github.com/moddio/moddio2.git
cd moddio2
npm install
npm run server
```

## Connecting to the game server
Visit http://localhost:80 to start testing game.

## How to create & edit games on modd.io
You must use Moddio Game Editor which is available at [https://www.modd.io](https://www.modd.io).
To learn how to use the game editor, visit here: https://learn.modd.io

## How to contribute
Moddio is completely free and open source under the MIT license, and we are always looking for more contributors.
To learn about how to become a contributor, please visit [how to contribute page](https://docs.modd.io/how-to-contribute)


## Credits ##
[Isogenic Game Engine](https://www.isogenicengine.com/)

[Phaser](https://phaser.io/)

[PlanckJS](https://github.com/piqnt/planck.js)

[uWebsocket](https://github.com/uNetworking/uWebSockets)

[Box2D](https://github.com/erincatto/box2d)

[Kenney Assets](https://www.kenney.nl/)

[Hero Icons](https://github.com/tailwindlabs/heroicons)
