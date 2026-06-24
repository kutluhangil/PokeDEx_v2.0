import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "app.title": "POKÉDEX",
      "app.search": "SEARCH AND FILTER ALL POKÉMON",
      "app.placeholder": "e.g. pikachu, 25, char…",
      "app.login": "LOGIN",
      "app.logout": "LOGOUT",
      "app.random": "RANDOM",
      "app.shiny": "SHINY",
      "app.retro": "RETRO",
      "app.neon": "NEON",
      "app.results": "{{count}} RESULT",
      "app.results_plural": "{{count}} RESULTS",
      "app.showing_top": "(SHOWING TOP 60)",
      "app.no_pokemon_found": "NO POKÉMON FOUND",
      "filter.all_gens": "All Gens",
      "filter.gen": "GENERATION",
      "filter.sort": "SORT BY",
      "sort.id_asc": "ID (Low to High)",
      "sort.id_desc": "ID (High to Low)",
      "sort.name_asc": "Name (A to Z)",
      "sort.name_desc": "Name (Z to A)",
      "modal.add_team": "ADD TO TEAM +",
      "modal.remove_team": "REMOVE FROM TEAM ✕",
      "modal.stats_info": "STATS & INFO",
      "modal.move_set": "MOVE SET ({{count}})",
      "modal.height": "HEIGHT",
      "modal.weight": "WEIGHT",
      "modal.abilities": "ABILITIES",
      "modal.base_stats": "BASE STATS",
      "modal.evolution": "EVOLUTION CHAIN",
      "modal.move": "MOVE",
      "modal.method": "METHOD",
      "modal.level": "LEVEL",
    }
  },
  tr: {
    translation: {
      "app.title": "POKÉDEX",
      "app.search": "TÜM POKÉMONLARI ARA VE FİLTRELE",
      "app.placeholder": "örn: pikachu, 25, char…",
      "app.login": "GİRİŞ",
      "app.logout": "ÇIKIŞ",
      "app.random": "RASTGELE",
      "app.shiny": "PARLAK",
      "app.retro": "RETRO",
      "app.neon": "NEON",
      "app.results": "{{count}} SONUÇ",
      "app.results_plural": "{{count}} SONUÇ",
      "app.showing_top": "(İLK 60 GÖSTERİLİYOR)",
      "app.no_pokemon_found": "POKÉMON BULUNAMADI",
      "filter.all_gens": "Tüm Nesiller",
      "filter.gen": "NESİL",
      "filter.sort": "SIRALA",
      "sort.id_asc": "ID (Artan)",
      "sort.id_desc": "ID (Azalan)",
      "sort.name_asc": "İsim (A - Z)",
      "sort.name_desc": "İsim (Z - A)",
      "modal.add_team": "TAKIMA EKLE +",
      "modal.remove_team": "TAKIMDAN ÇIKAR ✕",
      "modal.stats_info": "İSTATİSTİKLER VE BİLGİ",
      "modal.move_set": "HAREKETLER ({{count}})",
      "modal.height": "BOY",
      "modal.weight": "KİLO",
      "modal.abilities": "YETENEKLER",
      "modal.base_stats": "TEMEL İSTATİSTİKLER",
      "modal.evolution": "EVRİM AĞACI",
      "modal.move": "HAREKET",
      "modal.method": "YÖNTEM",
      "modal.level": "SEVİYE",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
