class Pushbutton extends UiElement {
  constructor(percentX, percentY, text) {
    super(percentX, percentY);
    this.width = 80;
    this.height = 40;
    this.text = text;
    this.fontSize = 18;
  }

  draw(context) {
    let centerX = canvas.width * this.percentX / 100;
    let centerY = canvas.height * this.percentY / 100;

    //set color
    if (this.clicked) {
      context.fillStyle = "#000000";
    } else if (this.hovered) {
      context.strokeStyle = "#FF95DD";
      context.fillStyle = "#FF95DD";
    } else {
      context.strokeStyle = defaultColor;
      context.fillStyle = defaultColor;
    }
    
    //draw button
    context.lineWidth = 2;
    context.strokeRect(centerX - this.width/2, centerY - this.height/2, this.width, this.height);
    context.fillRect(centerX - this.width/2 + 4, centerY - this.height/2 + 4, this.width - 8, this.height - 8);

    if (this.text) {
      //text options
      context.fillStyle = defaultColor;
      context.font = this.fontSize + "px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "top";
      
      //text position
      // var textSize = context.measureText(this.text);
      var textX = centerX;
      var textY = centerY + this.height/2;
      
      //draw the text
      context.fillText(this.text, textX, textY);
    }
  }  
}



// class Button {
//   constructor(percentX, percentY, width, height, text) {
//     this.percentX = percentX;
//     this.percentY = percentY;
//     this.width = width;
//     this.height = height;
//     this.text = text;
//     this.clicked = false;
//     this.hovered = false;
//     this.fontSize = 18;
//     this.register();
//   }

//   register() {
//     uiElements.push(this);
//   }

//   mouseHover(mouse) {
//     let x = canvas.width * this.percentX / 100;
//     let y = canvas.height * this.percentY / 100;

//     let xIntersect = mouse.x > x - this.width/2 && mouse.x < x + this.width/2;
//     let yIntersect = mouse.y > y - this.height/2 && mouse.y < y + this.height/2;
//     return  xIntersect && yIntersect;
//   }

//   draw(context) {
//     let x = canvas.width * this.percentX / 100;
//     let y = canvas.height * this.percentY / 100;

//     //set color
//     if (this.clicked) {
//       context.fillStyle = "#000000";
//     } else if (this.hovered) {
//       context.fillStyle = "#FF95DD";
//     } else {
//       context.fillStyle= "#0095DD";
//     }
    
//     //draw button
//     context.fillRect(x - this.width/2, y - this.height/2, this.width, this.height);
//     // context.fillRect(canvas.width*this.x/100 - this.width/2, canvas.height*this.y/100 - this.height/2, this.width, this.height);
    
//     //text options
//     context.fillStyle = "white";
//     context.font = this.fontSize + "px sans-serif";
//     context.textAlign = "center";
//     context.textBaseline = "middle";
    
//     //text position
//     // var textSize = context.measureText(this.text);
//     var textX = x;
//     var textY = y;
    
//     //draw the text
//     context.fillText(this.text, textX, textY);
//   }
// }








// var Button = function(text, x, y, width, height) {
//   this.x = x;
//   this.y = y;
//   this.width = width;
//   this.height = height;
//   this.clicked = false;
//   this.hovered = false;
//   this.text = text;
// }

// Button.prototype = _.extend(Button.prototype, UIObject);

// Button.prototype.update = function(canvas) {
//   var wasNotClicked = !this.clicked;
//   this.updateStats(canvas);
  
//   if (this.clicked && wasNotClicked) {
//       if (!_.isUndefined(this.handler)) {
//         this.handler();
//       }
//   }
// }

// Button.prototype.draw = function(canvas) {
//   //set color
//   if (this.hovered) {
//       canvas.setFillColor(0.3, 0.7, 0.6, 1.0);
//   } else {
//       canvas.setFillColor(0.2, 0.6, 0.5, 1.0);
//   }
  
//   //draw button
//   canvas.fillRect(this.x, this.y, this.width, this.height);
  
//   //text options
//   var fontSize = 20;
//   canvas.setFillColor(1, 1, 1, 1.0);
//   canvas.font = fontSize + "px sans-serif";
  
//   //text position
//   var textSize = canvas.measureText(this.text);
//   var textX = this.x + (this.width/2) - (textSize.width / 2);
//   var textY = this.y + (this.height/2) - (fontSize/2);
  
//   //draw the text
//   canvas.fillText(this.text, textX, textY);
// }