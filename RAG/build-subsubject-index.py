from pathlib import Path
import json


# ====== SETTINGS ======
BOOK_CODE = "Chemistry2SchoolBook"
MAIN_SUBJECT = "chemistry"

# Choose: "json", "images", or "both"
INCLUDE = "both"

OUTPUT_FILE = "chemistry-subsubject-index.json"
# ======================


try:
    RAG_DIR = Path(__file__).resolve().parent
except NameError:
    RAG_DIR = Path("/content/Mentora/RAG")
    if not RAG_DIR.exists():
        RAG_DIR = Path.cwd()

CARDS_DIR = RAG_DIR / "Cards" / BOOK_CODE
TOPICS_FILE = RAG_DIR / "Topics" / "all-topics.json"
OUTPUT_PATH = RAG_DIR / OUTPUT_FILE

INCLUDE_FIELDS = {
    "json": ("json_files",),
    "images": ("image_files",),
    "both": ("json_files", "image_files"),
}

if INCLUDE not in INCLUDE_FIELDS:
    raise ValueError(f"INCLUDE must be one of: {', '.join(INCLUDE_FIELDS)}")


def rag_relative(path: Path) -> str:
    return path.resolve().relative_to(RAG_DIR.resolve()).as_posix()


def append_unique(items, value):
    if value and value not in items:
        items.append(value)
        return True
    return False


def unique_list(values):
    unique = []
    for value in values or []:
        append_unique(unique, value)
    return unique


def include_from_fields(fields):
    fields = set(fields)
    if fields == {"json_files"}:
        return "json"
    if fields == {"image_files"}:
        return "images"
    return "both"


def existing_fields(index):
    fields = set()
    for group in index.get("groups", {}).values():
        for field in INCLUDE_FIELDS["both"]:
            if field in group:
                fields.add(field)
    return fields


def make_group(fields):
    return {field: [] for field in fields}


def load_index():
    if not OUTPUT_PATH.exists():
        return {
            "book_code": BOOK_CODE,
            "book_codes": [BOOK_CODE],
            "main_subject": MAIN_SUBJECT,
            "include": INCLUDE,
            "groups": {},
        }

    index = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    if index.get("main_subject") and index["main_subject"] != MAIN_SUBJECT:
        raise ValueError(
            f"{OUTPUT_FILE} is for {index['main_subject']}, not {MAIN_SUBJECT}"
        )

    index["main_subject"] = MAIN_SUBJECT
    index.setdefault("groups", {})

    for subsubject, group in list(index["groups"].items()):
        if not isinstance(group, dict):
            index["groups"][subsubject] = {}
            continue
        for field in INCLUDE_FIELDS["both"]:
            if field in group:
                group[field] = unique_list(group[field])

    existing_book_codes = index.get("book_codes") or []
    if isinstance(existing_book_codes, str):
        existing_book_codes = [existing_book_codes]

    book_codes = unique_list(
        [index.get("book_code"), *existing_book_codes, BOOK_CODE]
    )

    # Keep book_code for older readers; book_codes is the complete merged set.
    index["book_code"] = book_codes[0]
    index["book_codes"] = book_codes

    return index


def ensure_group(index, subsubject):
    fields = INCLUDE_FIELDS[index["include"]]
    group = index["groups"].setdefault(subsubject, make_group(fields))
    for field in fields:
        group.setdefault(field, [])
    return group


topics = json.loads(TOPICS_FILE.read_text(encoding="utf-8"))
subsubjects = topics[MAIN_SUBJECT]

index = load_index()
merged_fields = existing_fields(index) | set(INCLUDE_FIELDS[INCLUDE])
index["include"] = include_from_fields(merged_fields)

for subsubject in subsubjects:
    ensure_group(index, subsubject)


added_json = 0
added_images = 0

for card_path in sorted(CARDS_DIR.glob("*.json")):
    card = json.loads(card_path.read_text(encoding="utf-8"))

    if "card_id" not in card:
        continue
    if card.get("main_subject") != MAIN_SUBJECT:
        continue

    subsubject = card.get("subsubject", "general")
    group = ensure_group(index, subsubject)

    if INCLUDE in ["json", "both"]:
        if append_unique(group.setdefault("json_files", []), rag_relative(card_path)):
            added_json += 1

    if INCLUDE in ["images", "both"]:
        image_path = card.get("image_path")
        if image_path:
            image_path = image_path.replace("books/", "Books/", 1)
        if append_unique(group.setdefault("image_files", []), image_path):
            added_images += 1


OUTPUT_PATH.write_text(
    json.dumps(index, ensure_ascii=False, indent=2),
    encoding="utf-8",
)

print(f"Merged: {OUTPUT_PATH}")
print(f"Added json files: {added_json}")
print(f"Added image files: {added_images}")
