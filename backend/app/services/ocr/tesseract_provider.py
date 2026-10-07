from PIL import Image
from app.services.ocr.base import OCRProvider

try:
    import pytesseract
except ImportError:
    pytesseract = None


class TesseractProvider(OCRProvider):
    def name(self) -> str:
        return "Tesseract"

    def extract_text(self, image: Image.Image) -> str:
        if pytesseract is None:
            raise RuntimeError("pytesseract is not installed.")
        # Convert to RGB just in case it's RGBA or something else
        return pytesseract.image_to_string(image.convert("RGB")).strip()

