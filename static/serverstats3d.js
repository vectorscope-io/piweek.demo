/* global THREE */
var viewport = function(container, background, callback){
    'use strict';
    var width = container.clientWidth;
    var height = container.clientHeight;

    var scene = new THREE.Scene({antialias: true, alpha: false});
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth/ window.innerHeight, 0.1,1000);
    // var camera = new THREE.OrthographicCamera(width/ -2, width / 2, height / 2, height / -2, 1, 1000);
    camera.position.z = 350;

    var controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );
    controls.target.x = 0;
    controls.target.y = 0;
    controls.target.z = 0;

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(background);

    function render(){
        renderer.render(scene, camera);
    }
    container.addEventListener('render', render);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
    }
    animate();

    container.appendChild( renderer.domElement );
    callback(container, scene);
};

var basicLineGraph = function(hexColor, namespace, container, scene, depth){
    'use strict';
    var padding = 20;

    var width = container.clientWidth;
    var height = container.clientHeight;

    var domain = {
        //domain: the scope of the values (max and min values)
        y: { max: height/8, min: height/-8},
        x: { max: height - padding, min: padding }
    };
    domain.y.range = domain.y.max - domain.y.min;
    domain.x.range = domain.x.max - domain.x.min;

    var point = new THREE.Vector3(0, 0, -depth * padding);
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
        step.z = -depth * padding;
        var geometry = new THREE.Geometry();
        geometry.vertices.push(point.clone(), step.clone());
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: hexColor}));
        if(point.x > 0) {line_handler.add(line);}
        if (line_handler.children.length >= 10) { line_handler.remove(line.children[0]); }
        line_handler.position.x = -step.x;
        point = step;
        time = data.timestamp;
        container.dispatchEvent(new CustomEvent('render', {}));
    });
};

var cube = function (scene, size, color){
    'use strict';
    console.log('cube', scene, size);
    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshBasicMaterial()
    );
    scene.add(cube);

    var edge = new THREE.EdgesHelper(cube, color);
    edge.material.linewidth = 2;
    scene.add(edge);

    return cube;
};

viewport(document.querySelector('.graph[data-metric="cpu"]'), 0x333333, function(container, scene){
    'use strict';
    for (var i =0, l =10; i < l; i++){
        basicLineGraph(0xff0000, 'iknite-xps.cpu.user', container, scene, i - (l/2));
        basicLineGraph(0x00ff00, 'iknite-xps.cpu.sys', container, scene, i - (l/2));
        basicLineGraph(0x0000ff, 'iknite-xps.cpu.stolen', container, scene, i - (l/2));
        basicLineGraph(0xff00ff, 'iknite-xps.cpu.idle', container, scene, i - (l/2));
    }
    // cube(scene, 5, 0x333333);
});
