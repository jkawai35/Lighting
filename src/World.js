// Jaren Kawai
// jkawai@ucsc.edu

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    //v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec3 u_cameraPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightColor;
  uniform bool u_lightOn;
  varying vec4 v_VertPos;
  uniform int u_whichTexture;

  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightDir;
  uniform float u_spotlightCosineCutoff;
  uniform float u_spotlightExponent;
  uniform vec3 u_spotlightColor;

  void main() {

    if (u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);

    }else if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;

    } else if (u_whichTexture == -1){
      gl_FragColor = vec4(v_UV,1,1);

    } else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);

    } else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);

    } else {
      gl_FragColor = vec4(1,.2,.2,1);

    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = dot(lightVector, lightVector);

    //if (r< 4.0){
      //gl_FragColor = vec4(1,0,0,1);
    //}else if (r < 6.0){
      //gl_FragColor = vec4(0,1,0,1);
    //}
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    float specular = pow(max(dot(E,R), 0.0), 10.0) * 0.5;
    vec3 specularHighlight = u_lightColor * specular;

    vec3 diffuse = u_lightColor * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = u_lightColor * vec3(gl_FragColor) * 0.2;

    
    vec3 L_spotlight = normalize(u_spotlightPos - vec3(v_VertPos));
    vec3 D = -normalize(u_spotlightDir);
    float spotCosine = dot(D, L_spotlight);
    float spotFactor = 0.0;

    if (spotCosine >= u_spotlightCosineCutoff) {
        spotFactor = pow(spotCosine, u_spotlightExponent);
    }

    // Spotlight diffuse and specular contribution
    vec3 spotlightDiffuse = spotFactor * u_spotlightColor * vec3(gl_FragColor) * max(dot(N, L_spotlight), 0.0);

    if (u_lightOn || u_spotlightOn){
      vec3 finalColor = vec3(0.0);
      if (u_lightOn){
        finalColor += diffuse + ambient;
      }
      if (u_spotlightOn){
        finalColor += spotlightDiffuse;
      }
      if (u_whichTexture == -2){
        gl_FragColor = vec4(specularHighlight+finalColor, 1.0);
        if (u_spotlightOn && !u_lightOn){
          gl_FragColor = vec4(finalColor, 1.0);
        }
      } else{
        gl_FragColor = vec4(finalColor, 1.0);
      }
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_spotlightColor;
let u_spotlightCosineCutoff;
let u_spotlightDir;
let u_spotlightExponent;
let u_spotlightOn;
let u_spotlightPos;
let u_lightColor;
let g_mouseX = 0;
let g_mouseY = 0;
let g_lightColor = [1,1,1,1]



function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture){
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos){
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0){
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0){
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  
  u_NormalMatrix  = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix){
    console.log('Failed to get the storage location of u_normalMatrix');
    return;
  }
  

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0){
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1){
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2){
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }
  
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3){
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  /*
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4){
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }
  */
  
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos){
    console.log('Failed to get the storage location of u_cameraPos');
    return false;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  if (!u_spotlightDir){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightCosineCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCosineCutoff');
  if (!u_spotlightCosineCutoff){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightExponent = gl.getUniformLocation(gl.program, 'u_spotlightExponent');
  if (!u_spotlightExponent){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
  if (!u_spotlightColor){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor){
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  /*
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  */

  /*
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  */

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let rainbowMode = false;
let g_yellowAngle = 0;
let g_pawAngle = 0;
let g_yellowAnimation = false;
let g_extraAnimation = false;
let g_bodyAngle = 0;
let g_tailAngle = 0;
let g_animalMatrix = new Matrix4();
let g_animalSpin = 0;
let g_cameraAngle = 0;
let g_sliderAngle = 0;
let g_camera = new Camera();
let g_mouseDelta = new Vector3();
let normalON = false;
let g_lightPos = [14,5,20];
let g_lightOn = false;
let g_spotOn = false;
let g_spotlightPos = [14,3,16];
let g_spotlightExp = 1;
let g_spotlightDir = [0,-1,0];
let g_spotlightCosCutoff = .05;
let g_spotlightColor = [4,4,4];
let g_camMove = true;
let g_NormMatrix = new Matrix4();

g_animalMatrix.translate(-12,-3,-10);
g_animalMatrix.rotate(180,1,0,0);
g_animalMatrix.scale(1,-1,-1);
g_animalMatrix.scale(2,2,2);

function addActionsFromUI(){

  //Button information
  document.getElementById('normalOn').onclick = function() { normalON = true; };
  document.getElementById('normalOff').onclick = function() { normalON = false; };

  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

  document.getElementById('spotOn').onclick = function() { g_spotOn = true; };
  document.getElementById('spotOff').onclick = function() { g_spotOn = false; };

  document.getElementById('moveOn').onclick = function() { g_camMove = true; };
  document.getElementById('moveOff').onclick = function() { g_camMove = false; };

  //Slider information
  document.getElementById('lightX').addEventListener('mousemove', function() { g_lightPos[0] = this.value; renderAllShapes()});
  document.getElementById('lightY').addEventListener('mousemove', function() { g_lightPos[1] = this.value; renderAllShapes()});
  document.getElementById('lightZ').addEventListener('mousemove', function() { g_lightPos[2] = this.value; renderAllShapes()});

  document.getElementById('redSlide').addEventListener('mousemove', function() { g_lightColor[0] = this.value/255; renderAllShapes()});
  document.getElementById('greenSlide').addEventListener('mousemove', function() { g_lightColor[1] = this.value/255; renderAllShapes()});
  document.getElementById('blueSlide').addEventListener('mousemove', function() { g_lightColor[2] = this.value/255; renderAllShapes()});



}

function initTextures(){
  //texture0
  var image0 = new Image();
  if (!image0){
    console.log('Failed to create image object');
    return false;
  }

  image0.onload = function(){ sendImageToTEXTURE0(image0);};
  image0.src = 'netherblockrs1.jpg';

  //texture1
  var image1 = new Image();
  if (!image1){
    console.log('Failed to create image object');
    return false;
  }
  
  image1.onload = function(){ sendImageToTEXTURE1(image1);};
  image1.src = 'dirt.jpg';

  //texture2
  var image2 = new Image();
  if (!image2){
    console.log('Failed to create image object');
    return false;
  }

  
  image2.onload = function(){ sendImageToTEXTURE2(image2);};
  image2.src = 'netherbackgroundrs.jpg';

  //texture3
  var image3 = new Image();
  if (!image3){
    console.log('Failed to create image object');
    return false;
  }

  
  image3.onload = function(){ sendImageToTEXTURE3(image3);};
  image3.src = 'lava.jpg'; 

  //texture4
  var image4 = new Image();
  if (!image4){
    console.log('Failed to create image object');
    return false;
  }

  
  image4.onload = function(){ sendImageToTEXTURE4(image4);};
  image4.src = 'netherrs.png'; 
  return true;
}

function sendImageToTEXTURE0(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log('Failed to create the texture object');
    return false;
  } 

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler0, 0);

  console.log("finished nether block");
}


function sendImageToTEXTURE1(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log('Failed to create the texture object');
    return false;
  } 

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE1);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  console.log("finished dirt");
}

function sendImageToTEXTURE2(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log('Failed to create the texture object');
    return false;
  } 

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE2);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log("finished background");
}

