# Creeps

### Types of creeps

| Name  | Function |
| ------------- | ------------- |
| CreepMiner  | Mines resources  |
| CreepBuilder  | Builds stuff |
| CreepCarrier  | Carries energy from a to b |
| CreepWorker  | Combines CreepBuilder and CreepCarrier |
| CreepSoldier  | Mele attacker |
| CreepShooter  | Range attacker |
| CreepHealer  | Heals other creeps |

### CreepMiner

Is mining resources from a source in the room. There are 2 miners per source.

Functions:
* If there is no carrier in range and its storage is full he will return it to the spawn
* If there is a carrier in range he will stay at its position and wait
* If there is a contianer in range 0 it will drop its resources

### CreepBuilder

Builds stuff, fills towers and will upgrade the controller

### CreepCarrier

Is carring energy form a to b.

### CreepWorker

The CreepWorker is a combination of builder and carrier. The worker transports energy from the miners to storage. If storage is full it will build stuff or upgrade the controller.

* Collects energy from miners
* Transports energy to spawn and extrensions
* Builds stuff
* Upgrades controller

### CreepShooter

A range creep solidier

### CreepHealer

Heals damaged creeps