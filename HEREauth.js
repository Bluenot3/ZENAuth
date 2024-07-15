<script>
    document.addEventListener('DOMContentLoaded', function() {
        async function initializeHereWallet() {
            const near = require("near-api-js");
            const runHereWallet = require("@here-wallet/connect");

            const config = {
                networkId: "mainnet",
                walletUrl: "https://web.herewallet.app",
                nodeUrl: "https://rpc.mainnet.near.org",
                helperUrl: "https://helper.mainnet.near.org",
                explorerUrl: "https://explorer.mainnet.near.org",
                keyStore: new near.keyStores.BrowserLocalStorageKeyStore(),
            };

            runHereWallet({ near });

            const wallet = new near.WalletConnection(near, "app");
            if (!wallet.isSignedIn()) {
                wallet.requestSignIn({
                    contractId: "your-contract-id", // Replace with your contract ID
                    methodNames: ["your-method"], // Replace with your methods
                });
            }

            return wallet;
        }

        initializeHereWallet().then(wallet => {
            console.log("Here Wallet initialized and signed in:", wallet);
            // You can now use wallet object for further transactions
        }).catch(error => {
            console.error("Error initializing Here Wallet:", error);
        });
    });

    const tokenDisplay = document.getElementById('tokenDisplay');
    let currentToken = '';
    let scene, camera, renderer, hologram, glowMesh, particleSystem;
    let isRotating = true;
    let isGlowing = true;

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('hologramCanvas'), 
            antialias: true, 
            alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4da6ff, 2);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 200;
        scene.add(spotLight);

        camera.position.z = 5;

        createHologram();
        createParticles();
        animate();
    }

    function createHologram() {
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4da6ff,
            emissive: 0x1a1a2e,
            specular: 0xffffff,
            shininess: 100,
            opacity: 0.9,
            transparent: true,
            wireframe: true
        });
        hologram = new THREE.Mesh(geometry, material);
        scene.add(hologram);

        // Create glow effect
        const glowGeometry = new THREE.TorusKnotGeometry(1.1, 0.35, 100, 16);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "c": { type: "f", value: 0.1 },
                "p": { type: "f", value: 1.4 },
                glowColor: { type: "c", value: new THREE.Color(0x4da6ff) },
                viewVector: { type: "v3", value: camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize( normalMatrix * normal );
                    vec3 vNormel = normalize( normalMatrix * viewVector );
                    intensity = pow( 0.7 - dot(vNormal, vNormel), 4.0 );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4( glow, 1.0 );
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(glowMesh);
    }

    function createParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 5000;

        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 10;

            colors[i] = Math.random();
            colors[i + 1] = Math.random();
            colors[i + 2] = Math.random();
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
    }

    function generateToken() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 26; i++) {
            token += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        currentToken = token;
        tokenDisplay.textContent = token;
        updateHologramText();
    }

    function updateHologramText() {
        // Remove existing text
        scene.children.forEach(child => {
            if (child instanceof THREE.Mesh && child !== hologram && child !== glowMesh) {
                scene.remove(child);
            }
        });

        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
            const textGeometry = new THREE.TextGeometry(currentToken, {
                font: font,
                size: 0.3,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelSegments: 5
            });
            const textMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                emissive: 0x4da6ff,
                emissiveIntensity: 0.5
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-1.5, 0, 0);
            hologram.add(textMesh);

            // Animate text appearance
            textMesh.scale.set(0, 0, 0);
            new TWEEN.Tween(textMesh.scale)
                .to({x: 1, y: 1, z: 1}, 1000)
                .easing(TWEEN.Easing.Elastic.Out)
                .start();
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();

        if (isRotating) {
            hologram.rotation.x += 0.005;
            hologram.rotation.y += 0.01;
            particleSystem.rotation.x += 0.001;
            particleSystem.rotation.y += 0.002;
        }

        if (glowMesh) {
            glowMesh.rotation.x = hologram.rotation.x;
            glowMesh.rotation.y = hologram.rotation.y;
            glowMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(camera.position, glowMesh.position);
        }

        renderer.render(scene, camera);
    }

    function toggleRotation() {
        isRotating = !isRotating;
    }

    function toggleGlow() {
        isGlowing = !isGlowing;
        glowMesh.visible = isGlowing;
    }

    function copyToken() {
        navigator.clipboard.writeText(currentToken).then(() => {
            const notification = document.getElementById('copyNotification');
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000);
        });
    }

    function saveAsImage() {
        renderer.render(scene, camera);
        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `ZENAuth_Token_${currentToken}.png`;
        link.href = dataURL;
        link.click();
    }

    function saveAsPDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        renderer.render(scene, camera);
        const imgData = renderer.domElement.toDataURL('image/jpeg', 1.0);
        
        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 190);
        pdf.setFontSize(20);
        pdf.text(`ZENAuth Token: ${currentToken}`, 10, 210);
        
        pdf.save(`ZENAuth_Token_${currentToken}.pdf`);
    }

    function downloadOBJ() {
        const exporter = new THREE.OBJExporter();
        const obj = exporter.parse(scene);
        const blob = new Blob([obj], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ZENAuth_Token_${currentToken}.obj`;
        link.click();
    }

    function showQRCode() {
        const qrCodeContainer = document.getElementById('qrCodeContainer');
        qrCodeContainer.innerHTML = '';
        new QRCode(qrCodeContainer, {
            text: currentToken,
            width: 128,
            height: 128,
            colorDark : "#4da6ff",
            colorLight : "#0a0a1e"
        });
    }

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    init();
    generateToken();
</script>