function sendImageToTEXTURE3(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log('Failed to create the texture object');
    return false;
  } 

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE3);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler3, 3);

  console.log("finished lava");
}

function sendImageToTEXTURE4(image){
  var texture = gl.createTexture();
  if (!texture){
    console.log('Failed to create the texture object');
    return false;
  } 

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE4);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler4, 4);

  console.log("finished netherrack");
}

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addActionsFromUI();

  initTextures();

  //initTextures();

  document.onkeydown = keydown;
  //canvas.onmousedown = click;
  // Register function (event handler) to be called on a mouse press

  // Specify the color for clearing <canvas>
  gl.clearColor(0.678, 0.847, 0.902, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  requestAnimationFrame(tick);

  let lastMouseX = null;
  let lastMouseY = null;

  /*
  canvas.addEventListener("click", function(event) {
    let gridPos = g_camera.getGridPositionInFront();
    console.log(gridPos);
    if (event.buttons == 0){
      addBlock(gridPos.z, gridPos.x);
    }
    if (event.buttons == 2){
      removeBlock(gridPos.z, gridPos.x);
    }
    
});
*/
  
  canvas.onmousedown = function (ev) {
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;

    canvas.onmouseup = function () {
      canvas.onmousemove = null;
    };
  
    canvas.onmousemove = function (ev) {
      if (lastMouseX !== null && lastMouseY !== null) {
        let dx = ev.clientX - lastMouseX; // Left-right movement
        let dy = ev.clientY - lastMouseY; // Up-down movement
              
        let sensitivity = 0.5; // Adjust sensitivity as needed
  
        if (dx > 0) {
          g_camera.turnRight(dx * sensitivity);
        } else if (dx < 0) {
          g_camera.turnLeft(-dx * sensitivity);
        }
  
        if (dy > 0){
          g_camera.lookUp(-dy * sensitivity);
        } else if (dy < 0) {
          g_camera.lookDown(dy * sensitivity);
        }
  
      }
  
      lastMouseX = ev.clientX;
      lastMouseY = ev.clientY;
    };
  };
}

