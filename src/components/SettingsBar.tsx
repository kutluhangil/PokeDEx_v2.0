import { Sparkles, Monitor, Shuffle, Tv, User } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface SettingsBarProps {
  onRandom: () => void;
}

const SettingsBar = ({ onRandom }: SettingsBarProps) => {
  const { theme, setTheme, shiny, setShiny, crt, setCrt } = useSettings();
  const { user, login, logout } = useAuth();
  const { t, i18n } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRandom}
        title="Surprise me"
        className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-all font-pixel text-[8px]"
      >
        <Shuffle className="w-3 h-3" />
        <span className="hidden sm:inline">{t("app.random")}</span>
      </button>

      <button
        onClick={() => setShiny(!shiny)}
        title="Toggle shiny mode"
        className={`flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg border transition-all font-pixel text-[8px] ${
          shiny
            ? "bg-secondary/20 border-secondary/50 text-secondary text-glow-yellow"
            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="hidden sm:inline">{t("app.shiny")}</span>
      </button>

      <button
        onClick={() => setTheme(theme === "neon" ? "ultra-retro" : "neon")}
        title="Toggle ultra retro mode"
        className={`flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg border transition-all font-pixel text-[8px] ${
          theme === "ultra-retro"
            ? "bg-accent/20 border-accent/50 text-accent"
            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Monitor className="w-3 h-3" />
        <span className="hidden sm:inline">{theme === "ultra-retro" ? t("app.retro") : t("app.neon")}</span>
      </button>

      <button
        onClick={() => setCrt(!crt)}
        title="Toggle CRT screen effect"
        className={`flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg border transition-all font-pixel text-[8px] ${
          crt
            ? "bg-primary/20 border-primary/50 text-primary text-glow-red"
            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Tv className="w-3 h-3" />
        <span className="hidden sm:inline">CRT</span>
      </button>

      <button
        onClick={() => i18n.changeLanguage(i18n.language.startsWith('en') ? 'tr' : 'en')}
        title="Toggle language"
        className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground transition-all font-pixel text-[8px]"
      >
        <span>{i18n.language.startsWith('en') ? 'TR' : 'EN'}</span>
      </button>

      {user ? (
        <button
          onClick={logout}
          title={`Logged in as ${user.displayName}. Click to logout.`}
          className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg border border-pixel-green/50 bg-pixel-green/20 text-pixel-green transition-all font-pixel text-[8px]"
        >
          <img src={user.photoURL || ""} alt="" className="w-3 h-3 rounded-full" />
          <span className="hidden sm:inline">{t("app.logout")}</span>
        </button>
      ) : (
        <button
          onClick={login}
          title="Login to cloud save your team"
          className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-lg border border-primary/50 bg-primary/20 text-primary transition-all font-pixel text-[8px] hover:bg-primary/30"
        >
          <User className="w-3 h-3" />
          <span className="hidden sm:inline">{t("app.login")}</span>
        </button>
      )}
    </div>
  );
};

export default SettingsBar;
