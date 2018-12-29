/*
* 
* SETTINGS
*
*/
const DEFAULT_COLOR = '#0095DD';
const DEFAULT_HOVER_COLOR = "#FF95DD";
const DEFAULT_CLICK_COLOR = "#000000";
const DEFAULT_FONT_SIZE = 16;
const PUSHBUTTON_WIDTH = 80;
const PUSHBUTTON_HEIGHT = 40;
const JOYSTICK_RADIUS = 80;
const FRAME_RATE = 30;

/*
* 
* USER INTERFACE
*
*/
let canvas = document.getElementById('controller');
let context = canvas.getContext('2d');
let uiElements = [];

let mouse = {           // keeps track of mouse state
  x: undefined,
  y: undefined,
  down: false
};

function mainLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);     // clear canvas
  performUiActions();                                       // perform UI actions for each UI element
  uiElements.forEach(element => {element.draw(context);});  // draw UI elements
  sendCommands();                                           // send out any commands over websocket
}

function performUiActions() {
  uiElements.forEach( element => {
    if (element.hovered) {element._onHover();}
    if (element.clicked) {element._onClick();}
    if (element.mouseUp) {element._onMouseUp();}
  });
}

function updateUiElements() {
  uiElements.forEach( element => {
    if (element.isHovered(mouse.x, mouse.y)) {    // check if mouse is hovering over UI element
      element.hovered = true;
      if (mouse.down) {
        element.clicked = true;                   // clicked only set true if mouse is over UI element and down
      } else {
        element.clicked = false;
      }
    } else {element.hovered = false;}
    if (mouse.down) {
      element.mouseUp = false;
    } else {
      element.mouseUp = true;
      element.clicked = false;                    // if mouse if down, set clicked false
    }
    element.setXY(mouse.x, mouse.y);
  });
}

// TODO: fullscreen doesn't work, used https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
// document.fullscreenElement = document.fullscreenElement || document.mozFullscreenElement
//             || document.msFullscreenElement || document.webkitFullscreenDocument;
// canvas.requestFullscreen = canvas.requestFullscreen || canvas.mozRequestFullscreen
// || canvas.msRequestFullscreen || canvas.webkitRequestFullscreen;
// canvas.requestFullscreen();

