"""
LLM Integration using Qwen3-32B with thinking mode
"""

import os
import json
from typing import Dict, Any, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch


class QwenLLM:
    """Qwen3-32B LLM wrapper with thinking mode support"""
    
    def __init__(self, model_name: str = "Qwen/Qwen3-32B"):
        """
        Initialize the Qwen LLM
        
        Args:
            model_name: HuggingFace model identifier
        """
        print(f"🤖 Loading {model_name}...")
        self.model_name = model_name
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Load model with automatic device mapping
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype="auto",
            device_map="auto"
        )
        
        print(f"✅ Model loaded successfully on device: {self.model.device}")
    
    def generate(
        self,
        prompt: str,
        max_new_tokens: int = 4096,
        enable_thinking: bool = True,
        temperature: float = 0.7,
        top_p: float = 0.9,
        return_thinking: bool = False
    ) -> Dict[str, str]:
        """
        Generate response from the LLM
        
        Args:
            prompt: The input prompt
            max_new_tokens: Maximum tokens to generate
            enable_thinking: Whether to enable thinking mode
            temperature: Sampling temperature
            top_p: Nucleus sampling parameter
            return_thinking: Whether to return thinking content separately
            
        Returns:
            Dictionary with 'content' and optionally 'thinking' keys
        """
        # Prepare messages in chat format
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # Apply chat template with thinking mode
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=enable_thinking
        )
        
        # Tokenize input
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)
        
        # Generate response
        with torch.no_grad():
            generated_ids = self.model.generate(
                **model_inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True if temperature > 0 else False
            )
        
        # Extract only the new tokens (remove input)
        output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()
        
        # Parse thinking content if enabled
        thinking_content = ""
        content = ""
        
        if enable_thinking:
            try:
                # Find the </think> token (151668)
                index = len(output_ids) - output_ids[::-1].index(151668)
                
                # Decode thinking and content separately
                thinking_content = self.tokenizer.decode(
                    output_ids[:index], 
                    skip_special_tokens=True
                ).strip("\n")
                
                content = self.tokenizer.decode(
                    output_ids[index:], 
                    skip_special_tokens=True
                ).strip("\n")
                
            except ValueError:
                # No thinking token found, treat all as content
                content = self.tokenizer.decode(
                    output_ids, 
                    skip_special_tokens=True
                ).strip("\n")
        else:
            content = self.tokenizer.decode(
                output_ids, 
                skip_special_tokens=True
            ).strip("\n")
        
        result = {"content": content}
        if return_thinking and thinking_content:
            result["thinking"] = thinking_content
        
        return result
    
    def generate_json(
        self,
        prompt: str,
        max_new_tokens: int = 4096,
        enable_thinking: bool = True,
        return_thinking: bool = False
    ) -> Dict[str, Any]:
        """
        Generate JSON response from the LLM
        
        Args:
            prompt: The input prompt (should request JSON output)
            max_new_tokens: Maximum tokens to generate
            enable_thinking: Whether to enable thinking mode
            return_thinking: Whether to return thinking content
            
        Returns:
            Dictionary with parsed JSON in 'data' key and optionally 'thinking'
        """
        response = self.generate(
            prompt=prompt,
            max_new_tokens=max_new_tokens,
            enable_thinking=enable_thinking,
            temperature=0.3,  # Lower temperature for structured output
            return_thinking=return_thinking
        )
        
        content = response["content"]
        
        # Parse JSON from content
        parsed_data = self._parse_json_response(content)
        
        result = {"data": parsed_data}
        if "thinking" in response:
            result["thinking"] = response["thinking"]
        
        return result
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Parse JSON from LLM response, handling markdown code blocks
        
        Args:
            response: Raw LLM response
            
        Returns:
            Parsed JSON dictionary
        """
        # Remove markdown code blocks if present
        response = response.strip()
        
        if response.startswith("```json"):
            response = response[7:]
        elif response.startswith("```"):
            response = response[3:]
        
        if response.endswith("```"):
            response = response[:-3]
        
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            print(f"⚠️ Failed to parse JSON response: {e}")
            print(f"Response was: {response[:200]}...")
            return {}


# Global LLM instance (singleton pattern)
_llm_instance: Optional[QwenLLM] = None


def get_llm() -> QwenLLM:
    """
    Get or create the global LLM instance
    
    Returns:
        QwenLLM instance
    """
    global _llm_instance
    
    if _llm_instance is None:
        model_name = os.getenv("LLM_MODEL_NAME", "Qwen/Qwen3-32B")
        _llm_instance = QwenLLM(model_name=model_name)
    
    return _llm_instance


def query_llm(prompt: str, return_json: bool = False, **kwargs) -> Dict[str, Any]:
    """
    Convenience function to query the LLM
    
    Args:
        prompt: The input prompt
        return_json: Whether to parse response as JSON
        **kwargs: Additional arguments for generate/generate_json
        
    Returns:
        LLM response dictionary
    """
    llm = get_llm()
    
    if return_json:
        return llm.generate_json(prompt, **kwargs)
    else:
        return llm.generate(prompt, **kwargs)