function addBlock(x,y) {
  if (x >= 0 && x <= 32 && y >= 0 && y <= 32){
    g_map[x-2][y] = g_map[x-2][y] + 1
    if (g_map[x-2][y] == 0){
      g_map[x-2][y] = 1;
    }
  }
  drawMap();
}

function removeBlock(x,y) {
  if (x >= 0 && x <= 32 && y >= 0 && y <= 32){
    g_map[x-2][y] = g_map[x-2][y] - 1
    if (g_map[x-2][y] == 0){
      g_map[x-2][y] = -1;
    }
  }
  drawMap();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if (g_camMove){
    g_lightPos[0] = 14 + (10* Math.cos(g_seconds));
  }
}


function keydown(ev){
  let d = new Vector3();


  if (ev.keyCode == 87){
    g_camera.forward();

  } else if (ev.keyCode == 83){
    g_camera.backward();

  } else if (ev.keyCode == 65){
    g_camera.left();

  } else if (ev.keyCode == 68){
    g_camera.right();

  }else if (ev.keyCode == 81){
    g_camera.turnLeft();
    
  }else if (ev.keyCode == 69){
    g_camera.turnRight();

  }else if (ev.keyCode == 67){ //c for place
    addBlock(ev);
  }else if (ev.keyCode == 82){
    removeBlock(ev);
  }else{
    console.log("something else");
  }
}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

var g_map = [
  [7, 5, 5, 7, 5, 6, 8, 6, 7, 4, 6, 8, 5, 8, 4, 6, 5, 8, 5, 6, 6, 7, 4, 8, 6, 7, 5, 8, 6, 8, 7, 8,],
  [6, 4, 5, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 4, 6, 7, 8, 7, 6,],
  [5, 3, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 6, 7, 6, 5,],
  [8, 4, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 6, 8, 8,],
  [6, 5, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4,],
  [7, 6, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 5, 6,],
  [4, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4,],
  [5, 2, 2, 0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 1, 1, 9, 1, 9, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 5,],
  [8, 1, 0, 0, 0, 0, 0, 0, 9, 1, 1, 3, 5, 3, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 8,],
  [5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8,],
  [8, 0, 0, 0, 0, 0, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 0, 0, 0, 6,],
  [4, 0, 0, 0, 0, 0, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 0, 0, 4,],
  [6, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 0, 6,],
  [4, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 6,],
  [8, 0, 0, 0, 0, 9, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 4,],
  [5, 0, 0, 0, 0, 9, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 5,],
  [6, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 8,],
  [6, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 8,],
  [7, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 6,],
  [4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 0, 0, 4,],
  [4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 5,],
  [6, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 9, 0, 0, 0, 0, 0, 1, 7,],
  [8, 0, 0, 0, 0, 0, 0, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 9, 0, 0, 0, 0, 0, 1, 2, 6,],
  [5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 2, 3, 5,],
  [4, 2, 1, 0, 0, 0, 0, 0, 0, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 0, 0, 0, 1, 1, 3, 3, 8,],
  [5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 9, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 6,],
  [6, 5, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 9, 1, 1, 2, 3, 2, 1, 1, 9, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5,],
  [7, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 9, 9, 0, 0, 0, 0, 0, 0, 0, 1, 3, 4, 5, 6, 7,],
  [5, 5, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 5, 6, 7, 6,],
  [6, 5, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 4, 6, 7, 8, 8,],
  [7, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 5, 7, 7, 8, 7,],
  [8, 7, 5, 6, 5, 6, 8, 6, 7, 4, 7, 8, 5, 8, 4, 6, 5, 8, 5, 6, 6, 7, 4, 5, 6, 4, 5, 6, 8, 8, 7, 8,],

];

