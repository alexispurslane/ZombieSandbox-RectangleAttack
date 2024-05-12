# Zombie Sandbox: Rectangle Attack
## A dumb, fun, coffee-break zombie survival run-n-gun platformer with crafting mechanics

### How to play

#### Basics

Your job in this game is to simply see how many zombies you can kill before you die or get bored with a run, whatever happens first, while keeping it fun for yourself (i.e., avoid holing up in towers or foxholes for too long because it isn't fun). During the day, there are a few weak, slow-moving zombies dotting the procedurally generated 2D landscape here and there to keep it interesting, but the daytime is when you want to explore and build your fort. Then, when night falls, watch out: zombies will come raining down from the sky (from where? Planes, I guess?). There's no real end goal or objective beyond that — what can I say? It's just a bit of dumb fun, something to play while your code is compiling or your coffee is brewing. Give it a shot!

#### Keybindings

Download the ZIP file and open the `index.html` in your browser of choice, it's a simple vanilla JS/HTML5 canvas game. Keybindings are:

- <kbd>space</kbd> to jump or swim up when in water
- <kbd>a</kbd> and <kbd>s</kbd> to move left and right respectively
- <kbd>s</kbd> to go down through platforms or water
- <kbd>Left Click</kbd> with a weapon selected to fire whatever your current weapon is (if the stamina to do so is available), or <kbd>Hold LMB</kbd> to just continuously fire as soon as possible for the current weapon
- <kbd>Left Click</kbd> to build the currently selected block if one is selected
- <kbd>Left Click</kbd> to destroy the block under the cursor — if it is within your reach — if "remove block" is selected
- <kbd>0</kbd>-<kbd>9</kbd> to jump to a specific weapon in the block/weapon selection roll
- <kbd>Up Arrow</kbd> and <kbd>Down Arrow</kbd> to scroll through your block/weapon selection roll

#### Weapons

Each type of weapon has a list of types of blocks it can destroy. For instance, grenades and shotguns destroy dirt, high yield bombs and rocket launchers can (if I recall correctly) even destroy stone as well as dirt, but flamethrowers can only destroy wood. Weapons also fire with different bullet patterns and do different amounts of damage.

The player has a **stamina** stat, represented by a bar across the top of the screen just beneath the status bar with your health and kill count. Each action (creating or removing blocks or firing weapons) takes a set amount of stamina, and you can only perform that action if you have greater than or more stamina than that, which will then deplete your stamina. Stamina recovers at a fixed rate over time. Bigger, better weapons typically require more stamina.

#### Leveling

You will start out the ability to build basic dirt blocks from a limited supply, the ability to remove blocks to collect dirt, a Shotgun, and a Grenade. The more zombies you kill, the more weapons and types of blocks will become available to you. Additionally, the higher your level, the farther you jump, the faster you move, the more stamina you have, and the faster your stamina will recharge.

However, don't get complacent — zombies level up too: eventually, they will begin to be able to dig through dirt almost as if it isn't there, and eventually they'll even become able to break stone, although it takes multiple hits for them to do so. Additionally, they'll become faster and hurt you more.

###  Status

This is something I made for my brother when I was 16-17, as a quick-and-dirty side project — with no eye toward code quality or ease of use — while working on a much more ambitious real-time strategy game (at the time around 10,000 lines of Rust code) that never saw the light of day.

My girlfriend and I rediscovered it and realized, thanks to the continuous loop of feedback I had with my brother at the time, it's actually *surprisingly addictive*, so we're thinking about reviving it.
