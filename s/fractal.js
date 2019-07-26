(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
(function(){
    var animationFrame;
    var deg_to_rad = Math.PI / 180.0;
    var depth_start = 10;
    var n = 6;
    var zoom = 5;
    var rotation = 0;
    var curl = 0;
    var twist = 0;
    var a_curl = .1;
    var a_twist = 0;
    var next = {};
    var rgb;
    var elem = document.getElementById('bgcanvas');
    var ctx = elem.getContext('2d');
    var last = fps_tick = Date.now();
    var rgb = [];
    var pause = false;
    var animate = true;

    var reset = function() {
        twist = 0;
        curl = 1080;

        if(window.location.hash) {
            var parts = window.location.hash.substr(1).split(':');
            depth_start = parts[0];
            n           = parts[1];
            zoom        = parts[2];
            rotation    = parts[3];
            a_curl      = parseFloat(parts[4]);
            a_twist     = parseFloat(parts[5]);
            curl        = parseFloat(parts[6]);
            twist       = parseFloat(parts[7]);
            pause       = parts[8] == 1;
        }

        depth_start = Math.min(15, depth_start);
        depth_start = Math.max(1, depth_start);
        zoom = Math.min(15, zoom);
        zoom = Math.max(1, zoom);
        n = Math.max(1, n);
        n = Math.min(48, n);
        rotation = Math.max(0, rotation);
        rotation = Math.min(360, rotation);

        $('#depth:not(:focus)').val(depth_start);
        $('#n:not(:focus)').val(n);
        $('#zoom:not(:focus)').val(zoom);
        $('#rotation:not(:focus)').val(rotation);
        $('#a_curl:not(:focus)').val(a_curl);
        $('#a_twist:not(:focus)').val(a_twist);

        elem.width = w = window.innerWidth;
        elem.height = h = window.innerHeight;

        for(i=depth_start; i > 0; i--) {
            var c = HSLtoRGB([(i/depth_start), .8, .5]);
            rgb[i] = "rgba("+parseInt(c[0])+","+parseInt(c[1])+","+parseInt(c[2])+",.75)";
        }

        window.cancelAnimationFrame(animationFrame);
    }

    var clickpoint = [];
    document.addEventListener('mousedown', function(e){
        if (e.target.nodeName != "CANVAS") {
          return;
        }
        clickpoint = [e.offsetX, e.offsetY];
        animate = false;
        // drawFractal();
    });
    document.addEventListener('mousemove', function(e){
        if (!clickpoint.length) {
            return
        }
        curl -= (clickpoint[0] - e.offsetX) * (e.shiftKey?1:0.1);
        clickpoint = [e.offsetX, e.offsetY];
    });
    document.addEventListener('mouseup', function(e){
        clickpoint = [];
        animate = true;
        sethash(false);
    });
    document.addEventListener('keydown', function(e){
        if (e.key == " ") {
          pause = !pause;
          sethash(false);
        }
    });
    document.addEventListener('wheel', function(e) {
        if (e.deltaY < 0) {
            zoom--;
        }
        if (e.deltaY > 0) {
            zoom++;
        }
        zoom = Math.min(15, zoom);
        zoom = Math.max(1, zoom);
        sethash(false);
    });

    var drawFractal = function() {
        animationFrame = window.requestAnimationFrame(drawFractal);
        ctx.rect(0,0,elem.width,elem.height);
        ctx.fillStyle="rgba(0,0,0,0.4)";
        ctx.fill();
        ctx.lineWidth = .4;
        for(i = 1; i <= depth_start; i++) {
            next[i] = [];
        }
        var lines = 0;
        for(i = 0; i < n; i++) {
            next[depth_start].push([w/2, h/2, i*(360/n) + (rotation/n), depth_start, 360 / n, elem.height/(zoom*n)]);
        }
        for(i = depth_start; i > 0; i--) {
            ctx.strokeStyle = rgb[i];
            ctx.beginPath();
            for(j in next[i]) {
                var x1     = next[i][j][0],
                    y1     = next[i][j][1],
                    angle  = next[i][j][2],
                    depth  = next[i][j][3],
                    dangle = next[i][j][4],
                    length = next[i][j][5];
                var dcurl = curl * (depth / depth_start);
                var x2 = x1 + (Math.cos(angle * deg_to_rad) * depth * length);
                var y2 = y1 + (Math.sin(angle * deg_to_rad) * depth * length);
                if(i<depth_start&&!(((x1 < 0 || x1 > w) || (y1 < 0 || y1 > h)) && ((x2 < 0 || x2 > w) || (y2 < 0 || y2 > h)) && (((x1+x2/2) < 0 || (x1+x2/2) > w) || ((y1+y2)/2 < 0 || (y1+y2)/2 > h)))) {
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    lines++;
                }
                if(depth>1) {
                    next[depth - 1].push([x2, y2, angle - (dangle + dcurl) + twist, depth - 1, dangle, length]);
                    next[depth - 1].push([x2, y2, angle + (dangle + dcurl) + twist, depth - 1, dangle, length]);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
        if (animate && !pause) {
            curl  = (curl < 360*depth_start ? curl : curl - 360*depth_start) + a_curl;
            twist = (twist < 360 ? twist : twist - 360) + a_twist;
        }
        var now = Date.now();
        if(fps_tick + 1000 < now) {
            $('#lpf').text(lines + " lines ("+Math.round((lines * (1000/(now - last)))/1000)+" klps)");
            $('#fps').text(Math.round(1000/(now - last)) + " fps");
            fps_tick = now;
        }
        last = now;
    };
    var bgtimeout = null;
    $(window).resize(function(){
        clearTimeout(bgtimeout);
        bgtimeout = setTimeout(function(){
            elem.width = w = window.innerWidth;
            elem.height = h = window.innerHeight;
            window.cancelAnimationFrame(animationFrame);
            drawFractal();
        }, 300);
    });
    var hashUpdateRefresh = true;
    var sethash = function(refresh) {
      hashUpdateRefresh = refresh;
      var parts = [
          $('#depth').val(),
          $('#n').val(),
          $('#zoom').val(),
          $('#rotation').val(),
          $('#a_curl').val(),
          $('#a_twist').val(),
          Math.ceil(curl*10)/10,
          Math.ceil(twist*10)/10,
          pause ? '1' : '0'
      ];
      window.location.hash = parts.join(':');
    };
    $('#control').on('change', 'input,select', function(){
        sethash(true);
        reset();
    });
    window.onhashchange = function() {
        if (!hashUpdateRefresh) {
            hashUpdateRefresh = true;
            return;
        }
        reset();
        bgtimeout = setTimeout(function(){
            window.location.reload();
        }, 100);
    };
    var HSLtoRGB = function (hsl) {
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

    reset();
    drawFractal(true);
})();