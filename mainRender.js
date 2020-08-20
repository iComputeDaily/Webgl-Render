import {mat4} from './glmatrix/index.js'; // Import a library for dealing with matricies

var cubeRotation = 0.0; // Set how much the cube should rotate

main();

function main() {
	
	
	/*Initialize The OpenGL Context
	===============================*/
	
	const canvas = document.querySelector("#glCanvas"); // Find the element we want to draw to
	
	canvas.width = canvas.clientWidth; // Make shure the browser and webgl agree on the width
	canvas.height = canvas.clientHeight; // Make shure the browser and webgl agree on the height
	
	const gl = canvas.getContext('experimental-webgl'); // Get the context
	
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
	
	const programInfo = {
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
	
	
	/*Set Up The Keyboard
	=====================*/
	
	var keyStatus = initKeyObject(); // Create an object to store the keyboard state
	document.addEventListener("keydown", function(){keyDownCallback(event, keyStatus)}); // Add function to handle button presses
	document.addEventListener("keyup", function(){keyUpCallback(event, keyStatus)}); // Add a function to handle button releases
	
	
	/*Finaly Actualy Render The Scene
	=================================*/
	
	var then = 0; // Make a variable to store the last time
	
	function render(now) {
		now *= 0.001; // Aparently convert to seconds, but idk
		const deltaTime = now - then; // See how much time has passed since the last frame
		then = now; // Update the time of the last frame
		
		drawScene(gl, programInfo, buffers, deltaTime, keyStatus); // Call the function that draws the scene
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
		// cube Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		
		// cube Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		
		// cube Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		
		// cube Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		
		// cube Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		
		// cube Left face
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
		0,  1,  2,      0,  2,  3,    // cube front
		4,  5,  6,      4,  6,  7,    // cube back
		8,  9,  10,     8,  10, 11,   // cube top
		12, 13, 14,     12, 14, 15,   // cube bottom
		16, 17, 18,     16, 18, 19,   // cube right
		20, 21, 22,     20, 22, 23,   // cube left
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); // Give opengl the index
	
	// Pass the data back to the rest of the program
	return {
		position: positionBuffer,
		indices: indexBuffer
	};
}


/*Create An Object To Store The Keyboard State
==============================================*/

function initKeyObject() {
	var keyStatus = {
		forwardKey: {
			totalTimePressed: 0,
			timeLastPressed: 0,
			pressedNow: false
		},
		leftKey: {
			totalTimePressed: 0,
			timeLastPressed: 0,
			pressedNow: false
		},
		backwardKey: {
			totalTimePressed: 0,
			timeLastPressed: 0,
			pressedNow: false
		},
		rightKey: {
			totalTimePressed: 0,
			timeLastPressed: 0,
			pressedNow: false
		}
	};
	return keyStatus;
}


/*Function To handle Button Presses
===================================*/

function keyDownCallback(event, keyStatus) {
	event.stopImmediatePropagation(); // Stop the event from triggering twice
	
	// Stop the event from trigering multiple times on held key
	if (event.repeat == true) {
		return;
	}
	
	// Determine what key was pressed and update paramaters in the object
	switch (event.code) {
		case 'KeyW':
			keyStatus.forwardKey.timeLastPressed = performance.now(); // Set to current time
			keyStatus.forwardKey.pressedNow = true; // I hope it is obvios what this dose
			break;
		case 'KeyA':
			keyStatus.leftKey.timeLastPressed = performance.now();
			keyStatus.leftKey.pressedNow = true;
			break;
		case 'KeyS':
			keyStatus.backwardKey.timeLastPressed = performance.now();
			keyStatus.backwardKey.pressedNow = true;
			break;
		case 'KeyD':
			keyStatus.rightKey.timeLastPressed = performance.now();
			keyStatus.rightKey.pressedNow = true;
			break;
	}
	console.log(keyStatus); // Will probobly need this for debuging later
	return;
}


/*Function To Handle Button Releaces
====================================*/

function keyUpCallback(event, keyStatus) {
	event.stopImmediatePropagation(); // Stop the event from triggering twice
	
	// Stop the event from trigering multiple times on held key
	if (event.repeat == true) {
		return;
	}
	
	// Determine what key was pressed and update paramaters in the object
	switch (event.code) {
		case 'KeyW':
			keyStatus.forwardKey.totalTimePressed += performance.now() - keyStatus.forwardKey.timeLastPressed; // The total time the button was pressed for is the current time minus the time it was last pressed, added to any previous time it was pressed for
			keyStatus.forwardKey.timeLastPressed = 0; // To prevent any repeat events that still sometimes ocur *sigh* from adding the number twice
			keyStatus.forwardKey.pressedNow = false;// I hope it is obvios what this dose
			break;
		case 'KeyA':
			keyStatus.leftKey.totalTimePressed += performance.now() - keyStatus.leftKey.timeLastPressed;
			keyStatus.leftKey.timeLastPressed = 0;
			keyStatus.leftKey.pressedNow = false;
			break;
		case 'KeyS':
			keyStatus.backwardKey.totalTimePressed += performance.now() - keyStatus.backwardKey.timeLastPressed;
			keyStatus.backwardKey.timeLastPressed = 0;
			keyStatus.backwardKey.pressedNow = false;
			break;
		case 'KeyD':
			keyStatus.rightKey.totalTimePressed += performance.now() - keyStatus.rightKey.timeLastPressed;
			keyStatus.rightKey.timeLastPressed = 0;
			keyStatus.rightKey.pressedNow = false;
			break;
	}
	console.log(keyStatus); // Will probobly need this for debuging later
	return
}


/*Finaly Actualy Draw The Scene
===============================*/

function drawScene(gl, programInfo, buffers, deltaTime, keyStatus) {
	
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
	
	const cords = getCords(keyStatus); // Turn key presses into cordinates
	console.log(cords); // Will probobly need this for debugging
	
	// Create a combined veiw and model matrix
	const modelViewMatrix = mat4.create(); // Create a matrix
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // Translate the camera back 6 units
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]); // Rotate the cube around the z axis
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [0, 1, 0]); // Rotate the cube around the y axis
	
	// Tell opengl to use the vertex positions in the vertex shader.
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position); // Get the position buffer ready to be writen to
	
	{ // Tell opengl where the vertecies are
	const numComponents = 3; // The number of items that specify one vertex
	const type = gl.FLOAT; // The type that we use to store the vertecies
	const normalize = false; // Weather the numbers should be converted to vales between -1 and 1
	const stride = 0; // How many bytes between the vertecies in the array
	const offset = 0; // How many from the begining of the array before the vertecies
	gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset); // Give all the data to opengl (The first paramater is the index)
	}
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition); // Enable the atribute so that it will actualy get used
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices); // Tell opengl what buffer should be used for the index
	
	gl.useProgram(programInfo.program); // Tell opengl the use our shader program
	
	// Set what matricies to use
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, // Set the projection matrix to use
		false, // Don't transpose the matrix
		projectionMatrix); // Set it to projectionMatrix
	
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, // Set the veiw matrix to use
		false, // Don't transpose the matrix
		modelViewMatrix); // Set it to modelViewMatrix
	
	{ // Draw the scene (no for real this time)
	const vertexCount = 36; // How many vertecies to render
	const type = gl.UNSIGNED_SHORT; // What type the numbers are
	const offset = 0; // How far to the start of the vertecies
	gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
	
	cubeRotation += deltaTime; // Update cubeRotation
}


