function main() {
	const canvas = document.querySelector("#glCanvas"); // Find the element we want to draw to
	const gl = canvas.getContext("experimental-webgl"); // Get the context
	
	// Exit if something went worng
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	const vertexSource = `
		attribute vec4 aVertexPosition;

		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		
		void main(void) {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		}
	`;
	
	const fragmentSource = `
		void main(void) {
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
	`;
	
	const shaderProgram = initShaderProgram(gl, vertexSource, fragmentSource);
}

function initShaderProgram(gl, vertexSource, fragmentSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	
	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}

window.onload = main;
