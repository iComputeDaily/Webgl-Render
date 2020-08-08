function main() {
	
	
	/*Initialize The OpenGL Context
	===============================*/
	
	const canvas = document.querySelector("#glCanvas"); // Find the element we want to draw to
	const gl = canvas.getContext("experimental-webgl"); // Get the context
	
	// Exit if something went worng
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	
	
	/*Source Code For The Shaders
	=============================*/
	
	// Vertex shader
	const vertexSource = `
		attribute vec4 aVertexPosition;
		
		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		
		void main(void) {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		}
	`;
	
	// Fragment shader
	const fragmentSource = `
		void main(void) {
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
		}
	`;
	
	const shaderProgram = initShaderProgram(gl, vertexSource, fragmentSource); // Turn the source code into a shader program
}

function initShaderProgram(gl, vertexSource, fragmentSource) {
	
	// Compile the shader
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	
	// Turn the shaders into a shader program
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	// Exit if something went wrong
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	
	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type); // Create the shader object where the result will be stored
	
	gl.shaderSource(shader, source); // Adds the source code to the shader object
	gl.compileShader(shader); // Compiles the shader code
	
	// Exit is something went wrong
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}

window.onload = main;
