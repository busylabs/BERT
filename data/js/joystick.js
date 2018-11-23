class Joystick extends UiElement {
  constructor(percentX, percentY, text) {
    super(percentX, percentY);
    this.radius = 100;
    this.innerRadius = 40;
    this.shape = 'round';
    this.text = text;
    this.fontSize = 18;
  }

  draw(context) {
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;

    //set color
    context.fillStyle = defaultColor;
    context.strokeStyle = defaultColor;
    
    //draw joystick
    context.beginPath();
    context.lineWidth = 2;
    context.arc(centerX, centerY, this.radius, 0, Math.PI * 2, true);
    context.stroke();
    context.beginPath();
    context.lineWidth = 2;
    context.arc(centerX, centerY, 10, 0, Math.PI * 2, true);
    context.stroke();

    context.beginPath();
    if (this.clicked) {
      context.arc(centerX + this.x * this.radius, centerY  - this.y * this.radius, this.innerRadius, 0, Math.PI * 2, true);
    } else {
      context.arc(centerX, centerY, this.innerRadius, 0, Math.PI * 2, true);
    }
    context.fill();
    
    //text options
    context.fillStyle = defaultColor;
    context.font = this.fontSize + "px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";
    
    //text position
    // var textSize = context.measureText(this.text);
    var textX = centerX;
    var textY = centerY + this.radius;
    
    //draw the text
    context.fillText(this.text, textX, textY);
  }  
}
