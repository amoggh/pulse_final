# Qwen3-32B LLM Integration

This agent uses **Qwen3-32B** with thinking mode for advanced reasoning capabilities in predictive hospital management.

## Features

- **Thinking Mode**: Qwen3-32B's built-in thinking mode enables deeper reasoning before generating responses
- **Local Inference**: Model runs locally with automatic device mapping (GPU/CPU)
- **Structured Output**: JSON parsing for reliable structured predictions
- **Fallback Logic**: Graceful degradation if LLM fails

## Model Information

- **Model**: Qwen/Qwen3-32B
- **Provider**: Alibaba Cloud (Qwen Team)
- **Size**: 32B parameters
- **Special Feature**: Native thinking mode support

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `transformers>=4.37.0` - HuggingFace transformers library
- `torch>=2.1.0` - PyTorch for model inference
- `accelerate>=0.25.0` - For automatic device mapping

### 2. Configure Environment

Add to your `.env` file:

```bash
# LLM Model Configuration
LLM_MODEL_NAME=Qwen/Qwen3-32B
```

### 3. First Run

On first run, the model will be downloaded from HuggingFace (this may take some time):

```bash
python -m worker.main
```

The model will be cached locally for subsequent runs.

## Usage

### Basic Usage

The LLM is automatically used by all analysis nodes:

```python
from agent.llm import query_llm

# Simple text generation
response = query_llm(
    prompt="Analyze this medical scenario...",
    enable_thinking=True
)
print(response["content"])

# JSON structured output
response = query_llm(
    prompt="Return analysis as JSON...",
    return_json=True,
    enable_thinking=True
)
data = response["data"]
```

### Advanced Usage

```python
from agent.llm import get_llm

# Get the LLM instance
llm = get_llm()

# Generate with custom parameters
response = llm.generate(
    prompt="Your prompt here",
    max_new_tokens=4096,
    temperature=0.7,
    top_p=0.9,
    enable_thinking=True,
    return_thinking=True  # Get thinking process
)

print("Thinking:", response.get("thinking"))
print("Response:", response["content"])
```

## Thinking Mode

Qwen3-32B's thinking mode allows the model to:
1. **Reason internally** before generating the final response
2. **Show its work** (optional) via the thinking content
3. **Improve accuracy** through step-by-step reasoning

Example with thinking:

```python
response = query_llm(
    prompt="Calculate patient surge based on multiple factors...",
    enable_thinking=True,
    return_thinking=True
)

# The model's internal reasoning
print("Thinking process:", response["thinking"])

# The final answer
print("Final response:", response["content"])
```

## Performance Considerations

### GPU Recommendations

- **Minimum**: 24GB VRAM (e.g., RTX 3090, RTX 4090)
- **Recommended**: 40GB+ VRAM (e.g., A100, H100)
- **CPU Fallback**: Possible but slow (not recommended for production)

### Optimization Tips

1. **Quantization**: Use 8-bit or 4-bit quantization for lower memory:
   ```python
   model = AutoModelForCausalLM.from_pretrained(
       model_name,
       load_in_8bit=True,  # or load_in_4bit=True
       device_map="auto"
   )
   ```

2. **Batch Processing**: Process multiple requests together when possible

3. **Token Limits**: Adjust `max_new_tokens` based on your needs:
   - Short responses: 512-1024 tokens
   - Medium responses: 2048 tokens
   - Long responses: 4096+ tokens

## Integration Points

The Qwen LLM is integrated into these nodes:

1. **Festival Analysis** (`festival_analysis.py`)
   - Analyzes festival impact on patient load
   - Predicts surge multipliers

2. **Pollution Analysis** (`pollution_analysis.py`)
   - Evaluates AQI impact on respiratory cases
   - Seasonal pollution patterns

3. **Epidemic Analysis** (`epidemic_analysis.py`)
   - Identifies active disease outbreaks
   - Seasonal disease patterns

4. **Surge Prediction** (`surge_prediction.py`)
   - Combines all factors
   - Generates 7-day forecasts

## Troubleshooting

### Out of Memory

If you encounter OOM errors:

```python
# In agent/llm.py, modify the model loading:
self.model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,  # Use half precision
    load_in_8bit=True,          # Enable 8-bit quantization
    device_map="auto"
)
```

### Slow Inference

- Ensure you're using GPU: Check `self.model.device` shows `cuda`
- Reduce `max_new_tokens` to minimum needed
- Consider using a smaller model for development

### Model Download Issues

If download fails:
```bash
# Set HuggingFace cache directory
export HF_HOME=/path/to/large/disk

# Or download manually
huggingface-cli download Qwen/Qwen3-32B
```

## Alternative Models

To use a different model, update `.env`:

```bash
# Smaller model (faster, less accurate)
LLM_MODEL_NAME=Qwen/Qwen3-7B

# Larger model (slower, more accurate)
LLM_MODEL_NAME=Qwen/Qwen3-72B
```

## License

Qwen models are released under Apache 2.0 license. See [Qwen GitHub](https://github.com/QwenLM/Qwen) for details.
