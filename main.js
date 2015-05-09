(function(window, $) {
    function onLoad() {
        updateServerList();
        setInterval(updateServerList, 18E4);
        canvas = canvas2 = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        canvas.onmousedown = function(event) {
            if (isMobile) {
                var b = event.clientX - (5 + windowWidth / 5 / 2),
                    c = event.clientY - (5 + windowWidth / 5 / 2);
                if (Math.sqrt(b * b + c * c) <= windowWidth / 5 / 2) {
                    sendMousePosition();
                    sendCommand(17);
                    return
                }
            }
            clientX = event.clientX;
            clientY = event.clientY;
            T();
            sendMousePosition()
        };
        canvas.onmousemove = function(a) {
            clientX = a.clientX;
            clientY = a.clientY;
            T()
        };
        canvas.onmouseup = function(a) {};
        var a = false,
            b = false,
            c = false;
        window.onkeydown = function(f) {
          // space (split)
          if (32 == f.keyCode && !a) {
            sendMousePosition()
            sendCommand(17)
            a = true
          }

          // q
          if (81 == f.keyCode && !b) {
            sendCommand(18)
            b = true
          }

          // w send out mass
          if (87 == f.keyCode && !c) {
            sendMousePosition()
            sendCommand(21)
            c = true
          }
        };
        window.onkeyup = function(f) {
          // space
          if (32 == f.keyCode) {
            a = false;
          }
          // w
          if (87 == f.keyCode) {
            c = false;
          }
          // q
          if (81 == f.keyCode && b) {
            sendCommand(19)
            b = false
          }
        };
        window.onblur = function() {
            sendCommand(19);
            c = b = a = false
        };
        window.onresize = onResize;
        onResize();
        window.requestAnimationFrame ? window.requestAnimationFrame(animationFrameStep) : setInterval(U, 1E3 / 60);
        setInterval(sendMousePosition, 100);
        ia(v("#region").val())
    }

    function va() {
        for (var a = Number.POSITIVE_INFINITY, b = Number.POSITIVE_INFINITY, c = Number.NEGATIVE_INFINITY, f = Number.NEGATIVE_INFINITY, d = 0, e = 0; e < r.length; e++) d = Math.max(r[e].size, d), a = Math.min(r[e].x, a), b = Math.min(r[e].y, b), c = Math.max(r[e].x, c), f = Math.max(r[e].y, f);
        V = QUAD.init({
            minX: a - (d + 100),
            minY: b - (d + 100),
            maxX: c + (d + 100),
            maxY: f + (d + 100)
        });
        for (e = 0; e < r.length; e++)
            if (a = r[e], a.shouldRender())
                for (b = 0; b < a.points.length; ++b) V.insert(a.points[b])
    }

    function T() {
        L = (clientX - windowWidth / 2) / s + x;
        M = (clientY - windowHeight / 2) / s + y
    }

    function updateServerList() {
        null == N && (N = {}, v("#region").children().each(function() {
            var a = v(this),
                b = a.val();
            b && (N[b] = a.text())
        }));
        $.get("http://m.agar.io/info", function(a) {
                for (var b in a.regions) v('#region option[value="' + b + '"]').text(N[b] + " (" + a.regions[b].numPlayers + " players)")
            },
            "json")
    }

    function ia(a) {
        a && a != W && (W = a, showConnectingAndConnect())
    }

    function getSocketServerIPAndConnect() {
        $.ajax("http://m.agar.io/", {
            error: function() {
                setTimeout(getSocketServerIPAndConnect, 1E3)
            },
            success: function(a) {
                a = a.split("\n");
                connectSocket("ws://" + a[0])
            },
            dataType: "text",
            method: "POST",
            cache: false,
            crossDomain: true,
            data: W || "?"
        })
    }

    function showConnectingAndConnect() {
        v("#connecting").show();
        getSocketServerIPAndConnect()
    }

    function connectSocket(a) {
        socket && (socket.onopen = null, socket.onmessage = null, socket.onclose = null, socket.close(), socket = null);
        D = [];
        n = [];
        z = {};
        r = [];
        E = [];
        q = [];
        console.log("Connecting to " + a);
        socket = new WebSocket(a);
        socket.binaryType = "arraybuffer";
        socket.onopen = onSocketOpen;
        socket.onmessage = onSocketMessage;
        socket.onclose = onSocketClose;
        socket.onerror = function() {
            console.log("socket error")
        }
    }

    function onSocketOpen(a) {
        v("#connecting").hide();
        console.log("socket open");
        a = new ArrayBuffer(5);
        var b = new DataView(a);
        b.setUint8(0, 255);
        b.setUint32(1, 1, true);
        socket.send(a);
        ma()
    }

    function onSocketClose(a) {
        console.log("socket close");
        setTimeout(showConnectingAndConnect, 500)
    }

    function onSocketMessage(a) {
        function b() {
            for (var a = "";;) {
                var b = f.getUint16(c, true);
                c += 2;
                if (0 == b) break;
                a += String.fromCharCode(b)
            }
            return a
        }
        var c = 1,
            f = new DataView(a.data);
        switch (f.getUint8(0)) {
            case 16:
                za(f);
                break;
            case 20:
                n = [];
                D = [];
                break;
            case 32:
                D.push(f.getUint32(1, true));
                break;
            case 48:
                for (q = []; c < f.byteLength;) q.push({
                    id: 0,
                    name: b()
                });
                na();
                break;
            case 49:
                a = f.getUint32(c, true);
                c += 4;
                q = [];
                for (var d = 0; d < a; ++d) {
                    var e = f.getUint32(c, true),
                        c = c + 4;
                    q.push({
                        id: e,
                        name: b()
                    })
                }
                na();
                break;
            case 64:
                X = f.getFloat64(1, true), Y = f.getFloat64(9, true), Z = f.getFloat64(17, true), $ = f.getFloat64(25, true), 0 == n.length && (x = (Z + X) / 2, y = ($ + Y) / 2)
        }
    }

    function za(a) {
        F = +new Date;
        var b = Math.random(),
            c = 1;
        aa = false;
        for (var f = a.getUint16(c, true), c = c + 2, d = 0; d < f; ++d) {
            var e = z[a.getUint32(c, true)],
                t =
                z[a.getUint32(c + 4, true)],
                c = c + 8;
            e && t && (t.destroy(), t.ox = t.x, t.oy = t.y, t.oSize = t.size, t.nx = e.x, t.ny = e.y, t.nSize = t.size, t.updateTime = F)
        }
        for (;;) {
            f = a.getUint32(c, true);
            c += 4;
            if (0 == f) break;
            var d = a.getFloat64(c, true),
                c = c + 8,
                e = a.getFloat64(c, true),
                c = c + 8,
                t = a.getFloat64(c, true),
                c = c + 8,
                l = a.getUint8(c++),
                h = false;
            if (0 == l) h = true, l = "#33FF33";
            else if (255 == l) {
                var h = a.getUint8(c++),
                    l = a.getUint8(c++),
                    g = a.getUint8(c++),
                    l = oa(h << 16 | l << 8 | g),
                    g = a.getUint8(c++),
                    h = !!(g & 1);
                g & 2 && (c += 4);
                g & 4 && (c += 8);
                g & 8 && (c += 16)
            } else {
                var l = 63487 | l << 16,
                    k = (l >> 16 & 255) /
                    255 * 360,
                    m = (l >> 8 & 255) / 255,
                    l = (l >> 0 & 255) / 255;
                if (0 == windowWidth) l = l << 16 | l << 8 | l << 0;
                else {
                    var k = k / 60,
                        g = ~~k,
                        u = k - g,
                        k = l * (1 - windowWidth),
                        s = l * (1 - windowWidth * u),
                        m = l * (1 - windowWidth * (1 - u)),
                        p = u = 0,
                        q = 0;
                    switch (g % 6) {
                        case 0:
                            u = l;
                            p = m;
                            q = k;
                            break;
                        case 1:
                            u = s;
                            p = l;
                            q = k;
                            break;
                        case 2:
                            u = k;
                            p = l;
                            q = m;
                            break;
                        case 3:
                            u = k;
                            p = s;
                            q = l;
                            break;
                        case 4:
                            u = m;
                            p = k;
                            q = l;
                            break;
                        case 5:
                            u = l, p = k, q = s
                    }
                    u = ~~(255 * u) & 255;
                    p = ~~(255 * p) & 255;
                    q = ~~(255 * q) & 255;
                    l = u << 16 | p << 8 | q
                }
                l = oa(l)
            }
            for (g = "";;) {
                k = a.getUint16(c, true);
                c += 2;
                if (0 == k) break;
                g += String.fromCharCode(k)
            }
            k = null;
            z.hasOwnProperty(f) ? (k = z[f], k.updatePos(), k.ox =
                k.x, k.oy = k.y, k.oSize = k.size, k.color = l) : (k = new player(f, d, e, t, l, h, g), k.pX = d, k.pY = e);
            k.nx = d;
            k.ny = e;
            k.nSize = t;
            k.updateCode = b;
            k.updateTime = F; - 1 != D.indexOf(f) && -1 == n.indexOf(k) && (document.getElementById("overlays").style.display = "none", n.push(k), 1 == n.length && (x = k.x, y = k.y))
        }
        a.getUint16(c, true);
        c += 2;
        e = a.getUint32(c, true);
        c += 4;
        for (d = 0; d < e; d++) f = a.getUint32(c, true), c += 4, z[f] && (z[f].updateCode = b);
        for (d = 0; d < r.length; d++) r[d].updateCode != b && r[d--].destroy();
        aa && 0 == n.length && v("#overlays").fadeIn(3E3)
    }

    function sendMousePosition() {
        if (null != h && socket.readyState == socket.OPEN) {
            var a = clientX - windowWidth / 2,
                b = clientY - windowHeight / 2;
            64 > a * a + b * b || qa == L && ra == M || (qa = L, ra = M, a = new ArrayBuffer(21), b = new DataView(a), b.setUint8(0, 16), b.setFloat64(1, L, true), b.setFloat64(9, M, true), b.setUint32(17, 0, true), socket.send(a))
        }
    }

    function ma() {
        if (null != socket && socket.readyState == socket.OPEN && null != H) {
            var a = new ArrayBuffer(1 + 2 * H.length),
                b = new DataView(a);
            b.setUint8(0, 0);
            for (var c = 0; c < H.length; ++c) b.setUint16(1 + 2 * c, H.charCodeAt(c), true);
            socket.send(a)
        }
    }

    function sendCommand(a) {
        if (null != socket && socket.readyState == socket.OPEN) {
            var b = new ArrayBuffer(1);
            (new DataView(b)).setUint8(0, a);
            socket.send(b)
        }
    }

    function animationFrameStep() {
        redraw();
        window.requestAnimationFrame(animationFrameStep)
    }

    function onResize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        canvas2.width = canvas.width = windowWidth;
        canvas2.height = canvas.height = windowHeight;
        redraw()
    }

    function Aa() {
        if (0 != n.length) {
            for (var a = 0, b = 0; b < n.length; b++) a += n[b].size;
            a = Math.pow(Math.min(64 / a, 1), .4) * Math.max(p / 965, windowWidth / 1920);
            s = (9 * s + a) / 10
        }
    }

    function redraw() {
        var a = +new Date;
        ++Ba;
        Aa();
        F = +new Date;
        if (0 < n.length) {
            for (var b = 0, c = 0, f = 0; f < n.length; f++) n[f].updatePos(), b += n[f].x / n.length, c += n[f].y / n.length;
            x = (x + b) / 2;
            y = (y + c) / 2
        }
        va();
        T();
        ctx.clearRect(0, 0, windowWidth, windowHeight);
        ctx.fillStyle =
            isDarkTheme ? "#111111" : "#F2FBFF";
        ctx.fillRect(0, 0, windowWidth, windowHeight);
        ctx.save();
        ctx.strokeStyle = isDarkTheme ? "#AAAAAA" : "#000000";
        ctx.globalAlpha = .2;
        ctx.scale(s, s);
        b = windowWidth / s;
        c = windowHeight / s;
        for (f = -.5 + (-x + b / 2) % 50; f < b; f += 50) ctx.beginPath(), ctx.moveTo(f, 0), ctx.lineTo(f, c), ctx.stroke();
        for (f = -.5 + (-y + c / 2) % 50; f < c; f += 50) ctx.beginPath(), ctx.moveTo(0, f), ctx.lineTo(b, f), ctx.stroke();
        ctx.restore();
        r.sort(function(a, b) {
            return a.size == b.size ? a.id - b.id : a.size - b.size
        });
        ctx.save();
        ctx.translate(windowWidth / 2, windowHeight / 2);
        ctx.scale(s, s);
        ctx.translate(-x, -y);
        for (f = 0; f < E.length; f++) E[f].draw();
        for (f = 0; f < r.length; f++) r[f].draw();
        ctx.restore();
        A && 0 != q.length && ctx.drawImage(A, windowWidth - A.width - 10, 10);
        I = Math.max(I, Ca());
        0 != I && (null == O && (O = new P(24, "#FFFFFF")), O.setValue("Score: " + ~~(I / 100)), c = O.render(), b = c.width, ctx.globalAlpha = .2, ctx.fillStyle = "#000000", ctx.fillRect(10, windowHeight - 10 - 24 - 10, b + 10, 34), ctx.globalAlpha = 1, ctx.drawImage(c, 15, windowHeight - 10 - 24 - 5));
        Da();
        a = +new Date - a;
        a > 1E3 / 60 ? w -= .01 : a < 1E3 / 65 && (w += .01);.4 > w && (w = .4);
        1 < w && (w = 1)
    }

    function Da() {
        if (isMobile && ca.width) {
            var a = windowWidth / 5;
            ctx.drawImage(ca, 5, 5, a, a)
        }
    }

    function Ca() {
        for (var a = 0, b = 0; b < n.length; b++) a += n[b].nSize * n[b].nSize;
        return a
    }

    function na() {
        if (0 != q.length)
            if (isNamesOn) {
                A = document.createElement("canvas");
                var a = A.getContext("2d"),
                    b = 60 + 24 * q.length,
                    c = Math.min(200, .3 * windowWidth) / 200;
                A.width = 200 * c;
                A.height = b * c;
                a.scale(c, c);
                a.globalAlpha = .4;
                a.fillStyle = "#000000";
                a.fillRect(0, 0, 200, b);
                a.globalAlpha = 1;
                a.fillStyle = "#FFFFFF";
                c = null;
                c = "Leaderboard";
                a.font = "30px Ubuntu";
                a.fillText(c, 100 - a.measureText(c).width / 2, 40);
                a.font = "20px Ubuntu";
                for (b = 0; b < q.length; ++b) c = q[b].name || "An unnamed cell", -1 != n.indexOf(q[b].id) && (c = n[0].name), isNamesOn || 0 != n.length &&
                    n[0].name == c || (c = "An unnamed cell"), c = b + 1 + ". " + c, a.fillText(c, 100 - a.measureText(c).width / 2, 70 + 24 * b)
            } else A = null
    }

    function player(a, b, c, d, g, e, h) {
        r.push(this);
        z[a] = this;
        this.id = a;
        this.ox = this.x = b;
        this.oy = this.y = c;
        this.oSize = this.size = d;
        this.color = g;
        this.isVirus = e;
        this.points = [];
        this.pointsAcc = [];
        this.createPoints();
        this.setName(h)
    }

    function oa(a) {
        for (a = a.toString(16); 6 > a.length;) a = "0" + a;
        return "#" + a
    }

    function LeaderBoard(a, b, c, d) {
        a && (this._size = a);
        b && (this._color = b);
        this._stroke = !!c;
        d && (this._strokeColor = d)
    }
    if ("agar.io" != window.location.hostname && "localhost" != window.location.hostname && "10.10.2.13" != window.location.hostname) window.location = "http://agar.io/";
    else {
        var S, d, B, m, p, V = null,
            h = null,
            x = 0,
            y = 0,
            D = [],
            n = [],
            z = {},
            r = [],
            E = [],
            q = [],
            clientX = 0,
            clientY = 0,
            L = -1,
            M = -1,
            Ba = 0,
            F = 0,
            H = null,
            X = 0,
            Y = 0,
            Z = 1E4,
            $ = 1E4,
            s = 1,
            W = null,
            isSkinsOn = true,
            isNamesOn = true,
            isColorsOn = false,
            aa = false,
            I = 0,
            isDarkTheme = false,
            isShowMassOn = false,
            isMobile = "ontouchstart" in g && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            ca = new Image;
        ca.src = "img/split.png";
        var N = null;
        window.setNick = function(a) {
            v("#adsBottom").hide();
            H = a;
            ma();
            v("#overlays").hide();
            I = 0
        };
        window.setRegion = ia;
        window.setSkins = function(a) {
            isSkinsOn = a
        };
        window.setNames = function(a) {
            isNamesOn = a
        };
        window.setDarkTheme = function(a) {
            isDarkTheme = a
        };
        window.setColors = function(a) {
            isColorsOn = a
        };
        window.setShowMass = function(a) {
            isShowMassOn = a
        };
        window.connect = connectSocket;
        var qa = -1,
            ra = -1,
            A = null,
            w = 1,
            O = null,
            R = {},
            Ea = "poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;hitler;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;ussr;pewdiepie;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;nazi;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;isis;doge".split(";"),
            Fa = ["m'blob"];
        player.prototype = {
            id: 0,
            points: null,
            pointsAcc: null,
            name: null,
            nameCache: null,
            sizeCache: null,
            x: 0,
            y: 0,
            size: 0,
            ox: 0,
            oy: 0,
            oSize: 0,
            nx: 0,
            ny: 0,
            nSize: 0,
            updateTime: 0,
            updateCode: 0,
            drawTime: 0,
            destroyed: false,
            isVirus: false,
            destroy: function() {
                var a;
                for (a = 0; a < r.length; a++)
                    if (r[a] == this) {
                        r.splice(a, 1);
                        break
                    }
                delete z[this.id];
                a = n.indexOf(this); - 1 != a && (aa = true, n.splice(a, 1));
                a = D.indexOf(this.id); - 1 != a && D.splice(a, 1);
                this.destroyed = true;
                E.push(this)
            },
            getNameSize: function() {
                return Math.max(~~(.3 * this.size), 24)
            },
            setName: function(a) {
                if (this.name = a) null == this.nameCache ? this.nameCache = new P(this.getNameSize(), "#FFFFFF", true, "#000000") : this.nameCache.setSize(this.getNameSize()), this.nameCache.setValue(this.name)
            },
            createPoints: function() {
                for (var a = this.getNumPoints(); this.points.length > a;) {
                    var b = ~~(Math.random() * this.points.length);
                    this.points.splice(b, 1);
                    this.pointsAcc.splice(b, 1)
                }
                0 == this.points.length && 0 < a && (this.points.push({
                    c: this,
                    v: this.size,
                    x: this.x,
                    y: this.y
                }), this.pointsAcc.push(Math.random() - .5));
                for (; this.points.length < a;) {
                    var b = ~~(Math.random() * this.points.length),
                        c = this.points[b];
                    this.points.splice(b, 0, {
                        c: this,
                        v: c.v,
                        x: c.x,
                        y: c.y
                    });
                    this.pointsAcc.splice(b, 0, this.pointsAcc[b])
                }
            },
            getNumPoints: function() {
                return ~~Math.max(this.size * s * (this.isVirus ? Math.min(2 * w, 1) : w), this.isVirus ? 10 : 5)
            },
            movePoints: function() {
                this.createPoints();
                for (var a = this.points, b = this.pointsAcc, c = b.concat(), d = a.concat(), g = ctx.length, e = 0; e < g; ++e) {
                    var h = c[(e - 1 + g) % g],
                        l = c[(e + 1) % g];
                    b[e] += Math.random() - .5;
                    b[e] *= .7;
                    10 < b[e] && (b[e] = 10); - 10 > b[e] && (b[e] = -10);
                    b[e] = (h + l + 8 * b[e]) / 10
                }
                for (var n =
                        this, e = 0; e < g; ++e) {
                    c = d[e].v;
                    h = d[(e - 1 + g) % g].v;
                    l = d[(e + 1) % g].v;
                    if (15 < this.size) {
                        var m = false,
                            k = a[e].x,
                            p = a[e].y;
                        V.retrieve2(k - 5, p - 5, 10, 10, function(a) {
                            a.c != n && 25 > (k - a.x) * (k - a.x) + (p - a.y) * (p - a.y) && (m = true)
                        });
                        !m && (a[e].x < X || a[e].y < Y || a[e].x > Z || a[e].y > $) && (m = true);
                        m && (0 < b[e] && (b[e] = 0), b[e] -= 1)
                    }
                    c += b[e];
                    0 > c && (c = 0);
                    c = (12 * c + this.size) / 13;
                    a[e].v = (h + l + 8 * c) / 10;
                    h = 2 * Math.PI / g;
                    l = this.points[e].v;
                    this.isVirus && 0 == e % 2 && (l += 5);
                    a[e].x = this.x + Math.cos(h * e) * l;
                    a[e].y = this.y + Math.sin(h * e) * l
                }
            },
            updatePos: function() {
                var a;
                a = (F - this.updateTime) /
                    120;
                a = 0 > a ? 0 : 1 < a ? 1 : a;
                a = a * a * (3 - 2 * a);
                var b = this.getNameSize();
                if (this.destroyed && 1 <= a) {
                    var c = E.indexOf(this); - 1 != c && E.splice(c, 1)
                }
                this.x = a * (this.nx - this.ox) + this.ox;
                this.y = a * (this.ny - this.oy) + this.oy;
                this.size = a * (this.nSize - this.oSize) + this.oSize;
                this.destroyed || b == this.getNameSize() || this.setName(this.name);
                return a
            },
            shouldRender: function() {
                return this.x + this.size + 40 < x - windowWidth / 2 / s || this.y + this.size + 40 < y - windowHeight / 2 / s || this.x - this.size - 40 > x + windowWidth / 2 / s || this.y - this.size - 40 > y + windowHeight / 2 / s ? false : true
            },
            draw: function() {
                if (this.shouldRender()) {
                    ctx.save();
                    this.drawTime = F;
                    var a = this.updatePos();
                    this.destroyed && (ctx.globalAlpha *= 1 - a);
                    this.movePoints();
                    isColorsOn ? (ctx.fillStyle = "#FFFFFF", ctx.strokeStyle = "#AAAAAA") : (ctx.fillStyle = this.color, ctx.strokeStyle = this.color);
                    ctx.beginPath();
                    ctx.lineWidth = 10;
                    ctx.lineCap = "round";
                    ctx.lineJoin = this.isVirus ? "mitter" : "round";
                    a = this.getNumPoints();
                    ctx.moveTo(this.points[0].x, this.points[0].y);
                    for (var b = 1; b <= a; ++b) {
                        var c = b % a;
                        ctx.lineTo(this.points[c].x, this.points[c].y)
                    }
                    ctx.closePath();
                    a = this.name.toLowerCase();
                    isSkinsOn ? -1 != Ea.indexOf(a) ? (R.hasOwnProperty(a) || (R[a] = new Image, R[a].src = "skins/" + a + ".png"), b = R[a]) : b = null : b = null;
                    a = b ? -1 != Fa.indexOf(a) : false;
                    ctx.stroke();
                    ctx.fill();
                    null != b && 0 < b.width && !a && (ctx.save(), ctx.clip(), ctx.drawImage(b, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size), ctx.restore());
                    if (isColorsOn || 15 < this.size) ctx.strokeStyle = "#000000", ctx.globalAlpha *= .1, ctx.stroke();
                    ctx.globalAlpha = 1;
                    null != b && 0 < b.width && a && ctx.drawImage(b, this.x - 2 * this.size, this.y - 2 * this.size, 4 * this.size, 4 * this.size);
                    a = -1 != n.indexOf(this);
                    b = ~~this.y;
                    (isNamesOn || a) && this.name && this.nameCache && (c = this.nameCache.render(), ctx.drawImage(c, ~~this.x - ~~(c.width / 2), b - ~~(c.height / 2)), b += c.height / 2 + 4);
                    isShowMassOn && a && (null == this.sizeCache && (this.sizeCache = new P(this.getNameSize() / 2, "#FFFFFF", true, "#000000")), this.sizeCache.setSize(this.getNameSize() / 2), this.sizeCache.setValue(~~(this.size * this.size / 100)), c = this.sizeCache.render(), ctx.drawImage(c, ~~this.x - ~~(c.width / 2), b - ~~(c.height / 2)));
                    ctx.restore()
                }
            }
        };
        LeaderBoard.prototype = {
            _value: "",
            _color: "#000000",
            _stroke: false,
            _strokeColor: "#000000",
            _size: 16,
            _canvas: null,
            _ctx: null,
            _dirty: false,
            setSize: function(a) {
                this._size !=
                    a && (this._size = a, this._dirty = true)
            },
            setColor: function(a) {
                this._color != a && (this._color = a, this._dirty = true)
            },
            setStroke: function(a) {
                this._stroke != a && (this._stroke = a, this._dirty = true)
            },
            setStrokeColor: function(a) {
                this._strokeColor != a && (this._strokeColor = a, this._dirty = true)
            },
            setValue: function(a) {
                a != this._value && (this._value = a, this._dirty = true)
            },
            render: function() {
                null == this._canvas && (this._canvas = document.createElement("canvas"), this._ctx = this._canvas.getContext("2d"));
                if (this._dirty) {
                    var a = this._canvas,
                        b = this._ctx,
                        c = this._value,
                        d = this._size,
                        g = d + "px Ubuntu";
                    b.font = g;
                    var e = b.measureText(c).width,
                        h = ~~(.2 * d);
                    a.width = e + 6;
                    a.height = d + h;
                    b.font = g;
                    b.globalAlpha = 1;
                    b.lineWidth = 3;
                    b.strokeStyle = this._strokeColor;
                    b.fillStyle = this._color;
                    this._stroke && b.strokeText(c, 3, d - h / 2);
                    b.fillText(c, 3, d - h / 2)
                }
                return this._canvas
            }
        };
        window.onload = onLoad
    }
})(window, jQuery);
