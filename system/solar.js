        // Main application
        class SolarSystem {
            constructor() {
                // Initialize properties
                this.texturesLoaded = 0;
                this.totalTextures = 0;
                this.labelsVisible = true;  // Initialize labels visibility
                
                // Scene setup
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                
                // Camera controls Nothing nothing
                this.camera.position.set(0, 50, 200);
                this.camera.lookAt(0, 0, 0);
                
                // Renderer setup
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.renderer.toneMappingExposure = 1;
                document.getElementById('container').appendChild(this.renderer.domElement);
                
                // Solar system data
                this.planetsData = this.getPlanetsData();
                
                // Create solar system after textures are loaded
                this.loadTextures().then(() => {
                    this.createSolarSystem();
                    document.getElementById('loading').style.display = 'none';
                });
                
                // Controls
                this.setupControls();
                this.setupUI();
                
                
                // Animation
                this.animationId = null;
                this.isRotating = true;
                this.realisticLighting = true;
                
                // Start animation
                this.animate();
                
                // Handle window resize
                window.addEventListener('resize', () => this.onWindowResize());
            }
            
            async loadTextures() {
                const textureLoader = new THREE.TextureLoader();
                
                // Load sun texture
                this.sunTexture = await this.createProceduralSunTexture();
                
                // Load planet textures (using procedural generation for simplicity)
                this.planetTextures = {};
                
                // Create realistic planet textures procedurally
                for (const planet of this.planetsData) {
                    if (planet.name !== 'Sun') {
                        this.planetTextures[planet.name] = await this.createPlanetTexture(planet);
                    }
                }
            }
            
            createProceduralSunTexture() {
                return new Promise((resolve) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    const context = canvas.getContext('2d');
                    
                    // Create gradient for sun
                    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(0.1, '#ffff00');
                    gradient.addColorStop(0.3, '#ffaa00');
                    gradient.addColorStop(0.6, '#ff5500');
                    gradient.addColorStop(1, '#ff0000');
                    
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, 512, 512);
                    
                    // Add some noise for texture
                    const imageData = context.getImageData(0, 0, 512, 512);
                    const data = imageData.data;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        // Add slight variation to create a more realistic surface
                        const noise = Math.random() * 30;
                        data[i] = Math.min(255, data[i] + noise);     // Red
                        data[i+1] = Math.max(0, data[i+1] - noise/2); // Green
                        data[i+2] = Math.max(0, data[i+2] - noise);   // Blue
                    }
                    
                    context.putImageData(imageData, 0, 0);
                    
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                });
            }
            
            createPlanetTexture(planetData) {
                return new Promise((resolve) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    const context = canvas.getContext('2d');
                    
                    // Base color
                    context.fillStyle = this.getPlanetBaseColor(planetData);
                    context.fillRect(0, 0, 512, 512);
                    
                    // Add details based on planet type
                    switch(planetData.name) {
                        case 'Earth':
                            this.addEarthDetails(context);
                            break;
                        case 'Jupiter':
                            this.addJupiterDetails(context);
                            break;
                        case 'Mars':
                            this.addMarsDetails(context);
                            break;
                        case 'Venus':
                            this.addVenusDetails(context);
                            break;
                        default:
                            this.addGenericPlanetDetails(context, planetData);
                    }
                    
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                });
            }
            
            getPlanetBaseColor(planetData) {
                const colors = {
                    'Mercury': '#8c8c8c',
                    'Venus': '#e6b87e',
                    'Earth': '#2a6bbe',
                    'Mars': '#cc6a4a',
                    'Jupiter': '#d8ca9d',
                    'Saturn': '#e3d8b0',
                    'Uranus': '#a6d1e6',
                    'Neptune': '#3d5aa8'
                };
                return colors[planetData.name] || '#ffffff';
            }
            
            addEarthDetails(context) {
                // Add green continents
                context.fillStyle = '#2d5f2d';
                context.beginPath();
                context.arc(150, 200, 60, 0, Math.PI * 2);
                context.fill();
                
                context.beginPath();
                context.arc(350, 300, 40, 0, Math.PI * 2);
                context.fill();
                
                context.beginPath();
                context.arc(400, 150, 50, 0, Math.PI * 2);
                context.fill();
                
                // Add white clouds
                context.fillStyle = 'rgba(255, 255, 255, 0.7)';
                context.beginPath();
                context.arc(200, 100, 30, 0, Math.PI * 2);
                context.fill();
                
                context.beginPath();
                context.arc(300, 400, 25, 0, Math.PI * 2);
                context.fill();
            }
            
            addJupiterDetails(context) {
                // Add banding pattern
                for (let i = 0; i < 10; i++) {
                    const y = i * 50;
                    const height = 30 + Math.random() * 20;
                    const hue = 40 + Math.random() * 10;
                    
                    context.fillStyle = `hsl(${hue}, 70%, ${50 + Math.random() * 20}%)`;
                    context.fillRect(0, y, 512, height);
                }
                
                // Add Great Red Spot
                context.fillStyle = '#b85c5c';
                context.beginPath();
                context.arc(400, 256, 40, 0, Math.PI * 2);
                context.fill();
            }
            
            addMarsDetails(context) {
                // Add reddish surface with darker spots
                for (let i = 0; i < 100; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 512;
                    const radius = 5 + Math.random() * 15;
                    
                    context.fillStyle = `rgba(100, 40, 20, ${0.3 + Math.random() * 0.4})`;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                }
            }
            
            addVenusDetails(context) {
                // Add yellowish cloud patterns
                for (let i = 0; i < 50; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 512;
                    const radius = 10 + Math.random() * 30;
                    
                    context.fillStyle = `rgba(230, 200, 150, ${0.2 + Math.random() * 0.3})`;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                }
            }
            
            addGenericPlanetDetails(context, planetData) {
                // Add some random surface variation
                for (let i = 0; i < 30; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 512;
                    const radius = 5 + Math.random() * 20;
                    
                    const brightness = 30 + Math.random() * 40;
                    context.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${0.2 + Math.random() * 0.4})`;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                }
            }
            
            setupLighting() {
                // Clear existing lights
                while(this.scene.children.find(child => child.isLight)) {
                    const light = this.scene.children.find(child => child.isLight);
                    this.scene.remove(light);
                }
                
                if (this.realisticLighting) {
                    // Realistic lighting - only sun illuminates
                    this.sunLight = new THREE.PointLight(0xffffff, 2, 2000);
                    this.sunLight.position.set(0, 0, 0);
                    this.sunLight.castShadow = true;
                    this.sunLight.shadow.mapSize.width = 2048;
                    this.sunLight.shadow.mapSize.height = 2048;
                    this.sunLight.shadow.camera.near = 0.5;
                    this.sunLight.shadow.camera.far = 2000;
                    this.scene.add(this.sunLight);
                    
                    // Very subtle ambient light so dark sides aren't completely black
                    const ambientLight = new THREE.AmbientLight(0x111111);
                    this.scene.add(ambientLight);
                } else {
                    // Enhanced lighting for better visibility
                    this.sunLight = new THREE.PointLight(0xffffff, 1.5, 2000);
                    this.sunLight.position.set(0, 0, 0);
                    this.sunLight.castShadow = true;
                    this.scene.add(this.sunLight);
                    
                    const ambientLight = new THREE.AmbientLight(0x333333);
                    this.scene.add(ambientLight);
                    
                    // Add some directional light for better definition
                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
                    directionalLight.position.set(50, 50, 50);
                    this.scene.add(directionalLight);
                }
            }
            
            getPlanetsData() {
                return [
                    { name: 'Sun', radius: 20, distance: 0, speed: 0, rotationSpeed: 0.005, color: 0xffaa33, texture: null, hasRings: false, eccentricity: 0 },
                    { name: 'Mercury', radius: 0.8, distance: 35, speed: 0.01, rotationSpeed: 0.004, color: 0xaaaaaa, texture: null, hasRings: false, eccentricity: 0.205 },
                    { name: 'Venus', radius: 1.5, distance: 50, speed: 0.007, rotationSpeed: 0.002, color: 0xffcc99, texture: null, hasRings: false, eccentricity: 0.007 },
                    { name: 'Earth', radius: 1.6, distance: 70, speed: 0.005, rotationSpeed: 0.01, color: 0x2233ff, texture: null, hasRings: false, eccentricity: 0.017 },
                    { name: 'Mars', radius: 1.2, distance: 90, speed: 0.004, rotationSpeed: 0.008, color: 0xff6600, texture: null, hasRings: false, eccentricity: 0.094 },
                    { name: 'Jupiter', radius: 4, distance: 130, speed: 0.002, rotationSpeed: 0.02, color: 0xffaa77, texture: null, hasRings: false, eccentricity: 0.049 },
                    { name: 'Saturn', radius: 3.5, distance: 170, speed: 0.0015, rotationSpeed: 0.018, color: 0xffdd99, texture: null, hasRings: true, eccentricity: 0.057 },
                    { name: 'Uranus', radius: 2.5, distance: 200, speed: 0.001, rotationSpeed: 0.015, color: 0x99ddff, texture: null, hasRings: false, eccentricity: 0.046 },
                    { name: 'Neptune', radius: 2.4, distance: 230, speed: 0.0008, rotationSpeed: 0.016, color: 0x3366ff, texture: null, hasRings: false, eccentricity: 0.011 }
                ];
            }
            
            createSolarSystem() {
                // Create starfield background
                this.createStarfield();
                
                // Setup lighting
                this.setupLighting();
                
                // Create sun and planets
                this.planetsData.forEach(planetData => {
                    if (planetData.name === 'Sun') {
                        this.createSun(planetData);
                    } else {
                        this.createPlanet(planetData);
                    }
                });
                
                // Create asteroid belt between Mars and Jupiter
                this.createAsteroidBelt();
            }
            
            createStarfield() {
                const starGeometry = new THREE.BufferGeometry();
                const starMaterial = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.5,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.8
                });
                
                const starVertices = [];
                for (let i = 0; i < 15000; i++) {
                    const x = (Math.random() - 0.5) * 3000;
                    const y = (Math.random() - 0.5) * 3000;
                    const z = (Math.random() - 0.5) * 3000;
                    starVertices.push(x, y, z);
                }
                
                starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
                const stars = new THREE.Points(starGeometry, starMaterial);
                this.scene.add(stars);
                
                // Add twinkling effect
                this.stars = stars;
            }
            
            createSun(planetData) {
                // Create sun geometry with high resolution for better texture mapping
                const geometry = new THREE.SphereGeometry(planetData.radius, 64, 64);
                
                // Create sun material with texture
                const material = new THREE.MeshBasicMaterial({
                    map: this.sunTexture,
                    emissive: 0xff5500,
                    emissiveIntensity: 1
                });
                
                const sun = new THREE.Mesh(geometry, material);
                sun.name = planetData.name;
                this.scene.add(sun);
                
                // Add corona/glow effect
                this.createSunCorona(sun, planetData.radius);
                
                // Store reference to the sun
                this.sun = sun;
            }
            
            createSunCorona(sun, radius) {
                // Create a larger sphere for the corona
                const coronaGeometry = new THREE.SphereGeometry(radius * 1.3, 32, 32);
                const coronaMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        glowColor: { value: new THREE.Color(0xff4500) }
                    },
                    vertexShader: `
                        varying vec3 vNormal;
                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;
                        uniform vec3 glowColor;
                        varying vec3 vNormal;
                        
                        void main() {
                            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                            // Add pulsing effect
                            intensity *= 0.8 + 0.2 * sin(time * 5.0);
                            gl_FragColor = vec4(glowColor, intensity * 0.5);
                        }
                    `,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                    transparent: true
                });
                
                const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
                sun.add(corona);
                this.coronaMaterial = coronaMaterial;
            }
            
            createPlanet(planetData) {
                // Create planet geometry
                const geometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
                const material = new THREE.MeshLambertMaterial({
                    map: this.planetTextures[planetData.name]
                });
                
                const planet = new THREE.Mesh(geometry, material);
                planet.name = planetData.name;
                planet.castShadow = true;
                planet.receiveShadow = true;
                
                // Create elliptical orbit path
                this.createOrbitPath(planetData);
                
                // Position planet
                planet.position.x = planetData.distance;
                this.scene.add(planet);
                
                // Add rings for Saturn
                if (planetData.hasRings) {
                    this.createPlanetRings(planet, planetData.radius);
                }
                
                // Add moons for some planets
                if (planetData.name === 'Earth') {
                    this.createMoon(planet, planetData.radius);
                }
                
                // Store planet data for animation
                if (!this.planets) this.planets = [];
                this.planets.push({
                    mesh: planet,
                    data: planetData,
                    angle: Math.random() * Math.PI * 2 // Random starting position
                });
            }
            
            createOrbitPath(planetData) {
                // Create elliptical orbit path
                const points = [];
                const segments = 128;
                
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    // Elliptical orbit calculation
                    const a = planetData.distance; // Semi-major axis
                    const e = planetData.eccentricity; // Eccentricity
                    const r = a * (1 - e*e) / (1 + e * Math.cos(angle));
                    
                    const x = r * Math.cos(angle);
                    const z = r * Math.sin(angle);
                    
                    points.push(new THREE.Vector3(x, 0, z));
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: 0x444444,
                    transparent: true,
                    opacity: 0.3,
                    linewidth: 1
                });
                
                const orbit = new THREE.Line(geometry, material);
                orbit.name = `${planetData.name}Orbit`;
                this.scene.add(orbit);
            }
            
            createPlanetRings(planet, planetRadius) {
                const innerRadius = planetRadius * 1.5;
                const outerRadius = planetRadius * 2.5;
                const thetaSegments = 64;
                
                const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffdd99,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                
                const rings = new THREE.Mesh(geometry, material);
                rings.rotation.x = Math.PI / 2;
                planet.add(rings);
            }
            
            createMoon(planet, planetRadius) {
                const geometry = new THREE.SphereGeometry(planetRadius * 0.3, 16, 16);
                const material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
                
                const moon = new THREE.Mesh(geometry, material);
                moon.position.set(planetRadius * 2, 0, 0);
                planet.add(moon);
                
                // Store moon reference for animation
                if (!this.moons) this.moons = [];
                this.moons.push({
                    mesh: moon,
                    parent: planet,
                    distance: planetRadius * 2,
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.05
                });
            }
            
            createAsteroidBelt() {
                const asteroidCount = 500;
                const innerRadius = 100;
                const outerRadius = 120;
                
                const geometry = new THREE.SphereGeometry(0.2, 8, 8);
                const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
                
                this.asteroids = [];
                
                for (let i = 0; i < asteroidCount; i++) {
                    const asteroid = new THREE.Mesh(geometry, material);
                    
                    // Random position in the asteroid belt
                    const angle = Math.random() * Math.PI * 2;
                    const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
                    const height = (Math.random() - 0.5) * 10;
                    
                    asteroid.position.x = Math.cos(angle) * distance;
                    asteroid.position.z = Math.sin(angle) * distance;
                    asteroid.position.y = height;
                    
                    this.scene.add(asteroid);
                    this.asteroids.push({
                        mesh: asteroid,
                        angle: angle,
                        distance: distance,
                        height: height,
                        speed: 0.001 + Math.random() * 0.001
                    });
                }
            }
            
            setupControls() {
                // Mouse controls
                this.mouse = new THREE.Vector2();
                this.raycaster = new THREE.Raycaster();
                
                // Camera control variables
                this.isDragging = false;
                this.previousMousePosition = {
                    x: 0,
                    y: 0
                };
                
                // Event listeners for mouse controls
                this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
                this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
                this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp());
                this.renderer.domElement.addEventListener('wheel', (e) => this.onMouseWheel(e));
                this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
                
                // Add click event for planet selection
                this.renderer.domElement.addEventListener('click', (e) => this.onPlanetClick(e));
            }

            setupUI() {
                // Bind the methods to this instance
                this.handleZoom = this.handleZoom.bind(this);
                this.resetCamera = this.resetCamera.bind(this);

                // Reset view button
                const resetButton = document.getElementById('resetView');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        this.resetCamera();
                    });
                }

                // Other controls
                document.getElementById('toggleOrbits').addEventListener('click', (e) => {
                    const orbitPaths = this.scene.children.filter(child => child.userData.isOrbit);
                    orbitPaths.forEach(orbit => {
                        orbit.visible = !orbit.visible;
                    });
                    e.target.textContent = orbitPaths.some(orbit => orbit.visible) ? 'Hide Orbits' : 'Show Orbits';
                });

                document.getElementById('toggleLabels').addEventListener('click', (e) => {
                    const labels = document.querySelectorAll('.planet-label');
                    labels.forEach(label => {
                        label.style.opacity = label.style.opacity === '1' ? '0' : '1';
                    });
                    e.target.textContent = e.target.textContent === 'Show Labels' ? 'Hide Labels' : 'Show Labels';
                });

                document.getElementById('toggleRotation').addEventListener('click', (e) => {
                    this.isRotating = !this.isRotating;
                    e.target.textContent = this.isRotating ? 'Pause Rotation' : 'Resume Rotation';
                });

                document.getElementById('toggleLighting').addEventListener('click', (e) => {
                    this.realisticLighting = !this.realisticLighting;
                    this.setupLighting();
                    e.target.textContent = this.realisticLighting ? 'Simple Lighting' : 'Realistic Lighting';
                });
            }

            zoomCamera(factor) {
                // Get current camera direction vector
                const direction = new THREE.Vector3();
                this.camera.getWorldDirection(direction);
                
                // Calculate new position
                const currentDistance = this.camera.position.length();
                const newDistance = Math.min(Math.max(currentDistance * factor, 50), 500); // Limit zoom between 50 and 500 units
                
                // Scale the camera position to the new distance
                this.camera.position.normalize().multiplyScalar(newDistance);
                
                // Ensure camera keeps looking at the center
                this.camera.lookAt(0, 0, 0);
            }
            
            setupUI() {
                // Reset view button
                document.getElementById('resetView').addEventListener('click', () => {
                    this.camera.position.set(0, 50, 200);
                    this.camera.lookAt(0, 0, 0);
                });
                
                // Toggle orbits button
                document.getElementById('toggleOrbits').addEventListener('click', (e) => {
                    const orbitsVisible = this.scene.children.some(child => 
                        child.name && child.name.includes('Orbit') && child.visible
                    );
                    
                    this.scene.children.forEach(child => {
                        if (child.name && child.name.includes('Orbit')) {
                            child.visible = !orbitsVisible;
                        }
                    });
                    
                    e.target.textContent = orbitsVisible ? 'Show Orbits' : 'Hide Orbits';
                });
                
                // Toggle labels button
                const toggleLabelsBtn = document.getElementById('toggleLabels');
                toggleLabelsBtn.textContent = this.labelsVisible ? 'Hide Labels' : 'Show Labels';
                toggleLabelsBtn.addEventListener('click', () => {
                    this.labelsVisible = !this.labelsVisible;
                    toggleLabelsBtn.textContent = this.labelsVisible ? 'Hide Labels' : 'Show Labels';
                    
                    // Remove all existing labels if hiding
                    if (!this.labelsVisible) {
                        const existingLabels = document.querySelectorAll('.planet-label');
                        existingLabels.forEach(label => label.remove());
                    }
                });
                
                // Toggle rotation button
                document.getElementById('toggleRotation').addEventListener('click', (e) => {
                    this.isRotating = !this.isRotating;
                    e.target.textContent = this.isRotating ? 'Pause Rotation' : 'Resume Rotation';
                });
                
                // Toggle lighting button
                document.getElementById('toggleLighting').addEventListener('click', (e) => {
                    this.realisticLighting = !this.realisticLighting;
                    this.setupLighting();
                    e.target.textContent = this.realisticLighting ? 'Enhanced Lighting' : 'Realistic Lighting';
                });
            }
            
            // ... (rest of the control methods remain the same as in the previous implementation)
            onMouseDown(event) {
                this.isDragging = true;
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
            
            onMouseMove(event) {
                if (!this.isDragging) return;
                
                const deltaMove = {
                    x: event.clientX - this.previousMousePosition.x,
                    y: event.clientY - this.previousMousePosition.y
                };
                
                if (event.buttons === 1) { // Left mouse button - rotate
                    // Rotate camera around the scene
                    const theta = deltaMove.x * 0.01;
                    const phi = deltaMove.y * 0.01;
                    
                    // Convert to spherical coordinates
                    const spherical = new THREE.Spherical();
                    spherical.setFromVector3(this.camera.position);
                    
                    spherical.theta -= theta;
                    spherical.phi -= phi;
                    
                    // Clamp phi to avoid flipping
                    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                    
                    this.camera.position.setFromSpherical(spherical);
                    this.camera.lookAt(0, 0, 0);
                } else if (event.buttons === 2) { // Right mouse button - pan
                    // Pan the camera
                    const panSpeed = 0.5;
                    this.camera.position.x -= deltaMove.x * panSpeed;
                    this.camera.position.y += deltaMove.y * panSpeed;
                    this.camera.lookAt(0, 0, 0);
                }
                
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
            
            onMouseUp() {
                this.isDragging = false;
            }
            
            onMouseWheel(event) {
                event.preventDefault();
                // Zoom in/out
                const factor = event.deltaY > 0 ? 1.1 : 0.9;
                this.handleZoom(factor);
            }

            handleZoom(factor) {
                // Get current distance from center
                const currentDistance = this.camera.position.length();
                
                // Calculate new distance with limits
                const minDistance = 30;  // Don't get closer than 30 units
                const maxDistance = 500; // Don't get farther than 500 units
                const newDistance = Math.min(Math.max(currentDistance * factor, minDistance), maxDistance);
                
                // Store current position
                const currentPos = this.camera.position.clone();
                
                // Calculate new position
                const newPos = currentPos.normalize().multiplyScalar(newDistance);
                
                // Apply new position
                this.camera.position.copy(newPos);
                
                // Ensure camera keeps looking at the center
                this.camera.lookAt(0, 0, 0);
                
                // Force a render update
                this.renderer.render(this.scene, this.camera);
            }
            
            resetCamera() {
                // Reset to initial position
                this.camera.position.set(0, 50, 200);
                this.camera.lookAt(0, 0, 0);
            }
            
            onPlanetClick(event) {
                // Calculate mouse position in normalized device coordinates
                this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                
                // Update the picking ray with the camera and mouse position
                this.raycaster.setFromCamera(this.mouse, this.camera);
                
                // Calculate objects intersecting the picking ray
                const intersects = this.raycaster.intersectObjects(this.scene.children);
                
                if (intersects.length > 0) {
                    const object = intersects[0].object;
                    
                    // Check if we clicked on a planet (not the sun or orbit)
                    if (object.name && object.name !== 'Sun' && !object.name.includes('Orbit')) {
                        // Focus on the planet
                        this.focusOnPlanet(object);
                        
                        // Show planet info
                        this.showPlanetInfo(object.name);
                    }
                }
            }
            
            showPlanetInfo(planetName) {
                const infoDiv = document.getElementById('selectedPlanet');
                const planetData = this.planetsData.find(p => p.name === planetName);
                
                if (planetData) {
                    infoDiv.innerHTML = `<h3>${planetName}</h3>`;
                    
                    if (planetName === 'Sun') {
                        infoDiv.innerHTML += `<p>Star at the center of our solar system</p>`;
                    } else {
                        infoDiv.innerHTML += `
                            <p>Distance from Sun: ${planetData.distance} million km</p>
                            <p>Orbital period: ${Math.round(2 * Math.PI / planetData.speed)} days</p>
                        `;
                    }
                    
                    infoDiv.style.opacity = 1;
                    
                    // Hide after 5 seconds
                    setTimeout(() => {
                        infoDiv.style.opacity = 0;
                    }, 5000);
                }
            }
            
            focusOnPlanet(planet) {
                // Calculate position to view the planet from a good angle
                const planetPosition = planet.position.clone();
                const direction = planetPosition.clone().normalize();
                const distance = planetPosition.length() + 15; // Stay 15 units away from the planet
                
                // Position camera behind and slightly above the planet
                const cameraPosition = planetPosition.clone().add(
                    direction.multiplyScalar(-distance)
                );
                cameraPosition.y += 5; // Slightly above
                
                // Animate camera to new position
                this.animateCameraTo(cameraPosition, planetPosition);
            }
            
            animateCameraTo(targetPosition, lookAtPosition) {
                const startPosition = this.camera.position.clone();
                const startTime = Date.now();
                const duration = 1000; // Animation duration in milliseconds
                
                const animate = () => {
                    const currentTime = Date.now();
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Use easing function for smooth animation
                    const easeProgress = this.easeInOutCubic(progress);
                    
                    // Interpolate position
                    this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                    this.camera.lookAt(lookAtPosition);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            }
            
            easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            
            onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
            
            animate() {
                this.animationId = requestAnimationFrame(() => this.animate());
                
                // Update corona animation
                if (this.coronaMaterial) {
                    this.coronaMaterial.uniforms.time.value += 0.01;
                }
                
                // Twinkle stars
                if (this.stars) {
                    this.stars.rotation.y += 0.0001;
                }
                
                if (this.isRotating) {
                    // Rotate the sun
                    if (this.sun) {
                        this.sun.rotation.y += 0.005;
                    }
                    
                    // Animate planets
                    if (this.planets) {
                        this.planets.forEach(planet => {
                            // Update planet position in elliptical orbit
                            planet.angle += planet.data.speed;
                            
                            // Elliptical orbit calculation
                            const a = planet.data.distance; // Semi-major axis
                            const e = planet.data.eccentricity; // Eccentricity
                            const r = a * (1 - e*e) / (1 + e * Math.cos(planet.angle));
                            
                            planet.mesh.position.x = r * Math.cos(planet.angle);
                            planet.mesh.position.z = r * Math.sin(planet.angle);
                            
                            // Rotate planet on its axis
                            planet.mesh.rotation.y += planet.data.rotationSpeed;
                        });
                    }
                    
                    // Animate moons
                    if (this.moons) {
                        this.moons.forEach(moon => {
                            moon.angle += moon.speed;
                            moon.mesh.position.x = Math.cos(moon.angle) * moon.distance;
                            moon.mesh.position.z = Math.sin(moon.angle) * moon.distance;
                        });
                    }
                    
                    // Animate asteroids
                    if (this.asteroids) {
                        this.asteroids.forEach(asteroid => {
                            asteroid.angle += asteroid.speed;
                            asteroid.mesh.position.x = Math.cos(asteroid.angle) * asteroid.distance;
                            asteroid.mesh.position.z = Math.sin(asteroid.angle) * asteroid.distance;
                            
                            // Slight vertical oscillation
                            asteroid.mesh.position.y = asteroid.height + Math.sin(asteroid.angle * 3) * 2;
                        });
                    }
                }
                
                // Update labels if visible
                if (this.labelsVisible && this.planets) {
                    this.updatePlanetLabels();
                }
                
                this.renderer.render(this.scene, this.camera);
            }
            
            updatePlanetLabels() {
                // Only proceed if we have planets and labels should be visible
                if (!this.planets || !this.labelsVisible) {
                    // Remove any existing labels if we shouldn't show them
                    const existingLabels = document.querySelectorAll('.planet-label');
                    existingLabels.forEach(label => label.remove());
                    return;
                }
                
                // Remove existing labels before creating new ones
                const existingLabels = document.querySelectorAll('.planet-label');
                existingLabels.forEach(label => label.remove());
                
                // Create new labels for each planet
                this.planets.forEach(planet => {
                    const planetPosition = planet.mesh.position.clone();
                    planetPosition.project(this.camera);
                    
                    // Only show label if planet is in front of camera
                    if (planetPosition.z < 1) {
                        const x = (planetPosition.x * 0.5 + 0.5) * window.innerWidth;
                        const y = (-planetPosition.y * 0.5 + 0.5) * window.innerHeight;
                        
                        const label = document.createElement('div');
                        label.className = 'planet-label';
                        label.textContent = planet.data.name;
                        label.style.left = `${x}px`;
                        label.style.top = `${y}px`;
                        
                        document.getElementById('container').appendChild(label);
                    }
                });
            }
        }

        // Initialize the solar system when the page loads
        window.addEventListener('DOMContentLoaded', () => {
            new SolarSystem();
        });