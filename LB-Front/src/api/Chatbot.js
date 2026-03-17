import apiClient from "./config";

export const askChatbot = async (message) => {
  const response = await apiClient.post("/services/chatbot", {
    question: message,
  });

  return response.data;
};
