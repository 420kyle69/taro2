interface CommandEmitterProps {
	func: Function;
	undo: Function;
}

interface CommandControllerProps {
	commands: CommandEmitterProps[];
}

type DefaultCommands = 'increaseBrushSize' | 'decreaseBrushSize';

class CommandController implements CommandControllerProps {
	commands: CommandEmitterProps[] = [];
	defaultCommands: Record<DefaultCommands, Function>;
	nowInsertIndex: number = 0;
	maxCommands: number;
	constructor(defaultCommands: Record<DefaultCommands, Function>, maxCommands: number = 50) {
		this.defaultCommands = defaultCommands;
		this.maxCommands = maxCommands;
	}

	addCommand(command: CommandEmitterProps, history: boolean = true) {
		if (history) {
			if (this.nowInsertIndex < this.commands.length) {
				this.commands.splice(this.nowInsertIndex, this.commands.length - this.nowInsertIndex);
				this.commands[this.nowInsertIndex] = command;
				this.nowInsertIndex += 1;
				command.func();
			} else {
				this.commands.push(command);
				this.nowInsertIndex += 1;
				command.func();
			}

			if (this.commands.length > this.maxCommands) {
				this.commands.shift();
				this.nowInsertIndex -= 1;
			}
		}

	}

	undo() {
		if (this.commands[this.nowInsertIndex - 1]) {
			this.nowInsertIndex -= 1;
			this.commands[this.nowInsertIndex].undo();
		}
	}

	redo() {
		if (this.commands[this.nowInsertIndex]) {
			this.commands[this.nowInsertIndex].func();
			this.nowInsertIndex += 1;
		}
	}

}
