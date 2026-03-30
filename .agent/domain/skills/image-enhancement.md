# Image Enhancement Skill

**Purpose:** 
Pegar o upload visual cru e amador de um prato e transformar magicamente numa fotografia limpa, profissional, sem ruídos e com controle focado de iluminação simulando um estúdio gastronômico.

**Inputs:**
- `imageBuffer` (File Uint8Array ou URL)
- `styleConfig` (Opcional - ex: "rustic", "modern dark")

**Outputs:**
- `enhancedImageUrl` (String)

**Implementation notes:**
Deverá invocar a pipeline com um provedor de imagem para imagem (Image-to-Image / ControlNet) garantindo que a geometria da comida não se altere. O objetivo maior dessa skill é aplicar as restrições do prompt `food-enhance.prompt.md`.
