let pushbutton = new Pushbutton(20, 50, 'Kick');
let joystick = new Joystick(80, 50, 'Drive');

pushbutton.onClick = function() {
  console.log("pushbutton clicked at " + pushbutton.x +" , " + pushbutton.y);
};

//pushbutton.onRelease = function() {};

joystick.onClick = function() {
  console.log("joystick clicked at " + joystick.x +" , " + joystick.y);
};
//joystick.onRelease = function() {};


// keyboard('LEFT_ARROW_KEY').onPress = function() {
//   console.log('left arrow pressed');
// }