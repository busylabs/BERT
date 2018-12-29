#include "Arduino.h"

#ifndef motor_h
#define motor_h

class Motor
{
  public: 
    Motor(int pwmPin, int directionPin);    
    void speed(int speed); 
    // void stop();
      
  private: 
    int _pwmPin;
    int _directionPin;
    bool _disabled;
    int _speed;
};

#endif