// let pushbutton = new Pushbutton(25, 50, 'Kick');
let joystick = new Joystick(75, 50, 'Drive');
let leftMotorSpeed, rightMotorSpeed;

// pushbutton.onClick = function() {
//   console.log("pushbutton clicked at " + pushbutton.x +" , " + pushbutton.y);
//   send('kickerServoAngle=90');
// };

//  pushbutton.onMouseUp = function() {
//   send('kickerServoAngle=180');
//  };

joystick.onClick = function() {
  leftMotorSpeed = Math.ceil(twoWheelDriveLeftSpeed(joystick.x, joystick.y) * 2000);  // scale speed
  rightMotorSpeed = Math.ceil(twoWheelDriveRightSpeed(joystick.x, joystick.y) * 2000);  // scale speed
  send("leftMotorSpeed=" + leftMotorSpeed);
  send("rightMotorSpeed=" + rightMotorSpeed);

  console.log("leftMotorSpeed=" + leftMotorSpeed);
  console.log("rightMotorSpeed=" + rightMotorSpeed);
};