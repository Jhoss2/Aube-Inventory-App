/**
 * Moteur IA Aube - Gestion Hybride & Streaming
 * Ce service gère la communication avec le modèle local (Offline) 
 * ou l'API de secours (Online).
 */

export const chatWithAubeStream = async (
  userMessage: string, 
  systemPrompt: string, 
  onChunk: (chunk: string) => void
) => {
  try {
    // 1. Ici, on appellerait le modèle local (ex: MLC-LLM ou Llama-RN)
    // Pour la démo, nous simulons une réponse intelligente basée sur le prompt
    
    let response = "";
    
    // Logique de réponse simple si hors-ligne ou simulation
    if (userMessage.toLowerCase().includes("bloc e")) {
      response = "Le Bloc E est principalement dédié aux salles de cours et aux laboratoires. Il contient actuellement 12 salles répertoriées dans votre inventaire.";
    } else {
      response = "Je comprends votre demande concernant l'inventaire. En tant qu'assistant de l'Université AUBEN, je peux vous aider à suivre l'état du matériel ou à planifier les renouvellements. Que souhaitez-vous savoir précisément ?";
    }

    // 2. Simulation du Streaming (mot par mot)
    const words = response.split(' ');
    for (const word of words) {
      // On envoie le mot au composant UI
      onChunk(word + ' ');
      // Délai variable pour un effet naturel (30ms à 70ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 30));
    }

  } catch (error) {
    console.error("Erreur Moteur IA:", error);
    onChunk("Désolé, j'ai rencontré une difficulté technique pour répondre. Vérifiez vos paramètres IA.");
  }
};
