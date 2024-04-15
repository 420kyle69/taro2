interface AttributeData {
	color: string;
	dataType: string;
	decimalPlaces: number;
	displayValue: boolean;
	index: number;
	isVisible: string[];
	max: number;
	min: number;
	name: string;
	regenerateSpeed: string;
	showAsHUD: boolean;
	type?: string;
	key: string;
	value: number;
	showWhen?: string[] | string;

	anchorPosition?: string;
	backgroundColor?: string;
	cornerRounding?: number;
	dimensions?: { width: number; height: number };
	fontSize?: number;
	letterSpacing?: number;
	margin?: number;
	origin?: { x: number; y: number };
	padding?: number;
	strokeColor?: string;
	strokeThickness?: number;
	trailingZeros?: boolean;
}
