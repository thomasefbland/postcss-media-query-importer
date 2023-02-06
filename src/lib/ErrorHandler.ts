import { Node } from "postcss";

class ErrorHandler {
	private node: Node;
	private errorMessagePrefix: string;

	constructor(node: Node) {
		this.node = node;
		this.errorMessagePrefix = "[PostCSS-Media-Query-Importer]: ";
	}

	error(message: string) {
		return this.node.error(this.errorMessagePrefix + message);
	}
}

export default ErrorHandler;
