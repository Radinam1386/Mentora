# Mentora Question Bank

Use `backend/api/fixtures/question_bank_template.csv` as the spreadsheet template.

## Required Columns

- `major`: `ریاضی`, `تجربی`, or `مشترک`
- `lesson`: lesson name
- `grade`: `دهم`, `یازدهم`, `دوازدهم`, or `جامع`
- `question_text`: question body, Markdown/LaTeX supported
- `option_1` to `option_4`: answer options, Markdown/LaTeX supported
- `correct_answer`: correct option number, preferably `1` to `4`

Optional:

- `id`: updates an existing question with that database id
- `subject`: display label; defaults to `lesson`
- `topic`: selectable topic tag, disabled by default
- `explanation`: answer explanation, disabled by default
- `difficulty`: difficulty tag, disabled by default

For mixed, unknown, or comprehensive questions, use `جامع`. In CSV/JSON imports, `mixed` is the only English alias and is saved as `جامع`.

Practice filtering rule:

- If the user selects `دهم`, only `دهم` questions are shown.
- If the user selects `یازدهم`, only `یازدهم` questions are shown.
- If the user selects `دوازدهم`, only `دوازدهم` questions are shown.
- If the user selects `جامع`, questions tagged `دهم`, `یازدهم`, `دوازدهم`, and `جامع` may be shown.

## Optional Feature Switches

These tags are stored in the database but hidden by default:

```powershell
PRACTICE_ENABLE_TOPICS=false
PRACTICE_ENABLE_EXPLANATIONS=false
PRACTICE_ENABLE_DIFFICULTY=false
```

Set a value to `true` in `.env` and restart Django when you want that feature visible.

## Valid Lesson Map

ریاضی:

- `حسابان`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `هندسه`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `شیمی`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `فیزیک`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `گسسته`: `دوازدهم`, `جامع`
- `آمار`: `یازدهم`, `جامع`

تجربی:

- `ریاضی`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `فیزیک`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `شیمی`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `زیست`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`

مشترک:

- `فیزیک`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`
- `شیمی`: `دهم`, `یازدهم`, `دوازدهم`, `جامع`

## Import

Validate without changing the database:

```powershell
python backend\manage.py import_questions backend\api\fixtures\question_bank_template.csv --dry-run
```

Import:

```powershell
python backend\manage.py import_questions path\to\questions.csv
```

JSON import is also supported. Use a list of objects with the same fields; `options` can be an array instead of `option_1` to `option_4`.
