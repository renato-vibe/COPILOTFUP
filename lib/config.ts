import { ColorScheme, StartScreenPrompt, ThemeOption } from "@openai/chatkit";

const DEFAULT_WORKFLOW_ID =
  "wf_691498ab3cd08190b31a1ecadd223ed008ae1288861d6473";

export const WORKFLOW_ID =
  process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? DEFAULT_WORKFLOW_ID;

const DEFAULT_SESSION_ENDPOINT = "/api/create-session";

export const CREATE_SESSION_ENDPOINT =
  process.env.NEXT_PUBLIC_CREATE_SESSION_ENDPOINT?.trim() ??
  DEFAULT_SESSION_ENDPOINT;

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Resumí el último follow-up",
    prompt:
      "Resume en bullets claros el último seguimiento y destaca acciones bloqueadas.",
    icon: "circle-question",
  },
  {
    label: "Prepara próximos pasos",
    prompt:
      "Con los hechos recopilados, arma próximos pasos priorizados y tiempos estimados.",
    icon: "circle-question",
  },
  {
    label: "Detecta riesgos",
    prompt:
      "Analiza los mensajes y enumera posibles riesgos o vacíos de información para resolver.",
    icon: "circle-question",
  },
];

export const PLACEHOLDER_INPUT = "Escribe cómo puedo ayudarte con tu seguimiento...";

export const GREETING =
  "Hola, soy tu copiloto FollowUP. ¿Qué quieres destrabar primero?";

export const getThemeConfig = (theme: ColorScheme): ThemeOption => ({
  color: {
    grayscale: {
      hue: 220,
      tint: 6,
      shade: theme === "dark" ? -1 : -4,
    },
    accent: {
      primary: theme === "dark" ? "#67e8f9" : "#0f172a",
      level: 2,
    },
  },
  radius: "pill",
});
