/**
 * Typescript global typings file to prevent any module/property not found errors
 * with Typescript checking in VSCode
 */

declare module "*.png" {
	const value: any;
	export default value;
}

declare module "*.jpg" {
	const value: any;
	export default value;
}

declare module "*.svg" {
	import { SvgProps } from "react-native-svg";
	const content: React.FC<SvgProps>;
	export default content;
}

declare module "*.pdf" {
	const value: string;
	export default value;
}

declare module "*.ttf" {
	const value: any;
	export default value;
}
declare module "*.db" {
	const value: any;
	export default value;
}
