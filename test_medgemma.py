from mlx_lm import load, generate

# NOTE: MedGemma is a gated model. 
# You MUST request access on Hugging Face and log in via `huggingface-cli login` first.
# We are using a 4-bit Quantized version of the model which reduces the memory requirement from 8GB to ~2.5GB
# This completely eliminates the memory bottleneck on Macs!
model_id = "Goraint/medgemma-4b-it-MLX-AWQ-4bit"
print(f"Loading {model_id} via Apple MLX (This is fully optimized for your Mac GPU!)")

# MLX automatically uses the Apple Silicon GPU and handles memory perfectly.
model, tokenizer = load(model_id)

prompt = "Patient with colorectal cancer presents with symptoms of..."
print(f"\nGenerating response for prompt: '{prompt}'")
print("\n--- Model Output ---\n")

# Generate response
response = generate(
    model, 
    tokenizer, 
    prompt=prompt, 
    max_tokens=50,
    verbose=True # This streams the output naturally!
)

print("\n--------------------")
