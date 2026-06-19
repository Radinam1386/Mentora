from pathlib import Path
import fitz

PDF_PATH = "Books/PDF/Chemistry1Textbook1.pdf"
OUTPUT_DIR = "Books/Chemistry1Textbook1"

FIRST_PAGE = 572
LAST_PAGE = 757
DPI = 200

pdf_path = Path(PDF_PATH)
output_dir = Path(OUTPUT_DIR)
output_dir.mkdir(parents=True, exist_ok=True)

zoom = DPI / 72
matrix = fitz.Matrix(zoom, zoom)

with fitz.open(str(pdf_path)) as pdf:
    total_pages = pdf.page_count
    last_page = min(LAST_PAGE, total_pages)

    print("Total pages:", total_pages)
    print("Rendering:", FIRST_PAGE, "to", last_page)

    for page_number in range(FIRST_PAGE, last_page + 1):
        page = pdf.load_page(page_number - 1)
        image = page.get_pixmap(matrix=matrix, alpha=False)

        output_path = output_dir / f"page_{page_number:03d}.png"
        image.save(str(output_path))

        print("saved:", output_path)

print("Done.")
