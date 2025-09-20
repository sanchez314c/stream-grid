@echo off
setlocal enabledelayedexpansion

REM Run StreamGRID from Compiled Binary on Windows
REM Launches the pre-built application from dist/ directory

REM Color codes for output (using Windows color command when available)
set "RED=[91m"
set "GREEN=[92m" 
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Get the script directory and navigate to project root
cd /d "%~dp0.."

REM Function to print colored output (simplified for batch)
echo %BLUE%[%time:~0,8%]%NC% Starting StreamGRID from compiled binary (Windows)...

REM Check if we're on Windows (redundant but consistent with other scripts)
if not "%OS%"=="Windows_NT" (
    echo %RED%[%time:~0,8%] Error%NC% This script is designed for Windows only
    echo Use run-macos.sh for macOS or run-linux.sh for Linux
    exit /b 1
)

REM Look for built applications in common locations
set "APP_PATH="
set "APP_TYPE="

REM Check for executable in unpacked directory
if exist "dist\win-unpacked\StreamGRID.exe" (
    set "APP_PATH=dist\win-unpacked\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

if exist "dist\win-ia32-unpacked\StreamGRID.exe" (
    set "APP_PATH=dist\win-ia32-unpacked\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

if exist "build\win-unpacked\StreamGRID.exe" (
    set "APP_PATH=build\win-unpacked\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

if exist "out\StreamGRID-win32-x64\StreamGRID.exe" (
    set "APP_PATH=out\StreamGRID-win32-x64\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

if exist "out\StreamGRID-win32-ia32\StreamGRID.exe" (
    set "APP_PATH=out\StreamGRID-win32-ia32\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

REM Check for installer executables
for %%f in ("dist\StreamGRID*.exe" "dist\*.exe" "build\StreamGRID*.exe" "out\StreamGRID*.exe") do (
    if exist "%%f" (
        REM Make sure it's not an installer by checking size (installers are usually larger)
        for %%i in ("%%f") do (
            if %%~zi lss 50000000 (
                set "APP_PATH=%%f"
                set "APP_TYPE=executable"
                goto found_app
            )
        )
    )
)

REM Check for portable zip extractions
if exist "dist\StreamGRID.exe" (
    set "APP_PATH=dist\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

if exist "build\StreamGRID.exe" (
    set "APP_PATH=build\StreamGRID.exe"
    set "APP_TYPE=executable"
    goto found_app
)

REM If no executable found, show error
echo %RED%[%time:~0,8%] Error%NC% StreamGRID executable not found in any expected location
echo Expected locations checked:
echo   - dist\win-unpacked\StreamGRID.exe
echo   - dist\win-ia32-unpacked\StreamGRID.exe  
echo   - build\win-unpacked\StreamGRID.exe
echo   - out\StreamGRID-win32-x64\StreamGRID.exe
echo   - out\StreamGRID-win32-ia32\StreamGRID.exe
echo   - dist\StreamGRID*.exe
echo.
echo Please build the application first using:
echo   compile-build-dist.bat
echo Or run from source using:
echo   scripts\run-windows-source.bat
exit /b 1

:found_app
echo %GREEN%[%time:~0,8%] Success%NC% Found application at: %APP_PATH%

REM Get application info
echo %BLUE%[%time:~0,8%]%NC% Application Details:
echo   Path: %APP_PATH%
echo   Type: %APP_TYPE%

REM Get file version if available
for /f "tokens=*" %%i in ('powershell -command "(Get-ItemProperty '%APP_PATH%').VersionInfo.FileVersion" 2^>nul') do (
    if not "%%i"=="" echo   Version: %%i
)

REM Get architecture
for /f "tokens=*" %%i in ('powershell -command "$file = Get-ItemProperty '%APP_PATH%'; if($file.VersionInfo.Comments -match 'x64') {'x64'} elseif($file.VersionInfo.Comments -match 'x86') {'x86'} elseif('%APP_PATH%' -match 'ia32') {'x86'} elseif('%APP_PATH%' -match 'x64') {'x64'} else {'unknown'}" 2^>nul') do (
    if not "%%i"=="" echo   Architecture: %%i
)

REM Check for Windows Defender or antivirus interference
echo %BLUE%[%time:~0,8%]%NC% Checking for potential issues...

REM Check if file is blocked by Windows
for /f "tokens=*" %%i in ('powershell -command "Get-Item '%APP_PATH%' | Get-ItemProperty -Name Zone.Identifier -ErrorAction SilentlyContinue" 2^>nul') do (
    if not "%%i"=="" (
        echo %YELLOW%[%time:~0,8%] Warning%NC% File may be blocked by Windows security
        echo Attempting to unblock...
        powershell -command "Unblock-File '%APP_PATH%'" >nul 2>&1
        if %errorlevel% equ 0 (
            echo %GREEN%[%time:~0,8%] Success%NC% File unblocked
        )
    )
)

REM Check for required Visual C++ redistributables
echo %BLUE%[%time:~0,8%]%NC% Checking system dependencies...

REM Simple check for common VC++ redistributables
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" >nul 2>&1
if %errorlevel% neq 0 (
    reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x86" >nul 2>&1
    if %errorlevel% neq 0 (
        echo %YELLOW%[%time:~0,8%] Warning%NC% Visual C++ Redistributable may not be installed
        echo If the app fails to start, install:
        echo   Visual C++ Redistributable for Visual Studio 2015-2022
        echo   Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe
    )
)

REM Set up environment
set ELECTRON_DISABLE_SECURITY_WARNINGS=1

REM Disable GPU acceleration if requested (useful for some Windows systems)
set ELECTRON_ARGS=
if "%1"=="--no-gpu" (
    set ELECTRON_ARGS=--disable-gpu
    echo %BLUE%[%time:~0,8%]%NC% GPU acceleration disabled by --no-gpu flag
) else (
    REM Check for GPU acceleration support (basic check)
    dxdiag /whql:off /t dxdiag_temp.txt >nul 2>&1
    if exist dxdiag_temp.txt (
        findstr /c:"DirectX" dxdiag_temp.txt >nul 2>&1
        if %errorlevel% equ 0 (
            echo %GREEN%[%time:~0,8%] Success%NC% DirectX detected - hardware acceleration available
        )
        del dxdiag_temp.txt >nul 2>&1
    )
)

REM Launch the application
echo %BLUE%[%time:~0,8%]%NC% Launching StreamGRID...
echo %BLUE%[%time:~0,8%]%NC% Press Alt+F4 or close the application window to quit
echo.

REM Launch the application with error handling
if "%APP_TYPE%"=="executable" (
    if not "%ELECTRON_ARGS%"=="" (
        start "StreamGRID" /wait "%APP_PATH%" %ELECTRON_ARGS%
    ) else (
        start "StreamGRID" /wait "%APP_PATH%"
    )
    set LAUNCH_RESULT=%errorlevel%
) else (
    REM For installers, just run them
    "%APP_PATH%"
    set LAUNCH_RESULT=%errorlevel%
)

echo.
if %LAUNCH_RESULT% equ 0 (
    echo %GREEN%[%time:~0,8%] Success%NC% StreamGRID exited successfully
) else (
    echo %RED%[%time:~0,8%] Error%NC% StreamGRID exited with error code %LAUNCH_RESULT%
    
    if %LAUNCH_RESULT% equ 9009 (
        echo File not found or path issues
        echo Check that the executable exists: %APP_PATH%
    ) else if %LAUNCH_RESULT% equ 5 (
        echo Access denied - try running as administrator
    ) else if %LAUNCH_RESULT% equ 193 (
        echo Invalid executable format or architecture mismatch
    ) else if %LAUNCH_RESULT% equ 216 (
        echo This version of the executable is not compatible with your Windows version
    )
    
    echo.
    echo For more detailed error information, try running from source:
    echo   scripts\run-windows-source.bat
    exit /b 1
)

echo %GREEN%[%time:~0,8%] Success%NC% StreamGRID execution completed