@echo off
echo 🌊 Blue Horizon API Quick Test
echo ===============================
echo.

set BASE_URL=http://localhost:3001

echo Testing server health...
curl -s %BASE_URL%/ && echo ✅ Server is running || echo ❌ Server not responding
echo.

echo Testing 24h trends...
curl -s "%BASE_URL%/api/trends/WQ-001?range=24h" | findstr "deviceId" && echo ✅ 24h trends working || echo ❌ 24h trends failed
echo.

echo Testing 7d trends...
curl -s "%BASE_URL%/api/trends/WQ-001?range=7d" | findstr "deviceId" && echo ✅ 7d trends working || echo ❌ 7d trends failed
echo.

echo Testing error handling...
curl -s "%BASE_URL%/api/trends/WQ-001?range=invalid" | findstr "error" && echo ✅ Error handling working || echo ❌ Error handling failed
echo.

echo.
echo 🎉 Quick tests completed!
echo For detailed testing, use the Insomnia collection or run test-api.sh
pause