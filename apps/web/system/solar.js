import * as THREE from 'three';
import '../homepage/errorHandler.js';

// Main application
class SolarSystem {
    constructor() {
        this.texturesLoaded = 0;
        this.labelsVisible = true;
        this.isRotating = true;
        this.realisticLighting = true;
        this.animationId = null;

        // Check for embed mode
        this.isEmbedded = new URLSearchParams(window.location.search).get('embed') === 'true';
        if (this.isEmbedded) {
            document.body.classList.add('embedded');
        }

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 80, 250);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.getElementById('container').appendChild(this.renderer.domElement);

        // Texture Loader with Cross Origin Support
        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.setCrossOrigin('Anonymous');
        
        this.baseURL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';
        this.textures = {};

        // Definitions
        this.planetsData = this.getPlanetsData();
        this.planets = [];
        this.moons = [];
        this.asteroids = [];

        // Loading
        this.init().then(() => {
            document.getElementById('loading').style.display = 'none';
            this.animate();
        });

        // Controls
        this.setupControls();
        this.setupUI();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    async init() {
        await this.loadTextures();
        this.createStarfield();
        this.setupLighting();
        
        this.planetsData.forEach(planetData => {
            if (planetData.name === 'Sun') {
                this.createSun(planetData);
            } else {
                this.createPlanet(planetData);
            }
        });

        this.createAsteroidBelt();
    }

    async loadTextures() {
        const loadTex = (name, url) => {
            return new Promise(resolve => {
                this.textureLoader.load(url, tex => {
                    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                    this.textures[name] = tex;
                    resolve();
                }, undefined, () => resolve()); // Resolve anyway on error to not block
            });
        };

        const promises = [
            loadTex('earthColor', this.baseURL + 'earth_atmos_2048.jpg'),
            loadTex('earthNormal', this.baseURL + 'earth_normal_2048.jpg'),
            loadTex('earthSpecular', this.baseURL + 'earth_specular_2048.jpg'),
            loadTex('earthClouds', this.baseURL + 'earth_clouds_1024.png'),
            loadTex('jupiter', this.baseURL + 'jupiter.jpg'),
            loadTex('marsColor', this.baseURL + 'mars_1k_color.jpg'),
            loadTex('marsNormal', this.baseURL + 'mars_1k_normal.jpg'),
            loadTex('venusColor', this.baseURL + 'venus_surface_2048.jpg'),
            loadTex('venusAtmos', this.baseURL + 'venus_atmosphere_2048.jpg'),
            loadTex('moon', this.baseURL + 'moon_1024.jpg')
        ];

        await Promise.all(promises);
        
        // Procedural fallbacks for Sun and others
        this.textures['sun'] = this.createProceduralSunTexture();
        this.textures['mercury'] = this.createProceduralTexture('#8c8c8c', 50);
        this.textures['saturn'] = this.createProceduralTexture('#e3d8b0', 20, true);
        this.textures['uranus'] = this.createProceduralTexture('#a6d1e6', 10, true);
        this.textures['neptune'] = this.createProceduralTexture('#3d5aa8', 15, true);
        this.textures['saturnRing'] = this.createRingTexture('#e3d8b0');
    }

    createProceduralSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.1, '#ffc');
        grad.addColorStop(0.5, '#fa0');
        grad.addColorStop(1, '#f30');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Noise
        const imgData = ctx.getImageData(0, 0, 512, 512);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 40 - 20;
            data[i] = Math.min(255, data[i] + noise);
            data[i+1] = Math.max(0, data[i+1] + noise/2);
        }
        ctx.putImageData(imgData, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    createProceduralTexture(baseColor, noiseLvl, banding = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);

        if (banding) {
            for (let i = 0; i < 20; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.1})`;
                ctx.fillRect(0, Math.random()*512, 512, Math.random()*40);
            }
        } else {
            for (let i = 0; i < 1000; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.1})`;
                ctx.beginPath();
                ctx.arc(Math.random()*512, Math.random()*512, Math.random()*5, 0, Math.PI*2);
                ctx.fill();
            }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    createRingTexture(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createLinearGradient(0, 0, 256, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.1, color);
        grad.addColorStop(0.2, 'rgba(0,0,0,0)');
        grad.addColorStop(0.3, color);
        grad.addColorStop(0.5, 'rgba(0,0,0,0.8)');
        grad.addColorStop(0.7, color);
        grad.addColorStop(0.8, 'rgba(0,0,0,0)');
        grad.addColorStop(0.9, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 1);
        return new THREE.CanvasTexture(canvas);
    }

    getPlanetsData() {
        return [
            { name: 'Sun', radius: 15, distance: 0, speed: 0, rotationSpeed: 0.002, color: 0xffaa33, textureKey: 'sun', hasRings: false, eccentricity: 0 },
            { name: 'Mercury', radius: 0.8, distance: 25, speed: 0.015, rotationSpeed: 0.005, color: 0x8c8c8c, textureKey: 'mercury', hasRings: false, eccentricity: 0.2 },
            { name: 'Venus', radius: 1.5, distance: 35, speed: 0.01, rotationSpeed: 0.002, color: 0xffcc99, textureKey: 'venusColor', hasRings: false, eccentricity: 0.01 },
            { name: 'Earth', radius: 1.6, distance: 50, speed: 0.008, rotationSpeed: 0.01, color: 0x2233ff, textureKey: 'earthColor', hasRings: false, eccentricity: 0.02 },
            { name: 'Mars', radius: 1.0, distance: 65, speed: 0.006, rotationSpeed: 0.009, color: 0xff4400, textureKey: 'marsColor', hasRings: false, eccentricity: 0.09 },
            { name: 'Jupiter', radius: 6, distance: 100, speed: 0.002, rotationSpeed: 0.02, color: 0xd8ca9d, textureKey: 'jupiter', hasRings: false, eccentricity: 0.05 },
            { name: 'Saturn', radius: 5, distance: 140, speed: 0.0015, rotationSpeed: 0.018, color: 0xe3d8b0, textureKey: 'saturn', hasRings: true, eccentricity: 0.06 },
            { name: 'Uranus', radius: 3, distance: 180, speed: 0.001, rotationSpeed: 0.015, color: 0xa6d1e6, textureKey: 'uranus', hasRings: false, eccentricity: 0.05 },
            { name: 'Neptune', radius: 2.8, distance: 210, speed: 0.0008, rotationSpeed: 0.016, color: 0x3d5aa8, textureKey: 'neptune', hasRings: false, eccentricity: 0.01 }
        ];
    }

    setupLighting() {
        while(this.scene.children.find(c => c.isLight)) {
            this.scene.remove(this.scene.children.find(c => c.isLight));
        }
        
        this.sunLight = new THREE.PointLight(0xffffff, this.realisticLighting ? 3.0 : 1.5, 1000);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.bias = -0.001;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        const ambientColor = this.realisticLighting ? 0x0a0a0a : 0x444444;
        this.scene.add(new THREE.AmbientLight(ambientColor));

        if (!this.realisticLighting) {
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
            dirLight.position.set(50, 50, 50);
            this.scene.add(dirLight);
        }
    }

    createStarfield() {
        const geo = new THREE.BufferGeometry();
        const mat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        
        const verts = [];
        const colors = [];
        const colorObj = new THREE.Color();
        
        for (let i = 0; i < 20000; i++) {
            const x = (Math.random() - 0.5) * 4000;
            const y = (Math.random() - 0.5) * 4000;
            const z = (Math.random() - 0.5) * 4000;

            // create slightly dense milky way effect
            const length = Math.sqrt(x*x + y*y + z*z);
            if (length < 200) continue; 

            if (Math.random() > 0.8 && Math.abs(y) < 500) {
                // Milky way band
                verts.push(x, y * 0.2, z); 
            } else {
                verts.push(x, y, z);
            }

            colorObj.setHSL(Math.random(), 0.5, Math.random() * 0.5 + 0.5);
            colors.push(colorObj.r, colorObj.g, colorObj.b);
        }
        
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        mat.vertexColors = true;
        
        this.stars = new THREE.Points(geo, mat);
        this.scene.add(this.stars);
    }

    createSun(data) {
        const geo = new THREE.SphereGeometry(data.radius, 64, 64);
        const mat = new THREE.MeshBasicMaterial({
            map: this.textures['sun'],
            color: 0xffffff
        });
        this.sun = new THREE.Mesh(geo, mat);
        this.sun.name = data.name;
        this.scene.add(this.sun);

        // Advanced Corona Shader
        const coronaGeo = new THREE.SphereGeometry(data.radius * 1.3, 32, 32);
        this.coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xff4400) }
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
                uniform vec3 color;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 3.0) * 0.1 + 0.9;
                    gl_FragColor = vec4(color, intensity * pulse);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        
        const corona = new THREE.Mesh(coronaGeo, this.coronaMaterial);
        this.sun.add(corona);

        // Sun Core Glow
        const coreGeo = new THREE.SphereGeometry(data.radius * 1.1, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        this.sun.add(new THREE.Mesh(coreGeo, coreMat));
    }

    createPlanet(data) {
        const geo = new THREE.SphereGeometry(data.radius, 64, 64);
        const tex = this.textures[data.textureKey];
        
        let matOptions = { map: tex || null, color: tex ? 0xffffff : data.color };

        if (data.name === 'Earth' && this.textures['earthNormal']) {
            matOptions = {
                map: this.textures['earthColor'],
                normalMap: this.textures['earthNormal'],
                specularMap: this.textures['earthSpecular'],
                specular: new THREE.Color(0x333333),
                shininess: 15
            };
        } else if (data.name === 'Mars' && this.textures['marsNormal']) {
            matOptions.normalMap = this.textures['marsNormal'];
            matOptions.shininess = 2;
        }

        const mat = new THREE.MeshPhongMaterial(matOptions);
        const planet = new THREE.Mesh(geo, mat);
        planet.name = data.name;
        planet.castShadow = true;
        planet.receiveShadow = true;

        // Earth specific layers
        if (data.name === 'Earth') {
            // Clouds
            if (this.textures['earthClouds']) {
                const cloudGeo = new THREE.SphereGeometry(data.radius * 1.01, 32, 32);
                const cloudMat = new THREE.MeshLambertMaterial({
                    map: this.textures['earthClouds'],
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const clouds = new THREE.Mesh(cloudGeo, cloudMat);
                planet.add(clouds);
                planet.userData.clouds = clouds;
            }

            // Atmosphere Glow
            const atmosGeo = new THREE.SphereGeometry(data.radius * 1.05, 32, 32);
            const atmosMat = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
                        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                    }
                `,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false
            });
            planet.add(new THREE.Mesh(atmosGeo, atmosMat));
            this.createMoon(planet, data.radius);
        }

        // Venus Atmosphere
        if (data.name === 'Venus' && this.textures['venusAtmos']) {
            const atmosGeo = new THREE.SphereGeometry(data.radius * 1.02, 32, 32);
            const atmosMat = new THREE.MeshLambertMaterial({
                map: this.textures['venusAtmos'],
                transparent: true,
                opacity: 0.7
            });
            const atmos = new THREE.Mesh(atmosGeo, atmosMat);
            planet.add(atmos);
            planet.userData.clouds = atmos;
        }

        // Saturn Rings
        if (data.hasRings) {
            this.createPlanetRings(planet, data.radius);
        }

        this.createOrbitPath(data);

        // Position planet
        planet.position.x = data.distance;
        this.scene.add(planet);

        this.planets.push({
            mesh: planet,
            data: data,
            angle: Math.random() * Math.PI * 2
        });
    }

    createOrbitPath(data) {
        const points = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const a = data.distance;
            const e = data.eccentricity;
            const r = a * (1 - e*e) / (1 + e * Math.cos(angle));
            points.push(new THREE.Vector3(r * Math.cos(angle), 0, r * Math.sin(angle)));
        }
        
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.2
        });
        
        const orbit = new THREE.Line(geo, mat);
        orbit.userData.isOrbit = true;
        this.scene.add(orbit);
    }

    createPlanetRings(planet, radius) {
        const innerRadius = radius * 1.3;
        const outerRadius = radius * 2.2;
        const geo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        // UV mapping for rings
        const pos = geo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            geo.attributes.uv.setXY(i, (v3.length() - innerRadius) / (outerRadius - innerRadius), 0);
        }

        const mat = new THREE.MeshLambertMaterial({
            map: this.textures['saturnRing'],
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            alphaTest: 0.05
        });
        
        const rings = new THREE.Mesh(geo, mat);
        rings.rotation.x = Math.PI / 2 + 0.2; // slight tilt
        rings.castShadow = true;
        rings.receiveShadow = true;
        planet.add(rings);
    }

    createMoon(planet, planetRadius) {
        const geo = new THREE.SphereGeometry(planetRadius * 0.25, 32, 32);
        const mat = new THREE.MeshLambertMaterial({
            map: this.textures['moon'] || null, 
            color: this.textures['moon'] ? 0xffffff : 0xaaaaaa
        });
        const moon = new THREE.Mesh(geo, mat);
        moon.castShadow = true;
        moon.receiveShadow = true;
        planet.add(moon);
        
        this.moons.push({
            mesh: moon,
            parent: planet,
            distance: planetRadius * 3,
            angle: Math.random() * Math.PI * 2,
            speed: 0.03
        });
    }

    createAsteroidBelt() {
        const innerRadius = 110;
        const outerRadius = 130;
        
        const asteroidGeo1 = new THREE.DodecahedronGeometry(0.3, 1);
        const asteroidGeo2 = new THREE.IcosahedronGeometry(0.4, 0);
        const mat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        for (let i = 0; i < 800; i++) {
            const geo = Math.random() > 0.5 ? asteroidGeo1 : asteroidGeo2;
            const asteroid = new THREE.Mesh(geo, mat);
            asteroid.scale.setScalar(Math.random() * 0.8 + 0.2);
            asteroid.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            
            const angle = Math.random() * Math.PI * 2;
            const dist = innerRadius + Math.random() * (outerRadius - innerRadius);
            const h = (Math.random() - 0.5) * 8;
            
            asteroid.position.set(Math.cos(angle) * dist, h, Math.sin(angle) * dist);
            asteroid.castShadow = true;
            asteroid.receiveShadow = true;
            this.scene.add(asteroid);

            this.asteroids.push({
                mesh: asteroid,
                angle: angle,
                distance: dist,
                height: h,
                speed: 0.001 + Math.random() * 0.001,
                rotSpeed: new THREE.Vector3(Math.random()*0.05, Math.random()*0.05, Math.random()*0.05)
            });
        }
    }

    // Controls & Interaction Logic (unchanged concept, condensed)
    setupControls() {
        this.isDragging = false;
        this.prevMouse = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('mousedown', e => {
            this.isDragging = true;
            this.prevMouse = { x: e.clientX, y: e.clientY };
        });
        this.renderer.domElement.addEventListener('mousemove', e => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.prevMouse.x;
            const dy = e.clientY - this.prevMouse.y;
            
            if (e.buttons === 1) { // Rotate
                const sph = new THREE.Spherical().setFromVector3(this.camera.position);
                sph.theta -= dx * 0.01;
                sph.phi -= dy * 0.01;
                sph.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sph.phi));
                this.camera.position.setFromSpherical(sph);
                this.camera.lookAt(0,0,0);
            } else if (e.buttons === 2) { // Pan
                this.camera.position.x -= dx * 0.5;
                this.camera.position.y += dy * 0.5;
                this.camera.lookAt(0,0,0);
            }
            this.prevMouse = { x: e.clientX, y: e.clientY };
        });
        this.renderer.domElement.addEventListener('mouseup', () => this.isDragging = false);
        this.renderer.domElement.addEventListener('wheel', e => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 1.1 : 0.9;
            const len = this.camera.position.length();
            const newLen = Math.min(Math.max(len * factor, 30), 800);
            this.camera.position.normalize().multiplyScalar(newLen);
            this.camera.lookAt(0,0,0);
        });
        this.renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
        this.renderer.domElement.addEventListener('click', e => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                if (obj.name && obj.name !== 'Sun' && !obj.userData.isOrbit) {
                    this.showPlanetInfo(obj.name);
                }
            }
        });
    }

    setupUI() {
        document.getElementById('resetView')?.addEventListener('click', () => {
            this.camera.position.set(0, 80, 250);
            this.camera.lookAt(0,0,0);
        });
        document.getElementById('toggleOrbits')?.addEventListener('click', e => {
            const orbits = this.scene.children.filter(c => c.userData.isOrbit);
            const isVis = orbits.length && orbits[0].visible;
            orbits.forEach(o => o.visible = !isVis);
            e.target.textContent = isVis ? 'Show Orbits' : 'Hide Orbits';
        });
        document.getElementById('toggleLabels')?.addEventListener('click', e => {
            this.labelsVisible = !this.labelsVisible;
            if (!this.labelsVisible) {
                document.querySelectorAll('.planet-label').forEach(el => el.remove());
            }
            e.target.textContent = this.labelsVisible ? 'Hide Labels' : 'Show Labels';
        });
        document.getElementById('toggleRotation')?.addEventListener('click', e => {
            this.isRotating = !this.isRotating;
            e.target.textContent = this.isRotating ? 'Pause Rotation' : 'Resume Rotation';
        });
        document.getElementById('toggleLighting')?.addEventListener('click', e => {
            this.realisticLighting = !this.realisticLighting;
            this.setupLighting();
            e.target.textContent = this.realisticLighting ? 'Simple Lighting' : 'Realistic Lighting';
        });
    }

    showPlanetInfo(planetName) {
        const infoDiv = document.getElementById('selectedPlanet');
        const data = this.planetsData.find(p => p.name === planetName);
        if (data && infoDiv) {
            let html = `<h3>${planetName}</h3>`;
            html += `<p>Distance: <strong>${data.distance} MKm</strong></p>`;
            html += `<p>Orbital Period: <strong>${Math.round(2*Math.PI/data.speed)} Days</strong></p>`;
            infoDiv.innerHTML = html;
            infoDiv.classList.add('visible');
            setTimeout(() => infoDiv.classList.remove('visible'), 6000);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.coronaMaterial) {
            this.coronaMaterial.uniforms.time.value += 0.01;
        }
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        
        if (this.isRotating) {
            if (this.sun) this.sun.rotation.y += 0.002;

            this.planets.forEach(p => {
                p.angle += p.data.speed;
                const a = p.data.distance;
                const e = p.data.eccentricity;
                const r = a * (1 - e*e) / (1 + e * Math.cos(p.angle));
                p.mesh.position.set(r * Math.cos(p.angle), 0, r * Math.sin(p.angle));
                p.mesh.rotation.y += p.data.rotationSpeed;

                // Rotate clouds faster
                if(p.mesh.userData.clouds) {
                    p.mesh.userData.clouds.rotation.y += 0.001;
                }
            });

            this.moons.forEach(m => {
                m.angle += m.speed;
                m.mesh.position.set(Math.cos(m.angle)*m.distance, 0, Math.sin(m.angle)*m.distance);
                m.mesh.rotation.y += 0.05;
            });

            this.asteroids.forEach(a => {
                a.angle += a.speed;
                a.mesh.position.set(Math.cos(a.angle)*a.distance, a.height + Math.sin(a.angle*5), Math.sin(a.angle)*a.distance);
                a.mesh.rotation.x += a.rotSpeed.x;
                a.mesh.rotation.y += a.rotSpeed.y;
                a.mesh.rotation.z += a.rotSpeed.z;
            });
        }

        if (this.labelsVisible) {
            this.updateLabels();
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateLabels() {
        document.querySelectorAll('.planet-label').forEach(el => el.remove());
        this.planets.forEach(p => {
            const pos = p.mesh.position.clone().project(this.camera);
            if (pos.z < 1) {
                const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
                const label = document.createElement('div');
                label.className = 'planet-label';
                label.textContent = p.data.name;
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;
                document.getElementById('container').appendChild(label);
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new SolarSystem();
});