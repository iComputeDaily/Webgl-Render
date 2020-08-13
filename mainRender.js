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
	
	
	/*Get The Location Of The Shaders Properties And Store Them In An Object
	========================================================================*/
	
	const programLocations = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		}
	};
	
	const buffers = initBuffers(gl); // Create the buffers that define the shapes
}


/*Turn The Shader Source Into A Shader Program
==============================================*/

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


/*Compiles The Shader Source
============================*/

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


/*Create The Buffers That Define The Shapes
===========================================*/

function initBuffers(gl) {
	
	
	/*Create The Buffer Of Vertex Positions
	=======================================*/
	
	const positionBuffer = gl.createBuffer(); // Create a buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Make the created buffer the "active" buffer of the context
	
	// Define the position of the vertecies
	const positions = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		
		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		
		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		
		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		
		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		
		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // Give opengl the positions
	
	
	/*Create The Buffer For The Index
	=================================
	The index will be used to reffer to the positions array*/
	
	const indexBuffer = gl.createBuffer(); // Create a buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // Make the created buffer the "active" buffer of the context
	
	// Define the index numbers
	const indices = [
		0,  1,  2,      0,  2,  3,    // front
		4,  5,  6,      4,  6,  7,    // back
		8,  9,  10,     8,  10, 11,   // top
		12, 13, 14,     12, 14, 15,   // bottom
		16, 17, 18,     16, 18, 19,   // right
		20, 21, 22,     20, 22, 23,   // left
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); // Give opengl the index
	
	// Pass the data back to the rest of the program
	return {
		position: positionBuffer,
		indices: indexBuffer
	};
}


window.onload = main;
