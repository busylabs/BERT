const FRAME_RATE = 30;
let canvas = document.getElementById('controller');
let context = canvas.getContext('2d');
let uiElements = [];
let defaultColor = '#0095DD';

let mouse = {
  x: undefined,
  y: undefined,
  clicked: false,
  down: false
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth-10;
  canvas.height = window.innerHeight-10;
  window.scrollTo(0, 0);
}

function drawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  uiElements.forEach(element => {
    element.draw(context);      
  });
}
setInterval(drawCanvas, 1000/FRAME_RATE);

function updateUiElements() {
  uiElements.forEach( element => {
    if(element.mouseHovered(mouse)) {
      element.hovered = true;
      element.clicked = mouse.clicked;
      if (element.clicked) element.onClick();
    } else if (!element.clicked) {
      element.hovered = false;
      element.clicked = false;
    }
  })
}


canvas.addEventListener("mousemove", function(e) {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
  updateUiElements();
});

canvas.addEventListener("mousedown", function(e) {
  mouse.clicked = !mouse.down;
  mouse.down = true;
  updateUiElements();
});
      
canvas.addEventListener("mouseup", function(e) {
  mouse.down = false;
  mouse.clicked = false;
  uiElements.forEach(element => { 
    element.clicked = false;
  });
});


/***********/
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
