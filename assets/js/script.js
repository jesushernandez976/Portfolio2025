import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Camera
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 3);
scene.add(light);

scene.background = new THREE.Color(0x000000);

const particleCount = 1500;
const particles = new THREE.BufferGeometry();
const positions = [];
const opacities = new Float32Array(particleCount).fill(1.0); // Stores individual opacity values
const flickerSpeeds = new Float32Array(particleCount).fill(0.04); // Controls how fast each particle flickers

for (let i = 0; i < particleCount; i++) {
    positions.push(Math.random() * 1000 - 500); // x
    positions.push(Math.random() * 1000 - 500); // y
    positions.push(Math.random() * 1000 - 500); // z
    opacities[i] = Math.random(); // Start with random opacity
    flickerSpeeds[i] = Math.random() * 1 + 4; // Random flicker speed per particle
}

// Set attributes for position and opacity
particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particles.setAttribute('alpha', new THREE.Float32BufferAttribute(opacities, 1));

// Load circular particle texture
const particleTexture = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/circle.png");

const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        pointTexture: { value: particleTexture }
    },
    vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
            vAlpha = alpha;
            gl_PointSize = 4.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vAlpha;
        void main() {
            vec4 color = texture2D(pointTexture, gl_PointCoord);
            gl_FragColor = vec4(color.rgb, color.a * vAlpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Function to animate particle flickering smoothly
function animateParticleFlicker() {
    const alphaArray = particles.attributes.alpha.array;

    for (let i = 0; i < particleCount; i++) {
        alphaArray[i] += (Math.random() - 0.5) * (flickerSpeeds[i] * 0.008); // Dampen flicker speed
        alphaArray[i] = Math.max(0.1, Math.min(1.0, alphaArray[i]));
    }

    particles.attributes.alpha.needsUpdate = true;
}

const messages = [
    "Greetings, my name is Jesus!",
    "Welcome to my portfolio",
    "Explore my work and projects!",
  ];
  
  let messageIndex = 0;
  let charIndex = 0;
  let typingSpeed = 80;
  let pauseBetweenMessages = 2500;
  
  const typewriter = document.getElementById("typewriter");
  
  function type() {
    const currentMessage = messages[messageIndex];
    
    if (charIndex < currentMessage.length) {
      typewriter.textContent += currentMessage.charAt(charIndex);
      charIndex++;
      setTimeout(type, typingSpeed);
    } else {
      
      setTimeout(erase, pauseBetweenMessages);
    }
  }
  
  function erase() {
    const currentMessage = messages[messageIndex];
    
    if (charIndex > 0) {
      typewriter.textContent = currentMessage.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, typingSpeed / 2);
    } else {
      messageIndex = (messageIndex + 1) % messages.length;
      setTimeout(type, 500);
    }
  }
  
  type();




// Animation loop
function animate() {
    requestAnimationFrame(animate);

    controls.target.x += (mouseX * 2 - controls.target.x) * 0.05;
    controls.target.y += (mouseY * 2 - controls.target.y) * 0.05;
  
    particleSystem.rotation.y += 0.0008;
    particleSystem.rotation.x += 0.0002;
  
    animateParticleFlicker();
    controls.update(); // Required for damping or auto-rotate
    renderer.render(scene, camera); 
  }
  
animate();