// State
let state = {
    selectedTemplate: null,
    uploadedImage: null,
    generatedImage: null
};

// ==========================================
// INTERNAL AI PROMPT AS REQUESTED
// ==========================================
const ADVANCED_AI_PROMPT = `
Use the first image only as the identity reference for the person. Replace the person standing in the center foreground of the second image with the person from the first image. Preserve his facial features, hairstyle, beard, eyebrows, skin tone, facial proportions, and natural expression so that he is instantly recognizable as the same person.

Keep the second image exactly as it is in every other aspect. Do not change the Rath Yatra background, the large Jagannath Rath, the crowd pulling the ropes, the buildings, the road, the weather, the lighting, the camera angle, the perspective, or the overall composition. Only replace the center character while maintaining the same pose and position.

Blend the character naturally into the environment by matching the lighting, shadows, color tones, and perspective with the surrounding scene. Ensure that the subject appears to have been genuinely present during the Rath Yatra procession, with realistic interaction between the foreground and background.

The final result should look like an authentic smartphone photograph taken by a real person during the actual Rath Yatra. Use natural smartphone HDR, realistic skin texture, subtle image noise, mild depth of field, and accurate colors. Avoid cinematic effects, overly smooth skin, exaggerated sharpness, or anything that makes the image look AI-generated.

Ensure that the face is highly detailed and realistic, with natural eyes, hair, beard, and skin texture. The subject should be looking directly at the camera with a calm, relaxed expression, while the background crowd continues pulling the Rath naturally, creating a believable candid festival photograph.

Do not modify or recreate the background. Do not change the Rath, crowd, framing, camera position, or composition. Replace only the identity of the center person with the person from the first image while preserving the realism and authenticity of the original scene.
`;

/* 
 * 🚀 REAL AI API INTEGRATION TEMPLATE 🚀
 * In a fully deployed environment with a backend, we would call an AI Image-to-Image 
 * or Face-Swap endpoint (like Replicate API or a custom stable diffusion model) here:
 */
async function callRealAIAPI(userImageBase64, templateImage) {
    console.log("Sending the following prompt to the AI Model:", ADVANCED_AI_PROMPT);
    // return await fetch("YOUR_BACKEND_API_ENDPOINT", {
    //     method: "POST",
    //     body: JSON.stringify({ 
    //         prompt: ADVANCED_AI_PROMPT, 
    //         reference_face: userImageBase64,
    //         base_template: templateImage
    //     })
    // });
}

// Transition handling
function goToStep(stepNumber) {
    // Hide all steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        if (step.classList.contains('active')) {
            step.classList.remove('active');
            setTimeout(() => {
                step.classList.add('hidden');

                // Show new step
                const nextStep = document.getElementById(`step-${stepNumber}`);
                nextStep.classList.remove('hidden');
                // trigger reflow
                void nextStep.offsetWidth;
                nextStep.classList.add('active');
            }, 400); // Wait for fade out transition (0.4s)
        }
    });

    if (stepNumber === 4) {
        startProcessing();
    }
}

function goBack(stepNumber) {
    goToStep(stepNumber);
}

// Step 1: Select Template
function selectTemplate(templateSrc) {
    state.selectedTemplate = templateSrc;
    // Move to step 2 (Upload)
    goToStep(2);
}

// Step 2: Handle Upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            state.uploadedImage = e.target.result;

            // Show preview
            document.getElementById('image-preview').src = state.uploadedImage;

            // Hide upload box, show preview area
            document.getElementById('upload-box').classList.add('hidden');
            const previewArea = document.getElementById('preview-area');
            previewArea.classList.remove('hidden');
            // Trigger fade in for preview
            void previewArea.offsetWidth;
        }
        reader.readAsDataURL(file);
    }
}

// Step 3: Payment
function confirmPayment() {
    // For demo purposes, we will just proceed upon clicking
    goToStep(4);
}

// Step 4: AI Processing Simulation
function startProcessing() {
    const progressBar = document.getElementById('progress-bar');
    let progress = 0;

    // Simulate AI Generation Delay
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        progressBar.style.width = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                generateFinalImage();
            }, 800);
        }
    }, 400);
}

