---
name: vn-financial-data-setup
description: Use when setting up Python environment for Vietnam stock market data (vnstock, yfinance) or configuring LLM providers (Google AI Studio, gemma models) — especially when numpy fails to build, Python 3.14 is too new, vnstock API has changed, gemini timeout hangs, or you need to pick the right data source for VN equities.
---

# VN Financial Data Environment Setup

## Overview

Two-layer data stack for Vietnam financial data: vnstock (primary, VN-specific) + yfinance (fallback, global). Python 3.14 blocks vnstock; use `uv` for Python 3.11 venv. LLM via Google AI Studio (free tier) with gemma-4-26b-a4b-it.

## Decision Flowchart

```
Need VN stock data?
├── YES → Use vnstock (VN-specific: financials, ratios, company profile)
│         └── Python ≥ 3.12? → Use uv to create Python 3.11 venv
│         └── Old API (Vnstock().stock())? → DEPRECATED, use vnstock.api.* instead
│         └── Source "TCBS"? → DEAD, use VCI/KBS/MSN/FMP
└── NO → Use yfinance (global stocks, forex, crypto)

Need LLM for this project?
├── Free option → Google AI Studio: LLM_PROVIDER=gemini, get key at aistudio.google.com/apikey
│         └── Model: LLM_MODEL=gemma-4-26b-a4b-it (or gemini-2.5-flash for faster)
│         └── IMPORTANT: gemma-4-26b is LARGE — first call may take 60s+ cold start
│         └── Fix: add HttpOptions(timeout=60000) to genai.Client()
├── OpenAI → LLM_PROVIDER=openai + OPENAI_API_KEY
├── Anthropic → LLM_PROVIDER=anthropic + ANTHROPIC_API_KEY
├── OpenRouter → LLM_PROVIDER=openrouter + OPENROUTER_API_KEY
└── Offline → LLM_PROVIDER=mock (simulated ReAct responses)
```

## Layer 1: vnstock (Primary — Vietnam stocks)

### Installation

```bash
# vnstock needs numpy → needs Python < 3.14
# If system Python is 3.14+, use uv:
uv venv .venv-py311 --python 3.11
source .venv-py311/bin/activate
uv pip install -r requirements.txt
uv pip install vnstock
```

### New API (after Aug 2025 deprecation)

```python
# ✅ NEW: Module-based API
from vnstock.api.quote import Quote
from vnstock.api.financial import Finance  # Note: "financial" not "finance"
from vnstock.api.company import Company

# Quote data
q = Quote(symbol='VNM', source='VCI')
hist = q.history(start='2026-07-01', end='2026-07-28')
intra = q.intraday()

# Financial data (free tier: 4 periods max)
f = Finance(symbol='VNM', source='VCI')
income = f.income_statement(period='year', lang='vi')  # 25 rows
balance = f.balance_sheet(period='year', lang='vi')    # 122 rows
ratios = f.ratio(period='year', lang='vi')              # 54 rows

# Company overview
c = Company(symbol='VNM', source='VCI')
overview = c.overview()  # 37 columns: market_cap, sector, issue_share, rating...
```

```python
# ❌ OLD: Class-based API — DEPRECATED, throws deprecation banner
from vnstock import Vnstock
stock = Vnstock().stock(symbol='VNM', source='TCBS')  # ValueError!
```

### Valid Sources

| Source | Status |
|--------|--------|
| VCI | ✅ Recommended |
| KBS | ✅ |
| MSN | ✅ |
| FMP | ✅ |
| TCBS | ❌ Removed |

### Available modules

- `vnstock.api.quote` — price history, intraday
- `vnstock.api.company` — profile, overview
- `vnstock.api.financial` — income statement, balance sheet, ratios
- `vnstock.api.trading` — order book, foreign trading
- `vnstock.api.listing` — all symbols, industry lists

## Layer 2: yfinance (Fallback — global data)

```bash
source .venv/bin/activate
pip install yfinance
```

```python
import yfinance as yf

# VN stocks (append .VN)
ticker = yf.Ticker("VNM.VN")
info = ticker.info           # marketCap, trailingPE, dividendYield, sector
hist = ticker.history(period="1mo")
fin = ticker.financials      # 4 years income statement

# Works: VNM.VN, VCB.VN, VIC.VN, HPG.VN, FPT.VN, E1VFVN30.VN
# VNIndex: ❌ 404 (use E1VFVN30.VN as proxy)

# Forex
yf.Ticker("USDVND=X").info   # VND exchange rate
```

## Layer 3: LLM Providers (src/providers.py)

### Google AI Studio (Free — Recommended)

```bash
# .env:
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_from_aistudio.google.com/apikey
LLM_MODEL=gemma-4-26b-a4b-it   # or gemini-2.5-flash (faster)
```

**Gemma-4-26b cold start fix**: gemma-4-26b-a4b-it is a large model. First call can take 60s+. The `GeminiProvider` in `src/providers.py` already has `HttpOptions(timeout=60000)` — if hang persists, switch to `gemini-2.5-flash` for development.

### GeminiProvider Architecture

```python
class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model or os.getenv("LLM_MODEL") or "gemini-2.5-flash"
```

- Reads `GEMINI_API_KEY` and `LLM_MODEL` from env
- Factory: `get_llm_provider("gemini")` or auto-detects from `LLM_PROVIDER`
- Mock provider simulates full ReAct flow for offline testing (`LLM_PROVIDER=mock`)

## Vnstock Ads Banner

vnstock prints Insiders Program ads on every call. To suppress:
- Join Insiders Program at https://vnstocks.com/insiders-program
- Or redirect stderr: `2>/dev/null`

## Dead Ends — Do NOT try

| Library | Problem |
|---------|---------|
| investpy | `pkg_resources` removed in Python 3.12+, import fails |
| dnspy (PyPI) | DNS domain parser, NOT financial data |
| vnstock old API | `Vnstock().stock()` → deprecation banner + ValueError |

## Quick Reference

```bash
# Full setup for this project:
uv venv .venv-py311 --python 3.11
source .venv-py311/bin/activate
uv pip install google-genai openai anthropic python-dotenv requests vnstock yfinance

# For LLM-only work (no stock data needed):
source .venv/bin/activate
pip install google-genai openai anthropic python-dotenv requests

# .env for Google AI Studio:
echo 'LLM_PROVIDER=gemini' > .env
echo 'GEMINI_API_KEY=<key_from_aistudio.google.com>' >> .env
echo 'LLM_MODEL=gemini-2.5-flash' >> .env   # fast for development
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `from vnstock import Vnstock` | Use `from vnstock.api.quote import Quote` |
| `source='TCBS'` | Use `source='VCI'` |
| `pip install vnstock` on Python 3.14 | Use `uv venv .venv-py311 --python 3.11` |
| `from vnstock.api.finance import Finance` | Correct import is `vnstock.api.financial` (with "al") |
| Trying VNIndex via yfinance | Use E1VFVN30.VN ETF as proxy |
| `pip install dnspy` for finance | That's a DNS library — wrong package |
| Gemini call hangs 120s+ | gemma-4-26b cold start. Use gemini-2.5-flash for dev, or wait 60s |
| `load_dotenv()` AssertionError | Call from project root, not chdir after import |
| `.env` API key exposed | Ensure `.gitignore` has `.env` (it does — verified) |
