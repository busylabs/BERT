#include "motor.h"
#define FORWARD LOW
#define BACKWARD HIGH

Motor::Motor(int pwmPin, int directionPin) {
  _pwmPin = pwmPin;
  _directionPin = directionPin; 
  _disabled = false;
  _speed = 0;
  pinMode(_pwmPin, OUTPUT);
  analogWrite(_pwmPin, _speed);    // stop motor
  pinMode(_directionPin, OUTPUT);
  digitalWrite(_directionPin, FORWARD);
}

void Motor::speed(int speed) {
  _speed = constrain(speed, -PWMRANGE, PWMRANGE);
  if (!_disabled) {
    digitalWrite(_directionPin, (_speed < 0) ? BACKWARD : FORWARD);
    analogWrite(_pwmPin, abs(_speed));
  }
}