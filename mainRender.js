function main() {
	const canvas = document.querySelector("#glCanvas"); // Find the element we want to draw to
	const gl = canvas.getContext("experimental-webgl"); // Get the context

	// Exit if something went worng
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	// Set the color to clear the buffer with and then clear the buffer
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}
window.onload = main;