function resizeCanvas() {
  canvas.width = window.innerWidth-10;
  canvas.height = window.innerHeight-10;
  window.scrollTo(0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
setInterval(mainLoop, 1000/FRAME_RATE);

/*
*
* MOUSE AND TOUCH CONTROL
*
*/
canvas.addEventListener("mousemove", function(e) {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  updateUiElements();
});

canvas.addEventListener("mousedown", function(e) {
  mouse.down = true;
  updateUiElements();
});
      
canvas.addEventListener("mouseup", function(e) {
  mouse.down = false;
  updateUiElements();
});

// http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
// Set up touch events for mobile, etc
canvas.addEventListener("touchstart", function (e) {
  e.preventDefault();
  for (let i=0; i< e.changedTouches.length; i++) {
    let touch = e.changedTouches[i];
    uiElements.forEach( element => {
      if (element.isHovered(touch.clientX, touch.clientY)) {
        element.touchID = touch.identifier;
        element.hovered = true;
        element.clicked = true;
        element.mouseUp = false;
        element.setXY(touch.clientX, touch.clientY);
      }
    });
  }
}, false);

canvas.addEventListener("touchmove", function (e) {
  e.preventDefault();       // Prevent scrolling when touching the canvas
  for (let i=0; i< e.changedTouches.length; i++) {
    let touch = e.changedTouches[i];
    uiElements.forEach( element => {
      if (element.touchID == touch.identifier) {
        if (element.isHovered(touch.clientX, touch.clientY)) {
          element.hovered = true;
          element.clicked = true;
          element.mouseUp = false;
        } else {element.hovered = false;}
        element.setXY(touch.clientX, touch.clientY);
      }
    });
  }
}, false);

canvas.addEventListener("touchend", function (e) {
  e.preventDefault();       // Prevent scrolling when touching the canvas
  for (let i=0; i< e.changedTouches.length; i++) {
    let touch = e.changedTouches[i];
    uiElements.forEach( element => {
      if (element.touchID == touch.identifier) {
        element.touchID = null;
        element.hovered = false;
        element.clicked = false;
        element.mouseUp = true;
      }
    });
  }
}, false);


/*
*
* KEYBOARD CONTROL
*
*/
// https://stackoverflow.com/questions/12886286/addeventlistener-for-keydown-on-canvas
var KEYS = [];
KEYS[32] = 'KICK';
KEYS[37] = 'LEFT';
KEYS[38] = 'FORWARD';
KEYS[39] = 'RIGHT';
KEYS[40] = 'BACKWARD';

var keysDown = {};

document.addEventListener('keydown', function (e) {
    if (!KEYS[e.which]) return;
    e.preventDefault();
    if (!keysDown[KEYS[e.which]]) {
        keysDown[KEYS[e.which]] = true;
        console.log(KEYS[e.which]);
        // connection.send(KEYS[e.which]);
    }
});

document.addEventListener('keyup', function (e) {
    if (!KEYS[e.which]) return;
    e.preventDefault();
    keysDown[KEYS[e.which]] = false;
    console.log('STOP');
    // connection.send('STOP');
});


/*
* 
* USER INTERFACE - UI ELEMENT
*
*/
// pushbutton(round/rectangle), switch(round/rectangle), joystick, slidebar, LED, lable, checkbox, radio

class UiElement {
  constructor(percentX, percentY) {
    this.percentX = percentX;       // x position of element's center as percentage of canvas, from left to right 
    this.percentY = percentY;       // y position of element's center as percentage of canvas, from top to bottom
    this.shape = 'rectangle';
    this.fontSize = DEFAULT_FONT_SIZE;
    this.color = DEFAULT_COLOR;
    this.hoverColor = DEFAULT_HOVER_COLOR;
    this.cickColor = DEFAULT_CLICK_COLOR;
    this.hovered = false;
    this.clicked = false;
    this.mouseUp = false;
    this.touchID = null;
    this.x = null;     // if mouse over element, mouse x position between -1 and 1 relative to element's center
    this.y = null;     // if mouse over element, mouse x position between -1 and 1 relative to element's center
    this.registerUiElement();
  }

  // add UI element to array of UI elements
  registerUiElement() {
    uiElements.push(this);
  }

  // default actions (can be overriden by specific UI element)
  _onHover() {
    if (typeof this.onHover === 'function') { this.onHover(); }   // execute onHover method if it exists
  }

  // _onNotHover() {
  //   if (typeof this.onNotHover === 'function') { this.onNotHover(); }   // execute onNotHover method if it exists
  // }

  _onClick() {
    if (typeof this.onClick === 'function') { this.onClick(); }   // execute onClick method if it exists
  }

  _onMouseUp() {
    if (typeof this.onMouseUp === 'function') { this.onMouseUp(); }   // execute onMouseUp method if it exists
  }

  // test if mouse is hovered over UI element
  isHovered(x, y) {
    // centerX and centerY are the center coordinates of the UI element
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;

    if (this.shape == 'rectangle') {
      if (x >= centerX - this.width/2 && x <= centerX + this.width/2 &&
          y >= centerY - this.height/2 && y <= centerY + this.height/2) {
        return true;
      }
      return false;
    }
    if (this.shape == 'round') {
      if (Math.sqrt((x - centerX) * (x - centerX)  + (y - centerY) * 
          (y - centerY)) <= this.radius) {
        return true;
      }
    }
    return false;
  }

  // set the x and y coordinates of UI element based on given canvas coordinates
  // x and y coordinates are between -1 and 1 relative to element's center
  // TODO: if canvas coordinates > UI element's boundary, set x and y to closest UI boundary
  setXY(canvasX, canvasY) {
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;

    if (this.shape == 'rectangle') {
      this.x = 2 * (canvasX - centerX) / this.width;
      this.y = -2 * (canvasY - centerY) / this.height;
    }
    if (this.shape == 'round') {
      if (this.hovered) {
        this.x = (canvasX - centerX)/this.radius;
        this.y = (centerY - canvasY)/this.radius;
      } else if (this.clicked) {
        this.x = (canvasX - centerX)/Math.sqrt((canvasX - centerX) * (canvasX - centerX) + (canvasY - centerY) * (canvasY - centerY));
        this.y = (centerY - canvasY)/Math.sqrt((canvasX - centerX) * (canvasX - centerX) + (canvasY - centerY) * (canvasY - centerY));
      }
    }
  }
}

/*
* 
* USER INTERFACE - PUSHBUTTON
*
*/
class Pushbutton extends UiElement {
  constructor(percentX, percentY, text) {
    super(percentX, percentY);
    this.width = PUSHBUTTON_WIDTH;
    this.height = PUSHBUTTON_HEIGHT;
    this.text = text;
    this.priorClickState = false;
  }

  _onClick() {
    if (this.priorClickState == false) {
      if (typeof this.onClick === 'function') { this.onClick(); }   // execute onClick method if it exists
    }
    this.priorClickState = this.clicked;   
  }

  _onMouseUp() {
    if (this.priorClickState == true) {
      if (typeof this.onMouseUp === 'function') { this.onMouseUp(); }   // execute onMouseUp method if it exists
    }
    this.priorClickState = this.clicked;
  }

  draw(context) {
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;

    // set colors
    if (this.clicked) {
      context.fillStyle = this.cickColor;
      context.strokeStyle = this.cickColor;
    } else if (this.hovered) {
      context.strokeStyle = this.hoverColor;
      context.fillStyle = this.hoverColor;
    } else {
      context.strokeStyle = this.color;
      context.fillStyle = this.color;
    }
    
    // draw button
    context.lineWidth = 2;
    context.strokeRect(centerX - this.width/2, centerY - this.height/2, this.width, this.height);
    context.fillRect(centerX - this.width/2 + 4, centerY - this.height/2 + 4, this.width - 8, this.height - 8);

    // draw text
    if (this.text) {      
      context.fillStyle = this.color;
      context.font = this.fontSize + "px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(this.text, centerX, centerY + this.height/2);
    }
  }  
}

/*
* 
* USER INTERFACE - JOYSTICK
*
*/
class Joystick extends UiElement {
  constructor(percentX, percentY, text) {
    super(percentX, percentY);
    this.radius = JOYSTICK_RADIUS;
    this.innerRadius = JOYSTICK_RADIUS/2;
    this.shape = 'round';
    this.text = text;
    this.priorX = 0;
    this.priorY = 0;
  }

  _onClick() {
    if (this.priorX != this.x || this.priorY != this.y) {   // only send message if there's been a change in joystick position
      if (typeof this.onClick() === 'function') {this.onClick();}      
      this.priorX = this.x;
      this.priorY = this.y;
    }
  }

  _onMouseUp() {    
    // move joystick back to center
    this.x = 0;
    this.y = 0;
    if (this.priorX != 0 || this.priorY != 0) {   // only send message if joystick was not in center position
      if (typeof this.onClick() === 'function') {this.onClick();}
      this.priorX = 0;
      this.priorY = 0;
    }
  }

  up() {      // for keyboard presses  
    this.y = 1;
  }
  down() {  // for keyboard presses
    this.y = -1;
  }
  left() {  // for keyboard presses
    this.x = -1;
  }
  right() {  // for keyboard presses
    this.x = 1;
  }
  downRelease() {   // for keyboard presses
    this.y = 0;
  }
  leftRelease() {   // for keyboard presses
    this.x = 0;
  }
  rightRelease() {   // for keyboard presses
    this.x = 0;
  }

  draw(context) {
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;
    
    // set colors
    if (this.clicked) {
      context.fillStyle = this.cickColor;
      context.strokeStyle = this.cickColor;
    } else if (this.hovered) {
      context.strokeStyle = this.hoverColor;
      context.fillStyle = this.hoverColor;
    } else {
      context.strokeStyle = this.color;
      context.fillStyle = this.color;
    }

    // draw joystick
    context.beginPath();
    context.lineWidth = 2;
    context.arc(centerX, centerY, this.radius, 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.lineWidth = 2;
    context.arc(centerX, centerY, 10, 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.arc(centerX + this.x * this.radius, centerY  - this.y * this.radius, this.innerRadius, 0, Math.PI * 2, true);
    context.fill();
    
    // draw text
    if (this.text) {
      context.fillStyle = this.color;
      context.font = this.fontSize + "px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(this.text, centerX, centerY + this.radius);
    }
  }
}


/*
* 
* HELPER FUNCTIONS
*
*/
// see https://www.impulseadventure.com/elec/robot-differential-steering.html
function twoWheelDriveLeftSpeed(x, y) {
  let motorLeft;
  const PIVOT_LIMIT = 0.50;
  if (y >= 0) {   // forward
    motorLeft = (x >= 0) ? 1 : (1 + x);
  } else {        // reverse
    motorLeft = (x >= 0) ? (1 - x) : 1;
  }
  motorLeft = motorLeft * y;    // scale by joystick y
  pivot = (Math.abs(y) > PIVOT_LIMIT) ? 0 : (1 - Math.abs(y)/ PIVOT_LIMIT); // calc pivot scale
  motorLeft = (1 - pivot) * motorLeft + (pivot * x);
  return motorLeft;
}

function twoWheelDriveRightSpeed(x, y) {
  const PIVOT_LIMIT = 0.25;
  if (y >= 0) {
    motorRight = (x >= 0) ? (1 - x) : 1;    // forward
  } else {    // reverse
    motorRight = (x >= 0) ? 1 : (1 + x);
  }
  motorRight = motorRight * y;  // scale by joystick y
  pivot = (Math.abs(y) > PIVOT_LIMIT) ? 0 : (1 - Math.abs(y)/ PIVOT_LIMIT);   // calc pivot scale
  motorRight = (1 - pivot) * motorRight - (pivot * x);
  return motorRight;
}

/*
* 
* USER INTERFACE - WEBSOCKETS
*
*/
const HEARTBEAT_MESSAGE = '--heartbeat--';      // https://django-websocket-redis.readthedocs.io/en/latest/heartbeats.html
const HEARTBEAT_INTERVAL = 1000;
let missedHeartbeats = 0;

let connection = new WebSocket('ws://'+location.hostname+'/ws', ['arduino']);    // use with ESPAsyncWebServer.h
// let connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);      // use with ESP8266WebServer.h

let _messageBuffer=[];
let _connectionStatus = 'disconnected';

connection.onopen = function () {
  console.log("Websocket connected.")
  connection.send('Connect ' + new Date());
  missed_heartbeats = 0;
  heartbeat_interval = setInterval(function() {
    if (_connectionStatus == 'connected')  {
      missedHeartbeats++;
      if (missedHeartbeats >= 3) {
        console.log("Websocket connection lost! Trying to reconnect . . .")
        location.reload(true);
        // connection = new WebSocket('ws://'+location.hostname+'/ws', ['arduino']);
      }
      connection.send(HEARTBEAT_MESSAGE);
    }
  }, HEARTBEAT_INTERVAL);
};

connection.onerror = function (error) {
    _connectionStatus = 'disconnected';
    console.log('WebSocket Error ', error);
    location.reload(true);
};
connection.onmessage = function (e) {
  _connectionStatus = 'connected';
  missedHeartbeats = 0;
  if (e.data == HEARTBEAT_MESSAGE) {
    console.log('Heartbeat received.');
  } else {
    console.log('Server: ', e.data);
  }
};
connection.onclose = function(){
    _connectionStatus = 'disconnected';
    console.log('WebSocket connection closed. Trying to reconnect . . .');
    location.reload(true);
};


function send(message) {
    _messageBuffer.push(message);
}

function sendCommands() {
    let commandString = '';
    if (_connectionStatus == 'connected' && _messageBuffer.length != 0) {
        while (_messageBuffer.length != 0) {
            commandString = commandString + _messageBuffer.shift() + ';';
        }
        connection.send(commandString);
    }
}
