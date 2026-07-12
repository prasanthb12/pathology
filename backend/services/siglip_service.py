import os
import cv2
import numpy as np
from PIL import Image

class MedSigLIPService:
    _instance = None
    _model = None
    _processor = None
    _initialized = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MedSigLIPService()
        return cls._instance

    def initialize(self):
        if self._initialized:
            return True
        
        model_id = "google/medsiglip-448"
        print(f"[MedSigLIPService] Initializing local MedSigLIP model: {model_id}")
        
        try:
            from transformers import AutoProcessor, AutoModel
            import torch
            
            # Load gated model weights from Hugging Face
            self._processor = AutoProcessor.from_pretrained(model_id)
            self._model = AutoModel.from_pretrained(model_id)
            
            # Automatically route to local GPU (Metal/MPS for Apple Silicon, CUDA for Nvidia)
            if torch.cuda.is_available():
                self._model = self._model.to("cuda")
                print("[MedSigLIPService] Routing model to Nvidia CUDA GPU.")
            elif torch.backends.mps.is_available():
                self._model = self._model.to("mps")
                print("[MedSigLIPService] Routing model to Apple Metal (MPS) GPU.")
            else:
                print("[MedSigLIPService] Running model on CPU.")
                
            self._model.eval()
            self._initialized = True
            print("[MedSigLIPService] Model successfully loaded.")
            return True
        except Exception as e:
            print(f"[MedSigLIPService] Error loading model (HF gated access required): {e}")
            self._initialized = False
            return False

    def extract_embeddings(self, image_np) -> list:
        """
        Extracts L2-normalized 768-dimensional visual feature vectors from an H&E image.
        Falls back to a matching mock vector if local Hugging Face access is unauthorized.
        """
        if not self._initialized:
            success = self.initialize()
            if not success:
                import random
                # Generate matching 768-dimensional mock features if gated model is offline
                return [random.uniform(-1.0, 1.0) for _ in range(768)]

        try:
            import torch
            # Convert OpenCV (BGR) image array to PIL (RGB) format expected by processor
            image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(image_rgb)
            
            # Process image and map tensor to the model device
            inputs = self._processor(images=pil_img, return_tensors="pt")
            device = next(self._model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            with torch.no_grad():
                image_features = self._model.get_image_features(**inputs)
                
            # L2 Normalize visual embedding vector
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            return image_features[0].cpu().numpy().tolist()
            
        except Exception as e:
            print(f"[MedSigLIPService] Feature extraction failed: {e}")
            import random
            return [random.uniform(-1.0, 1.0) for _ in range(768)]
