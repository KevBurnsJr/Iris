Iris is a little recursive drawing toy I threw together over a few weekends of playing around with HTML5 Canvas.

http://iris.hky.me

The drawing begins with a full-screen Canvas element. A number of lines (spires) are drawn radially outward from the center spaced evenly and with a given rotation angle (rotation). The length of the lines is determined by the (zoom). Each line is split into two smaller lines at an angle relative to the number of spires plus the values of (curl) and (twist). This continues recursively until the given number of recursions is reached (depth). The color of each line is determined randomly (random). Alternatively, the hue of each level can be ranged from 0 to 360 with full saturation and brightness (rainbow).

The number of lines required to complete a given pattern can be determined by the formula (spires * 2 ^ depth - spires). This means that a pattern with 48 spires and a depth of 10 like the one pictured above requires the browser to draw 49,104 lines on the canvas.