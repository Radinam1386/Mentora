import csv
import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.models import QuizQuestion


REQUIRED_COLUMNS = {
    "major",
    "lesson",
    "grade",
    "question_image",
    "correct_answer",
}

OPTION_COUNT = 4
VALID_MAJORS = {"ریاضی", "تجربی", "مشترک"}
VALID_GRADES = {"دهم", "یازدهم", "دوازدهم", "جامع"}
GRADE_ALIASES = {
    "10": "دهم",
    "دهم": "دهم",
    "پایه دهم": "دهم",
    "11": "یازدهم",
    "یازدهم": "یازدهم",
    "يازدهم": "یازدهم",
    "پایه یازدهم": "یازدهم",
    "12": "دوازدهم",
    "دوازدهم": "دوازدهم",
    "پایه دوازدهم": "دوازدهم",
    "جامع": "جامع",
    "mixed": "جامع",
}
LESSONS_BY_MAJOR = {
    "ریاضی": {"حسابان", "هندسه", "شیمی", "فیزیک", "گسسته", "آمار"},
    "تجربی": {"ریاضی", "فیزیک", "شیمی", "زیست"},
    "مشترک": {"فیزیک", "شیمی"},
}


class Command(BaseCommand):
    help = "Import QuizQuestion rows from a CSV or JSON file."

    def add_arguments(self, parser):
        parser.add_argument("path", help="Path to a .csv or .json question bank file.")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Validate and preview counts without writing to the database.",
        )

    def handle(self, *args, **options):
        path = Path(options["path"])
        if not path.exists():
            raise CommandError(f"File not found: {path}")

        rows = self.load_rows(path)
        questions = [self.normalize_row(row, index + 1) for index, row in enumerate(rows)]

        if options["dry_run"]:
            self.stdout.write(self.style.SUCCESS(f"Validated {len(questions)} questions. No rows were written."))
            return

        created = 0
        updated = 0
        with transaction.atomic():
            for question in questions:
                question_id = question.pop("id", None)
                if question_id:
                    obj, was_created = QuizQuestion.objects.update_or_create(
                        id=question_id,
                        defaults=question,
                    )
                    created += int(was_created)
                    updated += int(not was_created)
                else:
                    QuizQuestion.objects.create(**question)
                    created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {len(questions)} questions. Created: {created}. Updated: {updated}."
            )
        )

    def load_rows(self, path):
        suffix = path.suffix.lower()
        if suffix == ".csv":
            with path.open("r", encoding="utf-8-sig", newline="") as file:
                return list(csv.DictReader(file))
        if suffix == ".json":
            data = json.loads(path.read_text(encoding="utf-8-sig"))
            if not isinstance(data, list):
                raise CommandError("JSON question bank must be a list of objects.")
            return data
        raise CommandError("Question bank file must be .csv or .json.")

    def normalize_row(self, row, line_number):
        missing = [column for column in REQUIRED_COLUMNS if not str(row.get(column, "")).strip()]

        if missing:
            missing_text = ", ".join(missing)
            raise CommandError(f"Row {line_number}: missing required fields: {missing_text}")

        major = str(row["major"]).strip()
        lesson = str(row["lesson"]).strip()
        grade = self.normalize_grade(str(row["grade"]).strip(), line_number)
        topic = str(row.get("topic") or "").strip()

        self.validate_taxonomy(line_number, major, lesson, grade)
        correct_answer_index = self.normalize_correct_answer(row["correct_answer"], OPTION_COUNT, line_number)
        question_id = str(row.get("id") or "").strip()

        normalized = {
            "major": major,
            "lesson": lesson,
            "grade": grade,
            "topic": topic,
            "question_image": str(row["question_image"]).strip(),
            "correct_answer_index": correct_answer_index,
            "explanation": str(row.get("explanation") or "").strip(),
            "difficulty": str(row.get("difficulty") or "").strip(),
        }
        if question_id:
            try:
                normalized["id"] = int(question_id)
            except ValueError as exc:
                raise CommandError(f"Row {line_number}: id must be a number.") from exc

        return normalized

    def validate_taxonomy(self, line_number, major, lesson, grade):
        if major not in VALID_MAJORS:
            raise CommandError(f"Row {line_number}: major must be one of {', '.join(sorted(VALID_MAJORS))}.")
        if grade not in VALID_GRADES:
            raise CommandError(f"Row {line_number}: grade must be one of {', '.join(sorted(VALID_GRADES))}.")
        valid_lessons = LESSONS_BY_MAJOR[major]
        if lesson not in valid_lessons:
            raise CommandError(
                f"Row {line_number}: lesson '{lesson}' is not valid for major '{major}'."
            )
        if lesson == "گسسته" and grade not in {"دوازدهم", "جامع"}:
            raise CommandError(f"Row {line_number}: گسسته فقط برای پایه دوازدهم مجاز است.")
        if lesson == "آمار" and grade not in {"یازدهم", "جامع"}:
            raise CommandError(f"Row {line_number}: آمار فقط برای پایه یازدهم مجاز است.")

    def normalize_grade(self, value, line_number):
        normalized = GRADE_ALIASES.get(value.strip()) or GRADE_ALIASES.get(value.strip().lower())
        if normalized:
            return normalized
        raise CommandError(f"Row {line_number}: grade must be one of {', '.join(sorted(VALID_GRADES))}.")

    def normalize_correct_answer(self, value, option_count, line_number):
        try:
            answer = int(str(value).strip())
        except ValueError as exc:
            raise CommandError(f"Row {line_number}: correct_answer must be a number.") from exc

        if 1 <= answer <= option_count:
            return answer - 1
        if 0 <= answer < option_count:
            return answer
        raise CommandError(
            f"Row {line_number}: correct_answer must be between 1 and {option_count}."
        )