// Step 5: Canvas Compositing (Real AI Simulation) & Free API Call
async function generateFinalImage() {

    // Check if they selected the realistic template
    if (state.selectedTemplate === 'assets/ok.png') {
        try {
            // We are using Pollinations.ai! It is COMPLETELY FREE, fast, and requires Zero API Keys!
            // It routes traffic to the newest FLUX/Stable Diffusion models behind the scenes.
            
            // We encode the prompt so it fits into the URL request securely.
            // (Using substring to prevent URL length limits in browsers)
            const POLLINATIONS_TOKEN = "AQ.Ab8RN6JhBRLzQBp1v8w9garr078a-iEoHsGsg5j1teraVGFOQA";
            const safePrompt = encodeURIComponent(ADVANCED_AI_PROMPT.substring(0, 1200));
            const seed = Math.floor(Math.random() * 999999);
            const freeAiUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

            // Fetch using the authenticated token header for priority + faster generation!
            const response = await fetch(freeAiUrl, {
                headers: {
                    'Authorization': `Bearer ${POLLINATIONS_TOKEN}`
                }
            });
            const imageBlob = await response.blob();

            // Convert blob to base64 data URL so it works even from file:// protocol (no server needed)
            const reader = new FileReader();
            reader.onloadend = () => {
                state.generatedImage = reader.result;
                document.getElementById('result-img').src = state.generatedImage;
                goToStep(5);
            };
            reader.readAsDataURL(imageBlob);
            return;
            
        } catch (err) {
            console.error("Free AI API failed", err);
            alert("The free AI API timed out or failed. Falling back to simple canvas.");
            runLocalCanvasLogic();
        }
    } else {
        // Standard flow for other templates
        runLocalCanvasLogic();
    }
}

function runLocalCanvasLogic() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const templateImg = new Image();
    const userImg = new Image();

    // Prevent hanging forever if the `assets/ok.png` image file is missing!
    templateImg.onerror = () => {
        alert("Error: Missing image! The file 'assets/ok.png' cannot be found on your computer. Please make sure the image is located inside your 'assets' folder.");
        finishGeneration(canvas);
    };

    templateImg.onload = () => {
        // Set canvas to template dimensions
        canvas.width = templateImg.width;
        canvas.height = templateImg.height;

        // Draw the background template
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        // If user uploaded an image, composite it
        if (state.uploadedImage) {
            userImg.onload = () => {
                const overlaySize = canvas.width * 0.35;
                const xPos = (canvas.width - overlaySize) / 2;
                const yPos = canvas.height - overlaySize - 50;

                ctx.save();
                ctx.beginPath();
                ctx.arc(xPos + overlaySize / 2, yPos + overlaySize / 2, overlaySize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                const size = Math.min(userImg.width, userImg.height);
                const sX = (userImg.width - size) / 2;
                const sY = (userImg.height - size) / 2;

                ctx.drawImage(userImg, sX, sY, size, size, xPos, yPos, overlaySize, overlaySize);
                ctx.restore();

                ctx.beginPath();
                ctx.arc(xPos + overlaySize / 2, yPos + overlaySize / 2, overlaySize / 2, 0, Math.PI * 2);
                ctx.lineWidth = 15;
                ctx.strokeStyle = 'rgba(255, 106, 0, 0.8)';
                ctx.stroke();
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                finishGeneration(canvas);
            };
            userImg.onerror = () => {
                finishGeneration(canvas);
            };
            userImg.src = state.uploadedImage;
        } else {
            finishGeneration(canvas);
        }
    };
    templateImg.src = state.selectedTemplate;
}

function finishGeneration(canvas) {
    try {
        state.generatedImage = canvas.toDataURL('image/png');
        document.getElementById('result-img').src = state.generatedImage;
    } catch (error) {
        // Handle Tainted Canvas (when running via file:/// protocol)
        console.warn('Canvas tainted due to local file protocol. Using Canvas DOM element fallback.', error);

        const resultBox = document.querySelector('.result-box');
        resultBox.innerHTML = ''; // clear img tag

        canvas.className = 'responsive-img';
        resultBox.appendChild(canvas);

        // Update user instructions for downloading since automated save might block
        const downloadBtn = document.querySelector('.action-buttons .primary-btn');
        if (downloadBtn) {
            downloadBtn.innerHTML = 'Save 📥';
            downloadBtn.onclick = () => alert("For local viewing, please long-press or right-click the generated image above to save it to your device.");
        }
    }
    goToStep(5);
}

// Actions
function downloadImage() {
    if (!state.generatedImage) return;

    // Normal download flow
    const link = document.createElement('a');
    link.href = state.generatedImage;
    link.download = 'My_Ratha_Yatra_AI_Avatar.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareSocial() {
    if (navigator.share) {
        navigator.share({
            title: 'Happy Ratha Yatra!',
            text: 'I just created my custom Ratha Yatra avatar using AI! 🕉️✨ #RathaYatra #JaiJagannath',
            url: window.location.href,
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    } else {
        alert('Web Share API is not supported in your browser. Copy the link to share manually!');
    }
}
