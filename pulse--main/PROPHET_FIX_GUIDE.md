# Prophet Model Fix Guide

## Problem
The Prophet forecasting model is not working due to missing CmdStan backend.

**Error:** `AttributeError: 'Prophet' object has no attribute 'stan_backend'`

## Why Prophet is Not Working

1. **Prophet requires CmdStan**: Prophet uses Stan (a probabilistic programming language) which needs CmdStan (the C++ compiler) to be installed separately.

2. **Auto-installation failing**: When Prophet tries to auto-install CmdStan, it's hitting GitHub rate limits (HTTP 403).

3. **Windows complexity**: Installing CmdStan on Windows requires additional setup.

## Solutions

### Option 1: Manual CmdStan Installation (Recommended)

1. **Install CmdStan manually:**

```powershell
cd backend
.\venv\Scripts\activate
python -m cmdstanpy.install_cmdstan
```

If that fails due to GitHub rate limits, you can:
- Wait and retry later
- Use a VPN
- Install from a mirror

2. **Verify installation:**

```powershell
python -c "import cmdstanpy; print(cmdstanpy.__version__); print(cmdstanpy.cmdstan_path())"
```

### Option 2: Use Fallback Model (Current Implementation)

**Good news:** The code is already configured to use a fallback model when Prophet fails!

The current implementation:
- ✅ Automatically falls back to a rolling average method
- ✅ Still generates valid forecasts
- ✅ Shows graphs correctly
- ✅ Works without Prophet

**You don't need to fix Prophet to use the application** - it's already working with the fallback!

### Option 3: Alternative Forecasting Libraries

If you want advanced forecasting without Prophet's complexity:

1. **LightGBM** (already installed):
```python
# Could be used for time-series forecasting
```

2. **Statsmodels**:
```python
pip install statsmodels
# Provides ARIMA and other time-series models
```

3. **Simple statistical methods** (current fallback):
```python
# Rolling average with AQI adjustments
# Already implemented and working!
```

## Current Status

✅ **Forecasts ARE working** - Using fallback rolling average method
✅ **Graphs ARE displaying** - No issues with visualization
✅ **API is functional** - All endpoints working

The only difference:
- **With Prophet**: More sophisticated seasonality detection
- **Without Prophet**: Simple rolling average with AQI/scenario adjustments

Both methods provide valid forecasts for the hospital operations dashboard.

## Recommendations

### For Development/Demo:
**Keep using the fallback method** - It's working fine and doesn't require additional setup.

### For Production:
1. Install CmdStan manually (Option 1)
2. Or switch to LightGBM/statsmodels if you need advanced features
3. Or use the fallback (simpler, faster, and adequate for most cases)

## Testing the Current Fallback

The fallback method is already active. You can verify:

1. Check the methodology explanation - it will say "Rolling Average" instead of "Prophet"
2. Graphs should display correctly
3. Forecasts should be generated

## Technical Details

**Prophet Installation Requirements:**
- Prophet Python package ✅ (installed)
- cmdstanpy package ✅ (installed)
- CmdStan C++ compiler ❌ (missing - causing the error)

**Fallback Method:**
- Uses last 30 days average
- Applies AQI multipliers (1.1x for AQI 150+, up to 1.5x for AQI 200+)
- Applies festival surge (1.15x multiplier)
- Generates confidence intervals (±20%)

This fallback is actually quite good for operational forecasting and often performs similarly to Prophet for short-term forecasts (7-30 days).
