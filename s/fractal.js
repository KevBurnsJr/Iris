function drawFractal(hashchanged) {
  var elem = document.getElementById('bgcanvas');
  elem.width = w = window.innerWidth;
  elem.height = h = window.innerHeight;
  var ctx = elem.getContext('2d');
  ctx.rect(0,0,elem.width,elem.height);
  ctx.fillStyle="black";
  ctx.fill();
  
  var deg_to_rad = Math.PI / 180.0;
  
  var depth_start = 10;
  var delay = 0;
  var steps = 1;
  var n = 48;
  var zoom = 1;
  var curl = 60;
  var rotation = 180;
  var twist = 0;
  var color = 1;
  
  if(window.location.hash) {
    var parts = window.location.hash.substr(1).split(':');
    depth_start = parts[0];
    n = parts[1];
    zoom = parts[2];
    curl = parts[3];
    rotation = parts[4];
    twist = parts[5];
    color = parts[6];
  }
  if (!hashchanged && $('#depth').val() !== '') {
    depth_start = $('#depth').val();
    n =           $('#n').val();
    zoom =        $('#zoom').val();
    curl =        $('#curl').val();
    rotation =    $('#rotation').val();
    twist =       $('#twist').val();
    color =       $('#color').val();
  }
  depth_start = Math.min(15, depth_start);
  depth_start = Math.max(1, depth_start);
  zoom = Math.min(10, zoom);
  zoom = Math.max(1, zoom);
  n = Math.max(1, n);
  n = Math.min(48, n);
  rotation = Math.max(0, rotation);
  rotation = Math.min(360, rotation);
  twist = twist > 0 ? twist : 0;
  twist = Math.max(0, twist);
  twist = Math.min(360, twist);
  color = color >= 0 ? color : 0;
  color = Math.max(0, color);
  color = Math.min(1, color);
  
  if (elem.width <= 480 || elem.height <= 480) {
    depth = depth < 10 ? depth : 10;
  }
  
  function drawLine(x1, y1, x2, y2, depth){
    var s = 0;
    if (color == 0) {
      hsl = [Math.random(), .5 + Math.random()*.5, .3 + Math.random()*.2];
    } else if (color == 1) {
      hsl = [(depth/depth_start), .5 + Math.random()*.5, .3 + Math.random()*.2];
    }
    rgb = HSLtoRGB(hsl);
    var r = parseInt(rgb[0]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2]);
    var context = elem.getContext('2d');
    context.lineWidth = .3;
    drawPart = function(){
      context.strokeStyle = "rgba("+r+","+g+","+b+","+.75+")";
      context.beginPath();
      context.moveTo(x1 + s*((x2-x1)/steps), y1 + s*((y2-y1)/steps));
      s++;
      context.lineTo(x1 + s*((x2-x1)/steps), y1 + s*((y2-y1)/steps));
      context.closePath();
      context.stroke();
      if(s < steps) {
        setTimeout(drawPart, delay/steps);
      }
    };
    drawPart();
  }
  function drawTree(x1, y1, angle, depth, dangle, length){
    var dangle = dangle > 0 ? dangle : (360 / n);
    var length = length > 0 ? length : elem.height/(zoom*n);
    var dcurl = curl * (depth / depth_start);
    if (depth != 0){
      var x2 = x1 + (Math.cos(angle * deg_to_rad) * depth * length);
      var y2 = y1 + (Math.sin(angle * deg_to_rad) * depth * length);
      drawLine(x1, y1, x2, y2, depth);
      setTimeout(function(){
        drawTree(x2, y2, angle - (dangle + dcurl) + twist, depth - 1, dangle, length);
        drawTree(x2, y2, angle + (dangle + dcurl) + twist, depth - 1, dangle, length);
      }, delay);
    }
  }
  for(i=0; i<n; i++) {
    drawTree(w/2, h/2, i*(360/n) + (rotation/n),  depth_start);
  }
  
  $('#depth:not(:focus)').val(depth_start);
  $('#n:not(:focus)').val(n);
  $('#zoom:not(:focus)').val(zoom);
  $('#curl:not(:focus)').val(curl);
  $('#rotation:not(:focus)').val(rotation);
  $('#twist:not(:focus)').val(twist);
  $('#color:not(:focus)').val(color);
  
  var parts = [depth_start, n, zoom, curl, rotation, twist, color];
  window.location.hash = parts.join(':');
  $(elem).attr('download', parts.join('-'));
}
var bgtimeout = null;
$(window).resize(function(){
  clearTimeout(bgtimeout);  
  bgtimeout = setTimeout(drawFractal, 500);
});
$('#control').on('change', 'input,select', function(){
  clearTimeout(bgtimeout);  
  bgtimeout = setTimeout(drawFractal, 500);
});
window.onhashchange = function() {
  drawFractal(true);
};
HSLtoRGB = function (hsl) {
  var h = hsl[0],
    s = hsl[1],
    l = hsl[2],
    r, g, b,
    hue2rgb = function (p, q, t){
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1/6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1/2) {
        return q;
      }
      if (t < 2/3) {
        return p + (q - p) * (2/3 - t) * 6;
      }
      return p;
    };
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var
    q = l < 0.5 ? l * (1 + s) : l + s - l * s,
    p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 0xFF, g * 0xFF, b * 0xFF];
};