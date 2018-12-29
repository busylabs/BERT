#include "RemoteControl.h"
#include <string>

RemoteControl::RemoteControl() {}

// TODO refactor to use char strings rather than memory hungery String objects
void RemoteControl::variable(String variableName, int *variablePointer) {
  // TODO check if variableName already used
  variableName.trim();
  _variableNames[_index] = variableName;
  _variablePointers[_index] = variablePointer;
  Serial.printf("%i: %s = %i\n", _index, _variableNames[_index].c_str(), *_variablePointers[_index]);
  _index = _index + 1;
}

void RemoteControl::handle(String message) {
  int pos;
  
  Serial.printf("%s\n", message.c_str());
  while ((pos = message.indexOf(';')) != -1) {
    _processCommand(message.substring(0, pos));
    message.remove(0, pos+1);
  }
}

void RemoteControl::_processCommand(String command) {
  int pos;
  String name, value, temp;
  bool assignment = false;

  name = command;
  if ((pos = command.indexOf('=')) != -1) {   // if this is an assignment operation, split into name and value
    assignment = true;
    name = command.substring(0, pos);
    name.trim();
    value = command.substring(pos+1);
    value.trim();
  }
  
  // check if message contains a variables array
  for (int i = 0; i < _index; i++) {
    temp = _variableNames[i];
    if (name.equals(temp)) {
      if (assignment) {
        *_variablePointers[i] = value.toInt();    // assign value to variable
        Serial.printf("%s assigned %i (index = %i)\n", _variableNames[i].c_str(), *_variablePointers[i], i);
      } else {
        Serial.printf("%s=%i\n", _variableNames[i].c_str(), *_variablePointers[i]);
      }
      return;
    }
  }
  Serial.printf("Message: %s. No such variable %s being controlled.\n", command.c_str(), name.c_str());
}