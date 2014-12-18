/* global THREE */
var Renderer = function(container, scene, camera){
    'use strict';
    var renderer = new THREE.WebGLRenderer({antialias: true});
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf0f0f0);
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

var basicLineGraph = function(container){
    'use strict';
    var width = container.clientWidth;
    var height = container.clientHeight;
    var scene = Scene();
    var camera = Camera(width, height);
    var renderer = Renderer(container, scene, camera);
    container.appendChild( renderer.domElement );

    var padding = 20;

    var domain = {
        //domain: the scope of the values (max and min values)
        //TODO: create a dynamic domain generator based on dimensions' values.
        y: { max: height/2, min: height/-2 },
        x: { max: height - padding, min: padding }
    };

    var point = new THREE.Vector3(0, 0, 0);
    var line_handler = new THREE.Object3D();
    scene.add(line_handler);

    container.addEventListener('render', function(){
        var step = new THREE.Vector3(point.x, point.y, point.z);
        step.x += 1;
        step.y = Math.max(domain.y.min, Math.min(domain.y.max,
             point.y + (Math.random() * 100) - 50)
        );
        var geometry = new THREE.Geometry();
        geometry.vertices.push(point.clone(), step.clone());
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xfabada}));
        line_handler.add(line);
        line_handler.position.x = -step.x;
        point = step;
    });
};

basicLineGraph(document.querySelector('.graph[data-metric="cpu"]'));
basicLineGraph(document.querySelector('.graph[data-metric="mem"]'));
basicLineGraph(document.querySelector('.graph[data-metric="load"]'));
