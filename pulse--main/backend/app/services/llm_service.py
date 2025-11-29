import os
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # Re-load env vars to ensure we catch updates during dev
        load_dotenv(override=True)
        
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        
        logger.info(f"LLM Service Keys Check: Groq={'Found' if self.groq_key else 'Missing'}, OpenAI={'Found' if self.openai_key else 'Missing'}")
        
        self.provider = None
        self.client = None
        self._setup_client()

    def _setup_client(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        logger.info(f"LLM Service Keys Check: Groq={'Found' if self.groq_key else 'Missing'}")
        
        # 1. Groq (Primary)
        if self.groq_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.groq_key)
                self.provider = "groq"
                logger.info("Initialized Native Groq client")
                return
            except ImportError:
                logger.error("groq package not installed. Please run: pip install groq")

        # 2. Gemini (Fallback)
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                self.client = genai.GenerativeModel('gemini-2.0-flash-exp')
                self.provider = "gemini"
                logger.info("Initialized Gemini client")
                return
            except ImportError:
                logger.error("google-generativeai package not installed.")
        
        logger.warning("No valid LLM API key found. LLM features will be disabled.")

    def generate_decision(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Generates a structured decision from the LLM based on the prompt.
        Expects JSON output.
        """
        if not self.client:
            return self._mock_response()

        try:
            if self.provider == "groq":
                response = self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content)
                
            elif self.provider == "gemini":
                response = self.client.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                return json.loads(response.text)
                
        except Exception as e:
            logger.error(f"LLM generation failed ({self.provider}): {e}")
            return self._mock_response()

    def _mock_response(self) -> Dict[str, Any]:
        """Fallback response if LLM fails or is not configured"""
        return {
            "risk_level": "Moderate",
            "actions": {
                "staffing": [{"action": "Monitor situation", "priority": "Medium"}],
                "supplies": [],
                "bed_management": [],
                "advisory": [{"action": "LLM Service Unavailable - Using Fallback", "priority": "Low"}]
            },
            "reasoning_trace": [
                "LLM service is not configured or failed.",
                "Returning default moderate risk assessment."
            ]
        }
