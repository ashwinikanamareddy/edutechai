"""
services/media_service.py — Service for extracting text from PDFs and images.
"""
import io
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import pytesseract
    from PIL import Image
except ImportError:
    pytesseract = None
    Image = None

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from a PDF file.
    """
    if not PdfReader:
        return "PDF processing library (pypdf) is not installed."
    
    try:
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"[media_service] PDF extraction failed: {e}")
        return f"Error extracting PDF text: {str(e)}"

def extract_text_from_image(file_content: bytes) -> str:
    """
    Extract text from an image using OCR.
    """
    if not pytesseract or not Image:
        return "Image processing libraries (pytesseract/Pilllow) are not installed."
    
    try:
        image = Image.open(io.BytesIO(file_content))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        # Note: In production, you'd need the Tesseract binary installed on the system.
        print(f"[media_service] Image OCR failed: {e}")
        return f"Error extracting image text. (Ensure Tesseract-OCR is installed on host): {str(e)}"

def summarize_extracted_text(text: str) -> str:
    """
    A very simple summarization (first few sentences) or placeholder.
    Real summarization would happen via Groq.
    """
    if not text:
        return "No text to summarize."
    
    sentences = text.split(".")
    summary = ". ".join(sentences[:5]) + ("..." if len(sentences) > 5 else ".")
    return summary
