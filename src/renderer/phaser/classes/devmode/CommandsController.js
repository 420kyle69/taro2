var CommandController = /** @class */ (function () {
    function CommandController(defaultCommands, maxCommands) {
        if (maxCommands === void 0) { maxCommands = 200; }
        this.commands = [];
        this.nowInsertIndex = 0;
        this.defaultCommands = defaultCommands;
        this.maxCommands = maxCommands;
    }
    CommandController.prototype.addCommand = function (command, history) {
        if (history === void 0) { history = true; }
        if (history) {
            if (this.nowInsertIndex < this.commands.length) {
                this.commands.splice(this.nowInsertIndex, this.commands.length - this.nowInsertIndex);
                this.commands[this.nowInsertIndex] = command;
                this.nowInsertIndex += 1;
                command.func();
            }
            else {
                this.commands.push(command);
                this.nowInsertIndex += 1;
                command.func();
            }
            if (this.commands.length > this.maxCommands) {
                this.commands.shift();
                this.nowInsertIndex -= 1;
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
    return CommandController;
}());
//# sourceMappingURL=CommandsController.js.map