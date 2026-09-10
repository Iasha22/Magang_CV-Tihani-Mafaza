@echo off
echo ====================================================================
echo   SISTEM INFORMASI AKUNTANSI TERINTEGRASI SIPLAH
echo   CV TIHANI MAFAZA - BANDUNG
echo   Oleh: Iasha Tsamrotul Fuadi (STMIK Mardira Indonesia)
echo ====================================================================
echo.

set PATH=C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64;C:\laragon\bin\composer;C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin;%PATH%

echo Memulai Server Aplikasi SIA SIPLah...
echo Akses aplikasi di browser: http://127.0.0.1:8000
echo.
echo Akun Demo:
echo - Admin (Iasha) : admin@tihani.id / admin123
echo - Direktur       : direktur@tihani.id / direktur123
echo ====================================================================
echo.

php artisan serve --port=8000
pause
