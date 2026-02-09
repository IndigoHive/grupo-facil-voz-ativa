@echo off
echo Starting cleanup process...

:: Delete __pycache__ directories recursively
echo Deleting __pycache__ folders...
for /d /r %%d in (__pycache__) do (
    if exist "%%d" (
        echo Deleting "%%d"
        rd /s /q "%%d"
    )
)

:: Delete node_modules directories recursively
echo Deleting node_modules folders...
for /d /r %%d in (node_modules) do (
    if exist "%%d" (
        echo Deleting "%%d"
        rd /s /q "%%d"
    )
)

echo Cleanup complete!
pause
