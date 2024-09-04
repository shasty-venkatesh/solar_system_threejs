import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const textLoader = new THREE.TextureLoader();

const scene = new THREE.Scene();

// Load textures
const sunTexture = textLoader.load("testure/2k_sun.jpg");
const mercuryTexture = textLoader.load("testure/2k_mercury.jpg");
const venusTexture = textLoader.load("testure/8k_venus_surface.jpg");
const earthTexture = textLoader.load("testure/8k_earth_daymap.jpg");
const marsTexture = textLoader.load("testure/8k_mars.jpg");
const moonTexture = textLoader.load("testure/8k_moon.jpg");
const backgroundTexture = textLoader.load("testure/8k_stars_milky_way.jpg");
// Set geometry
const sphereGeometry = new THREE.SphereGeometry(1, 36, 36);

// Materials
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

// Create sun
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.setScalar(5);
scene.add(sun);
scene.background = backgroundTexture;

// Define planets and moons
const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.01,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: earthMaterial,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.015,
      },
    ],
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.02,
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.015,
      },
    ],
  },
];
const ambient = new THREE.AmbientLight("while", 0.1);

scene.add(ambient);

const pointLight = new THREE.PointLight("#F6EDA1", 2000, 0);
pointLight.position.set(2, 2, 2); // Position at the center where the sun is
scene.add(pointLight); // Add the point light to the scene

// Create planets and their moons
const planetMeshes = planets.map((planet) => {
  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.scale.setScalar(planet.radius);
  planetMesh.position.x = planet.distance;
  scene.add(planetMesh);

  planet.moons.forEach((moon) => {
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.setScalar(moon.radius);
    moonMesh.position.x = moon.distance; // relative to planet
    planetMesh.add(moonMesh); // Attach moon to the planet mesh
  });

  return planetMesh;
});

// Camera and controls
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  90
);

camera.position.z = 35;
const maxPixelRatio = Math.min(1, window.devicePixelRatio);
const canvas = document.querySelector("#box");

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(maxPixelRatio);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
console.log(planetMeshes[3]);
// Animation loop
const clock = new THREE.Clock();

const renderLoop = () => {
  const delta = clock.getElapsedTime();

  // Sun rotation
  sun.rotation.y = delta;

  // Planet and moon rotation/orbits
  planetMeshes.forEach((planetMesh, index) => {
    const planet = planets[index];

    // Rotate the planet around its own axis
    planetMesh.rotation.y = delta * planet.speed * 10;

    // Planet's orbit around the sun (using delta * speed)
    planetMesh.position.x =
      Math.cos(delta * planet.speed * 100) * planet.distance;
    planetMesh.position.z =
      Math.sin(delta * planet.speed * 100) * planet.distance;
    planetMesh.children.forEach((moon, moonindex) => {
      moon.rotation.y = planets[index].moons[moonindex].speed * 10;
      moon.position.x =
        Math.cos(delta * planets[index].moons[moonindex].speed * 100) *
        planets[index].moons[moonindex].distance;
      moon.position.z =
        Math.sin(delta * planets[index].moons[moonindex].speed * 100) *
        planets[index].moons[moonindex].distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderLoop);
};

renderLoop();
