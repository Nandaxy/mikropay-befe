echo "Menginstall PM2..."

if ! command -v pm2 &> /dev/null; then
  npm install -g pm2 || { echo "Failed to install PM2"; exit 1; }
  echo "PM2 installed successfully."
fi


echo "Menginstall module React JS...."
(
  cd fe &&
  npm install &&
  npm run build &&
  mv dist/* ../be/views
)

echo "Menginstall module Express JS...."
(
  cd be &&
  npm install &&
  pm2 start server.js
)

echo "Deployment completed successfully."
echo "Buka Browser http://localhost:5000"
