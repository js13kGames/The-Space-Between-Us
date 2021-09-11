class TransportationPowerup {
    /**
     * Constructor for the TransportationPowerup class
     * @param {x: number, y: number} pos1
     * @param {x: number, y: number} pos2
     * 
     * Both pos1 and pos2 are points on the game grid that
     * allow the player block on the grid to teleport between
     *
    */
    constructor(pos1, pos2, grid) {
        this.pos1 = {'entry': pos1, 'exit': pos2}
        this.pos2 = {'entry': pos2, 'exit': pos1}
    }

    /**
     * Teleports the block from either pos1 -> pos2 or vice versa
     * @param boolean spacePressed
     * @param Player player
    */
    teleport(player, pos) {
        // when creating powerups, we must make sure that one of the entry
        // points doesn't spawn over a place with an occupied block

        if (
            pos.entry.x === player.state.x &&
            pos.entry.y === player.state.y
        ) {
            player.state.x = pos.exit.x;
            player.state.y = pos.exit.y;
        }

    }

    /**
     * Teleport all player boxes in the game that are colliding with the
     * teleport powerups
    */
    update(spacePressed, players) {
        if (!spacePressed) return;

        teleport(spacePressed, player)
        for (player in players) {
            this.teleport(player, this.pos1);
            this.teleport(player, this.pos2);
        }

    }

}
