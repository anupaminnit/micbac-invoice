# CLAUDE.md

> Project-level context for Claude Code. Loaded automatically at session start.
> Keep this file concise — every line costs context tokens.

---

## Developer Profile

- **Role:** Gen AI / LLM Engineer
- **Primary stack:** Python · FastAPI · LangChain · Azure OpenAI · React/Vite · TypeScript
- **Cloud:** Azure (OpenAI, Cognitive Search, AD B2C, Functions, Monitor)
- **Infra / tooling:** GitHub · Docker · PostgreSQL · Supabase · Power Automate

---

## Bash Commands

```bash
# Python
uvicorn app.main:app --reload --port 8000   # FastAPI dev server
python -m pytest tests/ -v                  # Run tests
python -m pytest tests/ -v --cov=app        # With coverage
ruff check . && ruff format .               # Lint + format
mypy app/                                   # Type-check

# Node / React
npm run dev         # Vite dev server
npm run build       # Production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit

# Git
git checkout -b feature/<ticket>-<short-desc>
git push origin HEAD --force-with-lease
```

---

## Architecture Preferences

- **Think before you code.** On any non-trivial task, propose the architecture/approach first and wait for sign-off before writing code. Prefer one thorough analysis over several iterative patches.
- **Layered structure:** `routers → services → repositories → models`. No business logic in routers.
- **RAG pattern:** chunking → embedding → vector store → retrieval chain → response synthesis.
- **Agentic workflows:** prefer LangGraph for stateful agents; use LangChain Expression Language (LCEL) for simple chains.
- **Config via env vars** — never hardcode secrets or endpoints. Use `.env` + `pydantic-settings`.
- **Azure OpenAI** is the default LLM provider. Use `AzureChatOpenAI` / `AzureOpenAIEmbeddings`.

---

## Python Code Style

- **Python 3.11+**; type hints everywhere.
- Use `async/await` throughout FastAPI routes and service methods.
- Pydantic v2 models for all request/response schemas.
- Descriptive names: `get_shipment_status()` not `get_status()`.
- Docstrings on all public functions (Google style).
- No `print()` in production code — use `logging` with structured output.
- Single responsibility per function/class; aim for < 50 lines per function.

```python
# Preferred FastAPI route pattern
@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str, service: ItemService = Depends(get_item_service)) -> ItemResponse:
    """Fetch a single item by ID."""
    return await service.get_by_id(item_id)
```

---

## TypeScript / React Code Style

- **Strict TypeScript** — no `any`; prefer `unknown` + type guards.
- Functional components only; hooks for all state.
- Custom hooks (`useXxx`) for any logic > 5 lines shared across components.
- Tailwind CSS for styling; no inline styles.
- Always handle loading, error, and empty states in UI components.
- Prefer `const` arrow functions for components exported from a file.

---

## Testing

- **Python:** `pytest` + `pytest-asyncio`; mock external calls with `unittest.mock` or `pytest-mock`.
- **LLM calls:** always mock in unit tests; use `langchain.callbacks` for integration tests.
- **React:** Vitest + React Testing Library.
- Minimum coverage target: **80%** for services; routers and utilities at best effort.
- Test file mirrors source: `app/services/item.py` → `tests/services/test_item.py`.

---

## LLM / GenAI Conventions

- System prompts live in `app/prompts/` as `.txt` files — never inline strings.
- Use structured output (Pydantic) wherever the LLM response feeds downstream logic.
- Always set `temperature=0` for deterministic extraction tasks; allow higher for creative/generation.
- Log token usage in every LLM call for cost monitoring.
- Retrieval: chunk size 512 tokens, overlap 64, cosine similarity threshold 0.75 (adjust per domain).
- For agents: define tool schemas clearly; add `verbose=True` during dev, remove before prod.

---

## Git Conventions

- Branch: `feature/<desc>` · `fix/<desc>` · `chore/<desc>`
- Commits: imperative, present tense — `Add retry logic to embedder`, not `Added` or `Adding`.
- Squash WIP commits before PR.
- Never commit `.env`, API keys, or model weights.
- PR description must include: **What / Why / How to test**.

---

## Project Structure (Python FastAPI default)

```
project/
├── app/
│   ├── main.py
│   ├── core/          # config, logging, dependencies
│   ├── routers/       # HTTP layer only
│   ├── services/      # business logic
│   ├── repositories/  # DB / vector store access
│   ├── models/        # SQLAlchemy / Pydantic schemas
│   └── prompts/       # LLM prompt templates (.txt)
├── tests/
├── .env.example
├── pyproject.toml
└── CLAUDE.md
```

---

## Do / Don't

| Do | Don't |
|---|---|
| Propose architecture before coding | Start writing code without a plan |
| Use dependency injection via `Depends()` | Instantiate services inside routes |
| Return typed Pydantic models from all endpoints | Return raw dicts from FastAPI routes |
| Use `httpx.AsyncClient` for outbound HTTP | Use `requests` in async code |
| Prefer LangChain built-ins before custom chains | Re-implement retrieval/embedding logic from scratch |
| Comment non-obvious logic inline | Write comments that just restate the code |

---

## Compaction Instructions

When compacting, always preserve:
1. The current task description and acceptance criteria
2. File paths of all files created or modified
3. Any pending TODOs or blockers
4. LLM prompts and chain configs that were finalised

---

## Notes

- This file applies globally across all my projects. Override per-project in a subdirectory `CLAUDE.md`.
- For Freightysh web projects (React + Supabase): RLS policies must be reviewed before any auth change.
- For Baxter/enterprise work: no real patient/employee data in prompts or tests — use synthetic data only.