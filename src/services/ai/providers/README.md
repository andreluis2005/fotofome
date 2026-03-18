# AI Providers Architecture

The AI Services in FotoFome use a Provider-based architecture to allow easy switching between different backend models and APIs.

## Interface: `IAIProvider`
All providers must implement the `IAIProvider` interface, which mandates the `generateImage` and `enhanceImage` methods.

## Current Providers

- **ReplicateProvider**: Connects to the official Replicate API using their standard SDK to perform real Machine Learning inferences.
  - Requires the `REPLICATE_API_TOKEN` environment variable.
  - Models currently used: Flux Schnell for text-to-image, SDXL Lightning for image-to-image enhancement.
- **MockProvider**: Simulates ML generation by returning static HD placeholder food images after a short delay. Essential for saving resources and tokens during frontend development.

## Pipeline Integration
The `AIPipelineService` acts as the orchestrator:
1. It attempts to load the `ReplicateProvider` if the necessary API token is present. Otherwise, defaults to `MockProvider`.
2. It features an automatic fallback mechanism: if `ReplicateProvider` throws an exception (due to network error, API saturation, etc.), the pipeline gracefully resumes by calling the `MockProvider`.
3. Credits are consumed strictly **after** an image generation operation is fully completed and successful.
4. Watermarking occurs as the last step in the pipeline, regardless of the provider used.
