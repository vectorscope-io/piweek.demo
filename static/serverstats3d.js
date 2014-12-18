/* global THREE */
var Renderer = function(container, scene, camera, background){
    'use strict';
    var renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(background);
    function render(){
        container.dispatchEvent(new CustomEvent('render'));
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
    return renderer;
};

var Scene = function(){
    'use strict';
    return new THREE.Scene({antialias: true, alpha: false});
};

var Camera = function (width, height){
    'use strict';
    var camera = new THREE.OrthographicCamera(width/ -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 100;
    return camera;
};

var viewport = function(container, callback){
    'use strict';
    var width = container.clientWidth;
    var height = container.clientHeight;

    var scene = Scene();
    var camera = Camera(width, height);
    var renderer = Renderer(container, scene, camera, 0xfdfdfd);
    container.appendChild( renderer.domElement );

    callback(container, scene);
};

var basicLineGraph = function(hexColor, namespace, width, height, scene){
    'use strict';
    var padding = 20;

    var domain = {
        //domain: the scope of the values (max and min values)
        //TODO: create a dynamic domain generator based on dimensions' values.
        y: { max: height/2, min: height/-2 },
        x: { max: height - padding, min: padding }
    };
    domain.y.range = domain.y.max - domain.y.min;
    domain.x.range = domain.x.max - domain.x.min;

    var point = new THREE.Vector3(0, 0, 0);
    var time = parseInt(new Date().getTime()/1000);
    var line_handler = new THREE.Object3D();
    scene.add(line_handler);

    window.addEventListener('wsMessage', function(event){
        var data = event.detail;
        if (data.name.substring(0, namespace.length) !== namespace){
            return;
        }
        var step = new THREE.Vector3(point.x, point.y, point.z);
        step.x += (data.timestamp - time) * 30;
        step.y = Math.max(domain.y.min, Math.min(domain.y.max,
            domain.y.min + (data.value * domain.y.range / 100)
        ));
        var geometry = new THREE.Geometry();
        geometry.vertices.push(point.clone(), step.clone());
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: hexColor}));
        line_handler.add(line);
        if (line_handler.children.length >= 10) { line_handler.remove(line.children[0]); }
        line_handler.position.x = -step.x;
        point = step;
        time = data.timestamp;
    });
};

viewport(document.querySelector('.graph[data-metric="cpu"]'), function(container, scene){
    'use strict';
    basicLineGraph(0xff0000, 'iknite-xps.cpu.user', container.clientWidth, container.clientHeight, scene);
    basicLineGraph(0x00ff00, 'iknite-xps.cpu.sys', container.clientWidth, container.clientHeight, scene);
    basicLineGraph(0x0000ff, 'iknite-xps.cpu.stolen', container.clientWidth, container.clientHeight, scene);
});

// viewport(document.querySelector('.graph[data-metric="mem"]'), function(container, scene){
//     'use strict';
//     basicLineGraph(0xff0000, 'iknite-xps.cpu.user', container.clientWidth, container.clientHeight, scene);
//     basicLineGraph(0x00ff00, 'iknite-xps.cpu.sys', container.clientWidth, container.clientHeight, scene);
//     basicLineGraph(0x0000ff, 'iknite-xps.cpu.stolen', container.clientWidth, container.clientHeight, scene);
// });


// viewport(document.querySelector('.graph[data-metric="load"]'), function(container, scene){
//     'use strict';
//     basicLineGraph(0xff0000, 'iknite-xps.cpu.user', container.clientWidth, container.clientHeight, scene);
//     basicLineGraph(0x00ff00, 'iknite-xps.cpu.sys', container.clientWidth, container.clientHeight, scene);
//     basicLineGraph(0x0000ff, 'iknite-xps.cpu.stolen', container.clientWidth, container.clientHeight, scene);
// });
