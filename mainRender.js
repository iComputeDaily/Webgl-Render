function main() {
	const canvas = document.querySelector("#glCanvas");
	const gl = canvas.getContext("experimental-webgl");

	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}
window.onload = main;
