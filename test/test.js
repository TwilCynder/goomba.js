var app = new gmb.Application(500, 500)
var buton = new gmb.Button(app, "hud", 0, 0, {
    draw: "img/snus.png",
    hover: {
        toDraw: "img/snus.png",
        w : 200,
        h : 200
    },
    click : () => console.log("oui"),
    alwaysViewUnhovered: true,
    w : 100,
    h : 100
})

app.start()