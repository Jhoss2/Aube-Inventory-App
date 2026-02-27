import { MLCLLM } from "@mlc-ai/react-native-llm"; // Bibliothèque haute performance

// Configuration récupérée depuis tes Paramètres (appData)
export const chatWithAube = async (userMessage: string, systemPrompt: string) => {
  const engine = new MLCLLM();

  // 1. Définir le rôle d'Aube (depuis ton champ "Base de connaissances")
  const prompt = `
    <system>: ${systemPrompt}
    <user>: ${userMessage}
    <assistant>:
  `;

  try {
    // Tentative de réponse locale (Offline)
    // On vérifie si le modèle est chargé en mémoire
    const response = await engine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "gemma-2b-q4f16_1", // Modèle ultra léger
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log("Mode Offline indisponible, tentative Online...");
    // 2. Secours Online (API Open-Source type Groq ou HuggingFace)
    // Cela permet de ne pas bloquer l'utilisateur si son téléphone est ancien
    return fetchOnlineAube(userMessage, systemPrompt);
  }
};