function drawMap(){
  for(x = 0; x < 32; x++){
    for(y = 0; y < 32; y++){
      if (g_map[x][y] == 0){
        var block = new Cube();
        block.textureNum = 3;
        block.matrix.translate(y-4, -3, x-4);
        if (normalON) block.textureNum = -3;
        block.renderNormal();
      }
      if (g_map[x][y] > 0){
        if (g_map[x][y] == 9){
          var block = new Cube();
          block.textureNum = 0;
          block.matrix.translate(y-4, -3, x-4);
          if (normalON) block.textureNum = -3;
          block.renderNormal();
          continue
        }
        var block = new Cube();
        block.textureNum = 0;
        block.color = [1, 1, 1, 1];
        block.matrix.translate(y-4, -3, x-4);
        if (normalON) block.textureNum = -3;
        block.renderNormal();
      }
      if (g_map[x][y] > 1 && g_map[x][y] < 9)
      {
        for (z = 0; z < g_map[x][y]; z++){
          var block = new Cube();
          block.textureNum = 0;
          block.color = [1, 1, 1, 1];
          block.matrix.translate(y-4, z-3, x-4);
          if (normalON) block.textureNum = -3;
          block.renderNormal();
        }
      }
    }
  }
}

function renderAllShapes(){

  var startTime = performance.now();
  //var totalRotationX = -g_globalAngleX + parseFloat(-g_cameraAngle);

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(-g_cameraAngle, 0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //var normMat = new Matrix4();
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_NormMatrix.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1f(u_lightOn, g_lightOn);
  gl.uniform1f(u_spotlightOn, g_spotOn);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform3fv(u_spotlightDir, g_spotlightDir);
  gl.uniform1f(u_spotlightExponent, g_spotlightExp);
  gl.uniform1f(u_spotlightCosineCutoff, g_spotlightCosCutoff);
  gl.uniform3fv(u_spotlightColor, g_spotlightColor);

  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  


  var light = new Cube();
  if (normalON) light.textureNum = -3;
  light.color = [2,2,0,1];

  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  //light.matrix.translate(0,0,-3);
  light.matrix.scale(-.4,-.4,.4);
  light.matrix.rotate(180,1,0,0)
  light.matrix.rotate(180,0,1,0);

  light.renderNormal();
 
  var sky = new Cube();
  sky.color = [.3,0,0,1];
  if (normalON) sky.textureNum = -3;
  sky.matrix.scale(-35,-40,-35);
  sky.matrix.translate(-.85,-.8,-.8);

  sky.renderNormal();
  
  var moon1 = new Sphere();
  moon1.color = [1,.5,0,1];
  if (normalON) moon1.textureNum = -3;
  moon1.matrix.translate(5, 15, 25);
  moon1.matrix.scale(3,3,3);

  moon1.render();

  var moon2 = new Sphere();
  moon2.color = [1,.8,0,1];
  if (normalON) moon2.textureNum = -3;
  moon2.matrix.translate(20, 18, 25);
  moon2.matrix.scale(2.5,2.5,2.5);

  moon2.render();


  drawMap();  
  
  //14-11
  var body = new Cube();
  body.matrix = new Matrix4(g_animalMatrix);
  body.color = [.1, .1, 0.1, 1.0];
  body.textureNum = -2;
  if (normalON) body.textureNum = -3;
  body.matrix.translate(11, 1, 14);
  body.matrix.scale(.6, 1, .6);
  body.matrix.rotate(-10,0,0,1);
  var bodyMatrix = new Matrix4(body.matrix);
  body.renderNormal();

  var body2 = new Cube();
  body2.matrix = new Matrix4(g_animalMatrix);
  body2.color = [.8, .7, 0.54, 1.0];
  body2.textureNum = -2;
  if (normalON) body2.textureNum = -3;
  body2.matrix.translate(14, 1, 14);
  body2.matrix.scale(.6, 1, .6);
  body2.matrix.rotate(10,0,0,1);
  body2.renderNormal();

  var arml2 = new Cube();
  arml2.matrix = new Matrix4(g_animalMatrix);
  arml2.color = [.8, .7, 0.54, 1.0];
  arml2.textureNum = -2;
  if (normalON) arml2.textureNum = -3;
  arml2.matrix.translate(14, 1.5, 14.5);
  arml2.matrix.scale(1, .4, .5);
  arml2.matrix.rotate(-10,0,0,1);
  arml2.renderNormal();

  var armr2 = new Cube();
  armr2.matrix = new Matrix4(g_animalMatrix);
  armr2.color = [.8, .7, 0.54, 1.0];
  armr2.textureNum = -2;
  if (normalON) armr2.textureNum = -3;
  armr2.matrix.translate(13, 1.5, 13.5);
  armr2.matrix.scale(1, .4, .5);
  armr2.matrix.rotate(-10,0,0,1);
  armr2.renderNormal();

  var legl2 = new Cube();
  legl2.matrix = new Matrix4(g_animalMatrix);
  legl2.color = [.4, 0.2, 0.0, 1.0];
  legl2.textureNum = -2;
  if (normalON) legl2.textureNum = -3;
  legl2.matrix.translate(14, 1, 13.7);
  legl2.matrix.scale(1.5, .4, .4);
  legl2.matrix.rotate(-20,0,0,1);
  legl2.renderNormal();

  var legr2 = new Cube();
  legr2.matrix = new Matrix4(g_animalMatrix);
  legr2.color = [.4, 0.2, 0.0, 1.0];
  legr2.textureNum = -2;
  if (normalON) legr2.textureNum = -3;
  legr2.matrix.translate(12.9, 1, 14.4);
  legr2.matrix.scale(1.5, .4, .4);
  legr2.matrix.rotate(-20,0,0,1);
  legr2.renderNormal();
  
  var head2 = new Cube();
  head2.matrix = new Matrix4(g_animalMatrix);
  head2.color = [.9, 0.6, 0.0, 1.0];
  head2.textureNum = -2;
  if (normalON) head2.textureNum = -3;
  head2.matrix.translate(13.9, 2, 14);
  head2.matrix.scale(.6, .5, .6);
  head2.matrix.rotate(10,0,0,1);
  head2.renderNormal();

  var head = new Cube();
  head.matrix = new Matrix4(g_animalMatrix);
  head.color = [.9, 0.6, 0.0, 1.0];
  head.textureNum = -2;
  if (normalON) head.textureNum = -3;
  head.matrix.translate(11.1, 2, 14);
  head.matrix.scale(.6, .5, .6);
  head.matrix.rotate(-10,0,0,1);
  head.renderNormal();

  var arml = new Cube();
  arml.matrix = new Matrix4(g_animalMatrix);
  arml.color = [.4, 0.2, 0.0, 1.0];
  arml.textureNum = -2;
  if (normalON) arml.textureNum = -3;
  arml.matrix.translate(11.1, 1.5, 14.5);
  arml.matrix.scale(1, .4, .5);
  arml.matrix.rotate(-10,0,0,1);
  armMat = arml.matrix;
  arml.renderNormal();

  var armr = new Cube();
  armr.matrix = new Matrix4(g_animalMatrix);
  armr.color = [.4, 0.2, 0.0, 1.0];
  armr.textureNum = -2;
  if (normalON) armr.textureNum = -3;
  armr.matrix.translate(10.5, 1.5, 13.5);
  armr.matrix.scale(1, .4, .5);
  armr.matrix.rotate(-10,0,0,1);
  armr.renderNormal();

  var saber = new Cube();
  saber.matrix = new Matrix4(armMat);
  saber.color = [.5, .5, 1.0, 1.0];
  saber.textureNum = -2;
  if (normalON) saber.textureNum = -3;
  saber.matrix.translate(.8, 4, .2);
  saber.matrix.scale(-.2, 3, .5);
  saber.matrix.rotate(-93,0,0,1);
  saber.renderNormal();

  var saber2 = new Cube();
  saber2.matrix = new Matrix4(armMat);
  saber2.color = [.5, .5, 1.0, 1.0];
  saber2.textureNum = -2;
  if (normalON) saber2.textureNum = -3;
  saber2.matrix.translate(2.2, 4, -1.6);
  saber2.matrix.scale(-.2, 3, .5);
  saber2.matrix.rotate(-87,0,0,1);
  saber2.renderNormal();
  
  
  var legr = new Cube();
  legr.color = [.1, .1, .1, 1.0];
  legr.matrix = bodyMatrix;
  legr.textureNum = -2;
  if (normalON) legr.textureNum = -3;
  legr.matrix.scale(2.5, .4, .5);
  legr.matrix.translate(.2,0,0);
  legr.matrix.rotate(-10,0,0,1);
  legMat = new Matrix4(legr.matrix);
  legr.renderNormal();

  var legl = new Cube();
  legl.color = [.1, 0.1, 0.1, 1.0];
  legl.matrix = legMat;
  legl.textureNum = -2;
  if (normalON) legl.textureNum = -3;
  legl.matrix.translate(-1,0,.7);
  legl.matrix.rotate(-50,0,0,1);
  legl.renderNormal();
  

  var duration = performance.now() - startTime;
  sendTextToHTML(" fps: " + Math.floor(10000/duration)/10, "numdot");
}

//set the text of HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log('Failed to get ' + htmlID + ' from HTML');
    return;
  }
  htmlElm.innerHTML = text;
}
