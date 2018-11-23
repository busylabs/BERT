// pushbutton(round/rectangle), switch(round/rectangle), joystick, slidebar, LED, lable, checkbox, radio

class UiElement {
  constructor(percentX, percentY) {
    this.percentX = percentX;       // x position of element's center as percentage of canvas, from left to right 
    this.percentY = percentY;       // y position of element's center as percentage of canvas, from top to bottom
    this.shape = 'rectangle';
    this.hovered = false;
    this.clicked = false;
    this.x = null;     // if mouse over element, mouse x position between -1 and 1 relative to element's center
    this.y = null;     // if mouse over element, mouse x position between -1 and 1 relative to element's center
    this.registerElement();
  }

  registerElement() {
    uiElements.push(this);
  }

  onClick() {}
  onHover() {}

  mouseHovered(mouse) {
    // x and y are the center coordinates of the UI Element
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;

    if (this.shape == 'rectangle') {
      this.x = null;
      this.y = null;
      if (mouse.x >= centerX - this.width/2 && mouse.x <= centerX + this.width/2 &&
          mouse.y >= centerY - this.height/2 && mouse.y <= centerY + this.height/2) {
        this.x = 2 * (mouse.x - centerX) / this.width;
        this.y = -2 * (mouse.y - centerY) / this.height;
        return true;
      }
      return false;
    }

    if (this.shape == 'round') {
      this.x = null;
      this.y = null;
      if (Math.sqrt((mouse.x - centerX) * (mouse.x - centerX)  + (mouse.y - centerY) * (mouse.y - centerY)) <= this.radius) {
        this.x = (mouse.x - centerX)/this.radius;
        this.y = (centerY - mouse.y)/this.radius;
        return true;
      }
    }
    return false;
  }
}