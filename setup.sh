#!/usr/bin/env bash
# Corrige o ambiente e instala as dependencias do officeHub dentro do WSL.
# Uso:  bash setup.sh
set -e

echo "==> Verificando o Node atual..."
NODE_PATH="$(command -v node || true)"
echo "node atual: ${NODE_PATH:-nenhum}"

# Se o node for o do Windows (/mnt/c/...) ou nao existir, instala via nvm
if [ -z "$NODE_PATH" ] || echo "$NODE_PATH" | grep -q "/mnt/"; then
  echo "==> Node do Linux nao encontrado (ou esta usando o do Windows). Instalando via nvm..."

  if ! command -v curl >/dev/null 2>&1; then
    echo "==> Instalando curl..."
    sudo apt-get update && sudo apt-get install -y curl
  fi

  if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi

  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  nvm install --lts
  nvm use --lts
else
  echo "==> Usando Node do Linux ja instalado."
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo "==> Versoes em uso:"
echo "node: $(command -v node)  ($(node -v))"
echo "npm:  $(command -v npm)   ($(npm -v))"

echo "==> Limpando instalacao anterior quebrada..."
rm -rf node_modules package-lock.json

echo "==> Instalando dependencias..."
npm install

echo ""
echo "======================================================"
echo " Pronto! Ambiente instalado com sucesso."
echo " Para iniciar o app:  npm run dev"
echo "======================================================"
