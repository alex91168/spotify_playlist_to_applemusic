# Apple Music Playlist Creator

Este projeto permite criar playlists no Apple Music a partir de playlists do Spotify. Ele autentica no Spotify para obter as músicas e depois pesquisa as musicas correspondentes na plataforma da Apple Music, adicionando-os a uma playlist criada pelo usuário.

## 🚀 Funcionalidades
- Autenticação na API do Spotify
- Busca de músicas em uma playlist do Spotify
- Pesquisa automática dos vídeos correspondentes no YouTube
- Adição dos vídeos em uma playlist específica no YouTube

## 🛠️ Tecnologias Utilizadas
- Node
- Axios
- Cheerio
- Spotify API
- dotenv
- Selenium
- Chromium

## 📦 Instalação
1. Clone este repositório:
   ```sh
   git clone https://github.com/alex91168/spotify_playlist_to_applemusic.git
   ```
2. Entre no diretório do projeto:
   ```sh
   cd nome-do-projeto
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```

## 🔑 Configuração das Credenciais
1. Configurando perfil no Chrome: 
    - Escolha um perfil do Chrome que você usará para acessar o Apple Music.
    - Abra o Chrome e faça login na sua conta do Apple Music com esse perfil.
    - Localize o Diretório do Perfil no Chrome em `chrome://version`.
    - Copie o caminho da seção **"Profile Path"**, que será algo semelhante a: 
    ```path
    C:/Users/NOME_DE_USUARIO/AppData/Local/Google/Chrome/User Data/Profile x
    ``` 
2. Crie suas credenciais no Spotify:
   - Spotify: [Link](https://developer.spotify.com/dashboard)
3. Crie um arquivo `.env` no diretório raiz, adicione suas credenciais do Spotify:
   ```env
   SPOTIFY_KEY=seu_client_id_spotify
   SPOTIFY_SECRET=seu_client_secret_spotify
   ```
4. Na linha 10 e 11 do código, substitua com as informações do profile path adquiridos no passo 1.:
```sh
    chromeOptions.addArguments("--user-data-dir=C:/Users/NOME_DE_USUARIO/AppData/Local/Google/Chrome/User Data"); 
    chromeOptions.addArguments("--profile-directory=Profile NUMERO_DO_PERFIL");
```
5. Na linha 17 e 18 do código, substitua a URL pela playlist do Spotify e da Apple Music:
   ```sh
   const SPOTIFY_PLAYLIST_LINK = 'https://open.spotify.com/playlist/ID_DA_PLAYLIST';
   const PLAYLIST_APPLE = 'https://music.apple.com/br/playlist/NOME_DA_PLAYLIST/ID_DA_PLAYLIST';
   ```

## ▶️ Uso
Execute o script principal:
```sh
npm main.js
```
