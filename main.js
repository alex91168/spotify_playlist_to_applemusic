import dotenv from "dotenv";
import axios from "axios";
import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import * as cheerio from 'cheerio';

dotenv.config();
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--disable-gpu');
chromeOptions.addArguments("--user-data-dir=C:/Users/NOME_DE_USUARIO/AppData/Local/Google/Chrome/User Data"); 
chromeOptions.addArguments("--profile-directory=Profile NUMERO_DO_PERFIL");
chromeOptions.addArguments('--headless'); 
let driver;

const SPOTIFY_KEY = process.env.SPOTIFY_KEY;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;
const SPOTIFY_PLAYLIST_LINK = 'https://open.spotify.com/playlist/ID_DA_PLAYLIST';
const PLAYLIST_APPLE = 'https://music.apple.com/br/playlist/NOME_DA_PLAYLIST/ID_DA_PLAYLIST';

const spotifyAuth = async () => {
   const url = "https://accounts.spotify.com/api/token";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
   const data = {
        "grant_type": "client_credentials",
        "client_id": SPOTIFY_KEY,
        "client_secret": SPOTIFY_SECRET
    }

   try {
        const response = await axios.post(url, data, {headers});
        if (response.status === 200) {
            const token = response.data.access_token;
            return token;
        } else {
            console.log('Error');
        }
   } catch (error) {
    console.log(error);
   }
}

const getSpotifyPlaylist = async (SPOTIFY_PLAYLIST_LINK, TOKEN) => {
    const playlist_id = SPOTIFY_PLAYLIST_LINK.split('playlist/')[1].split('/')[0];
    let musicas= []
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
    const headers = {
        "Authorization": `Bearer ${TOKEN}`
    }
    const response = await axios.get(url, {headers});
    if (response.status === 200) {
        const tracks = response.data.items;
        for (let item of tracks) {
            const music_name = item.track.name;
            const artists_name = item.track.artists[0].name;
            musicas.push(music_name + ' - ' + artists_name);
        }
    }
    return musicas;
} 

const create_driver = async (PLAYLIST_APPLE_NAME, MUSICAS_SPOTIFY ) => {
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
        await ADD_TO_PLAYLIST(PLAYLIST_APPLE_NAME, MUSICAS_SPOTIFY);
}

const ADD_TO_PLAYLIST = async (PLAYLIST_APPLE_NAME, MUSICAS_SPOTIFY) => {
    await driver.get('https://music.apple.com/br/search'); 
    await driver.sleep(2000);
    let musicas_error = [];
    console.log('Serão adicionadas '+ MUSICAS_SPOTIFY.length + ' musicas.');
    try {
        for (let i = 0; i < MUSICAS_SPOTIFY.length; i++) {
            let retry = true;
            while (retry) {
                const search_input = await driver.wait(until.elementLocated(By.xpath("//input[@data-testid='search-input__text-field']")), 10000);
                await search_input.click();
                await search_input.clear();
                await search_input.sendKeys(MUSICAS_SPOTIFY[i]);
                console.log('Pesquisando pela musica: ' + MUSICAS_SPOTIFY[i]);
                await search_input.sendKeys(Key.ENTER);
                let listas_musicas;
                let primeiro_resultado;
                try {
                    listas_musicas = await driver.wait(until.elementLocated(By.xpath("//ul[@class='shelf-grid__list shelf-grid__list--grid-type-TrackLockupsShelf svelte-ygnzwc']")), 3000);
                    primeiro_resultado = await listas_musicas.findElements(By.xpath("//li[@class='shelf-grid__list-item svelte-ygnzwc']"));
                } catch (err) {
                    console.log('Musica não encontrada');
                    retry = false;
                    break;
                }
                try {
                    let row = 0;
                    let li_container = [];
                    while (row < 5){
                        try {
                            const div_botao = await primeiro_resultado[0].findElement(By.xpath("//div[@class='track-lockup__context-menu svelte-nvj7sn']"));
                            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", div_botao);
                            const isVisible = await div_botao.isDisplayed();
                            const isEnabled = await div_botao.isEnabled();
                            if (isVisible && isEnabled) {
                                await div_botao.click();
                            } else {
                                await driver.sleep(1000);
                                row++;
                            }
                        } catch (err) {
                            console.log('Err', err);
                            row++;
                        }
                        const ulContainer_menu = await driver.wait(until.elementLocated(By.xpath("//ul[@class='contextual-menu__list']")), 10000);
                        await driver.wait(until.elementIsVisible(ulContainer_menu), 5000);
                        li_container = await ulContainer_menu.findElements(By.xpath("//amp-contextual-menu-item"));
                        if (li_container.length > 0) {
                            const isClickable = await li_container[0].isEnabled();
                            const isVisible = await li_container[0].isDisplayed();
                            if (isVisible && isClickable) {
                                //await li_container[0].click();
                                break;
                            }
                        } 
                        row++;
                        await driver.sleep(1000);
                    }
                    let addplaylist_nested;
                    try {
                        await li_container[0].click();
                        addplaylist_nested = await li_container[0].findElement(By.xpath("//div[@class='contextual-menu-item--nested']"));
                    } catch {
                        console.log('Nova tentativa');
                        retry = true;
                        continue;
                    }
                    const container_ul = await addplaylist_nested.findElement(By.xpath("//ul[@class='contextual-menu__list']"));
                    const li_divs = await container_ul.findElements(By.xpath("//div[@class='contextual-menu__group']"));
                    const playlists_div = await li_divs[1].findElements(By.xpath("//amp-contextual-menu-item"));
                    for (let playlist of playlists_div) {
                        let playlist_name;
                        let getAtributeTitle;
                        try {
                            playlist_name = await playlist.findElement(By.xpath(".//button"));
                            getAtributeTitle = await playlist_name.getAttribute('title');
                        } catch {
                            retry = true;
                            continue;
                        }
                        if (getAtributeTitle === PLAYLIST_APPLE_NAME) {
                            console.log('Playlist encontrada', getAtributeTitle);
                            await driver.sleep(1500);
                            try {
                                await playlist_name.click();
                                console.log('Musica ' + MUSICAS_SPOTIFY[i] + ' adicionada na playlist ' + PLAYLIST_APPLE_NAME);
                                retry = false;
                                break;
                            } catch (err) {
                                console.log('Error ////////');
                                retry = true;
                                continue;
                            }
                        } 
                    }
                    await driver.sleep(1000);
                } catch (err) {
                    console.log('Teste 149', err.stack);
                    musicas_error.push(MUSICAS_SPOTIFY[i]);
                    retry = false;
                    break;
                }
            }
        }
        console.log('/////////////////////////////////////////////');
        console.log('Musicas nao adicionadas', musicas_error);
        console.log('Musicas nao adicionadas ', musicas_error.length);

        await driver.quit();
    } catch (err) {
        console.log('Erro ao pesquisar musica 144 ' + err);
        await driver.quit();
    }
}

const PLAYLIST_APPLE_URL = async (PLAYLIST_APPLE) => {
    const request = await axios.get(PLAYLIST_APPLE);
    const $ = cheerio.load(request.data);
    const playlist_name = $('h1').text();
    return playlist_name;
}

const TOKEN = await spotifyAuth();
const MUSICAS_SPOTIFY = await getSpotifyPlaylist( SPOTIFY_PLAYLIST_LINK, TOKEN );
const PLAYLIST_APPLE_NAME = await PLAYLIST_APPLE_URL(PLAYLIST_APPLE);
await create_driver( PLAYLIST_APPLE_NAME, MUSICAS_SPOTIFY );