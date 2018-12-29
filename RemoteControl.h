#include "Arduino.h"

#ifndef control_h
#define control_h

class RemoteControl
{
  public: 
    RemoteControl();
    void variable(String variableName, int *variable);
    void handle(String message);
    //void getVariables(void);    //TODO returns a JSON structure of variables and values

  private:
    void _processCommand(String command);
    int _index = 0;
    String _variableNames[5];    // max of 5 variables
    int *_variablePointers[5];
};

#endif