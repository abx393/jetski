import * as THREE from "https://unpkg.com/three@0.125.2/build/three.module.js";

import Stats from "https://unpkg.com/three@0.125.2/examples/jsm/libs/stats.module.js";

import { GUI } from "https://unpkg.com/three@0.125.2/examples/jsm/libs/dat.gui.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.125.2/examples/jsm/controls/PointerLockControls.js";
import { Water } from "https://unpkg.com/three@0.125.2/examples/jsm/objects/Water.js";
import { Sky } from "https://unpkg.com/three@0.125.2/examples/jsm/objects/Sky.js";

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh, sprite;

const KEY_SENSITIVITY = 3;
const WAVE_INTENSITY = 2.5;
const MIN_HEIGHT = 15;
const ANGLE = Math.PI / 6;
let prev_time = 0;
let velocity = {
  x: 0,
  y: 0,
  z: 0,
};

init();
animate();

function init() {
  container = document.getElementById("container");

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );

  camera.position.set(30, 15, 100);

  sun = new THREE.Vector3();

  // Water
  const waterGeometry = new THREE.PlaneGeometry(100000, 100000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "images/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffff00,
    waterColor: 0x40a4df,
    distortionScale: 0.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = (-9 * Math.PI) / 2;
  water.rotation.z = (-9 * Math.PI) / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    inclination: 0.49,
    azimuth: 0.205,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();

  //

  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const loader = new THREE.TextureLoader();
  const map = loader.load(
    "images/jetski_transparent_square.png",

    function (texture) {
      loadSprite(texture);
    },

    undefined,

    function (err) {
      console.error("Error: " + err);
    }
  );

  controls = new PointerLockControls(camera, document.body);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  let startBtn = document.getElementById("start_btn");
  startBtn.onclick = playAudio;

  document.onkeydown = function (e) {
    onKeyDown(e);
  };
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
  //controls.update();
}

function render() {
  const time = performance.now() * 0.001;

  sprite.position.y = (Math.sin(3*time) + 1) * WAVE_INTENSITY + MIN_HEIGHT;
  camera.position.y = sprite.position.y + 1.9;

  camera.position.z += velocity.z;
  sprite.position.z += velocity.z;
  sprite.position.x += velocity.x;
  camera.position.x += velocity.x;

  velocity.z = updateVelocity(0, velocity.z);
  velocity.x = updateVelocity(0, velocity.x);
  bank(camera, sprite, 0);

  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}

function playAudio() {
  // Create an AudioListener
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // Create a global audio source
  const sound = new THREE.Audio(listener);

  // Load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("sounds/jetski_motor.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.3);
    sound.play();
  });
}

function onKeyDown(e) {
  switch (e.keyCode) {
    case 37:
      // LEFT
      velocity.x = updateVelocity(-KEY_SENSITIVITY + velocity.x, velocity.x);
      velocity.z = updateVelocity(-KEY_SENSITIVITY, velocity.z);

      // bank left
      bank(camera, sprite, ANGLE);
      break;
    case 65:
      // LEFT
      velocity.x = updateVelocity(-KEY_SENSITIVITY, velocity.x);
      velocity.z = updateVelocity(-KEY_SENSITIVITY, velocity.z);

      // bank left
      bank(camera, sprite, ANGLE);
      break;
    case 38:
      // FORWARD
      velocity.z = updateVelocity(-KEY_SENSITIVITY, velocity.z);

      // realign vertically
      bank(camera, sprite, 0);
      break;
    case 87:
      // FORWARD
      velocity.z = updateVelocity(-KEY_SENSITIVITY, velocity.z);

      // realign vertically
      bank(camera, sprite, 0);
      break;
    case 39 :
      // RIGHT
      velocity.x = updateVelocity(KEY_SENSITIVITY + velocity.x, velocity.x);
      velocity.z = updateVelocity(-KEY_SENSITIVITY + velocity.z, velocity.z);

      // bank right
      bank(camera, sprite, -ANGLE);
      break;
    case 68:
      // RIGHT
      velocity.x = updateVelocity(KEY_SENSITIVITY, velocity.x);
      velocity.z = updateVelocity(-KEY_SENSITIVITY, velocity.z);

      // bank right
      bank(camera, sprite, -ANGLE);
      break;
  }
}

function loadSprite(texture) {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
  });

  sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.x = 30;
  sprite.position.z = 94;
  sprite.scale.set(11, 8, 11);
  scene.add(sprite);
}
