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
	=====================================================================*/
	
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
	
	
	/*Finaly Actualy Render The Scene
	=================================*/
	
	var then = 0; // Make a variable to store the last time
	
	function render(now) {
		now *= 0.001; // Aparently convert to seconds, but idk
		const deltaTime = now - then; // See how much time has passed since the last frame
		then = now; // Update the time of the last frame
		
		drawScene(gl, programInfo, buffers, deltaTime); // Call the function that draws the scene
		requestAnimationFrame(render); // Request the drawing of the next frame
	}
	requestAnimationFrame(render); // Start the animation
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


/*Finaly Actualy Draw The Scene
===============================*/

function drawScene(gl, programInfo, buffers, deltaTime) {
	
	// Set gl values and specify features
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set the color used to clear the buffer to black
	gl.clearDepth(1.0); // Set the depth used to clear the depth buffer to 1.0
	gl.enable(gl.DEPTH_TEST); // Make webgl update the depth buffer
	gl.depthFunc(gl.LEQUAL); // Only draw a fragment if it is not obscured by a closer object
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear everything to start fresh
	
	/* Remember: model cordinates  * model matrix      = world cordinates
	             world cordinates  * veiw matrix       = camera cordinates
	             camera cordinates * projection matrix = homogeneous cordinates(that are deformed to look like they are from the perspective of the camera)*/
	
	// Set info requiered for the projection martix
	const feildOfVeiw = 70; // Set feild of veiw in degrees
	const radFeildOfVeiw = feildOfVeiw * Math.PI / 180; // Convert to radiens
	const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight; // Get the aspect ratio
	const zNear = 0.1; // Don't show objects if closer than this distance
	const zFar = 100.0; // Don't show objects if farther than this distance
	
	// Create the projection matrix
	const projectionMatrix = mat4.create(); // Create a matrix
	mat4.perspective(projectionMatrix, radFeildOfVeiw, aspectRatio, zNear, zFar); // Populate the projection matrix to match the set peramaters
	
	// Create a combined veiw and model matrix
	const modelViewMatrix = mat4.create(); // Create a matrix
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // Translate the camera back 6 units
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]); // Rotate the cube around the z axis
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [0, 1, 0]); // Rotate the cube around the y axis
}

window.onload = main;
