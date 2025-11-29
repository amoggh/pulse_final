@echo off
REM Quick start script for Pulse Agent

echo ============================================================
echo PULSE PREDICTIVE AGENT - Quick Start
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Check for .env file
if not exist "..\\.env" (
    echo WARNING: .env file not found!
    echo Creating .env from env.example...
    copy "..\\env.example" "..\\.env"
    echo.
    echo Please edit .env file with your configuration
    pause
)

REM Show menu
:menu
echo.
echo ============================================================
echo Select mode:
echo ============================================================
echo 1. Test Mode (Quick test with mock data)
echo 2. Run Once (Single execution)
echo 3. Continuous Mode (Runs every hour)
echo 4. Run Tests
echo 5. Exit
echo ============================================================
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Running in TEST mode...
    python -m worker.main test
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Running ONCE...
    python -m worker.main once
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo Running in CONTINUOUS mode...
    echo Press Ctrl+C to stop
    python -m worker.main
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Running TESTS...
    python -m worker.test_agent
    goto menu
)

if "%choice%"=="5" (
    echo.
    echo Goodbye!
    exit /b
)

echo Invalid choice. Please try again.
goto menu
