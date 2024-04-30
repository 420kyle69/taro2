const gizmoColors = {
	color1: 0xff9999,
	color2: 0x99ff99,
	color3: 0x66ccff,
	hover: 0xffff99,
	color4: 0xc5b4e3,
};

function setColor(name: keyof typeof gizmoColors, value: number) {
	gizmoColors[name] = value;
}
function getColor(name: keyof typeof gizmoColors) {
	return gizmoColors[name];
}