/*Turn Key Presses Into Cordinates
==================================*/

function getCords(keyStatus) {
	var cords = {x: 0, y: 0, z: 0};
	
	var plusX = 0;
	var minusX = 0;
	var plusY = 0;
	var minusY = 0;
	var plusZ = 0;
	var minusZ = 0;
	
	// West
	minusX -= keyStatus.leftKey.totalTimePressed; // Set the variable to the total time pressed(minus currently pressed time)
	if (keyStatus.leftKey.pressedNow == true) {minusX -= (performance.now() - keyStatus.leftKey.timeLastPressed);} // If the key is currently pressed add the missing time, as the totalTimePressed variable has not been updated
	minusX *= 0.001; // Scale the result down to a reasonalbe number
	
	// East
	plusX = keyStatus.rightKey.totalTimePressed;
	if (keyStatus.rightKey.pressedNow == true) {plusX += (performance.now() - keyStatus.rightKey.timeLastPressed);}
	plusX *= 0.001;
	
	// Down
	// minusX -= keyStatus.leftKey.totalTimePressed;
	// if (keyStatus.leftKey.pressedNow == true) {minusX -= (performance.now() - keyStatus.leftKey.timeLastPressed);}
	// minusX *= 0.001;
	
	// Up
	// plusX = keyStatus.rightKey.totalTimePressed;
	// if (keyStatus.rightKey.pressedNow == true) {plusX += (performance.now() - keyStatus.rightKey.timeLastPressed);}
	// plusX *= 0.001;
	
	// North
	minusZ -= keyStatus.forwardKey.totalTimePressed;
	if (keyStatus.forwardKey.pressedNow == true) {minusZ -= (performance.now() - keyStatus.forwardKey.timeLastPressed);}
	minusZ *= 0.001;
	
	// South
	plusZ += keyStatus.backwardKey.totalTimePressed;
	if (keyStatus.backwardKey.pressedNow == true) {plusZ += (performance.now() - keyStatus.backwardKey.timeLastPressed);}
	plusZ *= 0.001;
	
	// Add the values together and put them in their final place
	cords.x = plusX + minusX;
	cords.y = plusY + minusY;
	cords.z = plusZ + minusZ;
	
	return cords;
}


window.onload = main;
