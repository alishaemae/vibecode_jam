# Data Layer — Vibecode

Пакет для работы с базой данных PostgreSQL. Содержит модели SQLAlchemy, Alembic миграции и асинхронную сессию для FastAPI.

## Содержание
- `models/` — SQLAlchemy модели:
  - `Interview`, `Task`, `Solution`, `Metric`, `Embedding`
- `session.py` — асинхронная сессия SQLAlchemy
- `alembic/` — миграции Alembic
- `requirements.txt` — зависимости Python
- `.env` — переменные окружения (DATABASE_URL)
- `README.md` — текущий файл

## Установка
1. Создать и активировать виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```
2. Установить зависимости:
```bash
pip install -r requirements.txt
```
3. Настроить PostgreSQL и создать базу данных:
```sql
CREATE DATABASE vibecode;
```
4. Создать `.env` файл в корне `db/`:
```env
DATABASE_URL=postgresql+asyncpg://USERNAME:PASSWORD@HOST:PORT/DATABASE
```
Пример:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/vibecode
```

## Миграции
```bash
alembic -c alembic.ini upgrade head
```

### Alembic команды:
- `alembic -c alembic.ini revision --autogenerate -m "описание"` — создать новую миграцию
- `alembic -c alembic.ini upgrade head` — применить все миграции
- `alembic -c alembic.ini downgrade -1` — откатить последнюю миграцию

> Начальная миграция `0001_initial_schema.py` уже есть.

## FastAPI пример
```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from db.models import Interview

app = FastAPI()

@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    result = await db.execute("SELECT 1")
    return {"ok": result.scalar() == 1}
```

## Работа с моделями
```python
from db.models import Interview

async with get_db() as db:
    new_interview = Interview(user_id=1, title="Тестовое интервью")
    db.add(new_interview)
    await db.commit()
    await db.refresh(new_interview)
```

## Структура моделей
| Модель      | Связи                                      | Описание |
|------------|--------------------------------------------|---------|
| Interview  | tasks, solutions, metrics                  | Интервью, пользователь, описание |
| Task       | interview, solutions                        | Задача, привязка к интервью |
| Solution   | interview, task, metrics, embeddings       | Решение пользователя |
| Metric     | solution, interview                        | Метрики решения и интервью (вариант A) |
| Embedding  | solution                                   | Векторные представления решения (античит / similarity) |

## Особенности
- Все таблицы используют `CASCADE` для ForeignKey.
- Метрики привязаны и к `solution`, и к `interview`.
- Асинхронная работа с БД через `asyncpg`.
- Naming convention в `Base` для Alembic и миграций.
