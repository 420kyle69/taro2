var CommandController = /** @class */ (function () {
    function CommandController(defaultCommands, map, maxCommands) {
        if (maxCommands === void 0) { maxCommands = 200; }
        this.commands = [];
        this.nowInsertIndex = 0;
        this.defaultCommands = defaultCommands;
        this.maxCommands = maxCommands;
        this.map = map;
    }
    /**
     * add command to exec
     * @param command new command
     * @param history whether the added command will go into the history? (can be undo and redo)
     * @param mapEdit this command is for map editing? if so, it will check if the map changed after
     * command exec, if no change happened, it will not go into the history.
     */
    CommandController.prototype.addCommand = function (command, history, mapEdit) {
        if (history === void 0) { history = true; }
        if (mapEdit === void 0) { mapEdit = true; }
        var mapBeforeCommand = this.getAllTiles();
        command.func();
        if (history) {
            if (mapEdit) {
                if (JSON.stringify(this.getAllTiles()) === JSON.stringify(mapBeforeCommand)) {
                    return;
                }
            }
            if (this.nowInsertIndex < this.commands.length) {
                this.commands.splice(this.nowInsertIndex, this.commands.length - this.nowInsertIndex);
                this.commands[this.nowInsertIndex] = command;
                this.nowInsertIndex += 1;
            }
            else {
                this.commands.push(command);
                this.nowInsertIndex += 1;
            }
            if (this.commands.length > this.maxCommands) {
                this.commands.shift();
                this.nowInsertIndex -= 1;
                this.commands.push(command);
            }
        }
    };
    CommandController.prototype.undo = function () {
        if (this.commands[this.nowInsertIndex - 1]) {
            this.nowInsertIndex -= 1;
            this.commands[this.nowInsertIndex].undo();
        }
    };
    CommandController.prototype.redo = function () {
        if (this.commands[this.nowInsertIndex]) {
            this.commands[this.nowInsertIndex].func();
            this.nowInsertIndex += 1;
        }
    };
    CommandController.prototype.getAllTiles = function () {
        var nowTiles = {};
        Object.entries(this.map.layer.data).map(function (_a) {
            var x = _a[0], obj = _a[1];
            nowTiles[x] = {};
            Object.entries(obj).map(function (_a) {
                var y = _a[0], tile = _a[1];
                nowTiles[x][y] = tile.index;
            });
        });
        return nowTiles;
    };
    return CommandController;
}());
//# sourceMappingURL=CommandsController.js.map