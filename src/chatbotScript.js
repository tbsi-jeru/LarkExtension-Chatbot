// Chatbot script data structure
export const chatbotScript = {
  start: {
    id: 'start',
    message: "Hello! I'm your DeeDee assistant. What Design are you looking for?",
    options: [
      { text: "I need help with my account", nextId: "account_help" },
      { text: "I want to learn about features", nextId: "features" },
      { text: "I have a technical issue", nextId: "technical" },
      { text: "Just browsing", nextId: "browsing" }
    ]
  },
  account_help: {
    id: 'account_help',
    message: "I'd be happy to help with your account! What specific account issue are you experiencing?",
    options: [
      { text: "Can't log in", nextId: "login_issue" },
      { text: "Forgot password", nextId: "password_reset" },
      { text: "Update profile", nextId: "profile_update" },
      { text: "Account security", nextId: "security" }
    ]
  },
  features: {
    id: 'features',
    message: "Great! Our platform has many exciting features. Which area interests you most?",
    options: [
      { text: "AI Chat capabilities", nextId: "ai_chat" },
      { text: "File management", nextId: "file_mgmt" },
      { text: "Team collaboration", nextId: "collaboration" },
      { text: "Integration options", nextId: "integrations" }
    ]
  },
  technical: {
    id: 'technical',
    message: "I'm here to help with technical issues. What's the problem you're experiencing?",
    options: [
      { text: "App not loading", nextId: "loading_issue" },
      { text: "Slow performance", nextId: "performance" },
      { text: "Error messages", nextId: "errors" },
      { text: "Browser compatibility", nextId: "browser" }
    ]
  },
  browsing: {
    id: 'browsing',
    message: "Welcome! Feel free to explore. Is there anything specific you'd like to know about?",
    options: [
      { text: "Pricing information", nextId: "pricing" },
      { text: "Getting started guide", nextId: "getting_started" },
      { text: "Contact support", nextId: "contact" },
      { text: "Back to main menu", nextId: "start" }
    ]
  },
  login_issue: {
    id: 'login_issue',
    message: "Login issues can be frustrating! Let me help you troubleshoot this.",
    options: [
      { text: "Try password reset", nextId: "password_reset" },
      { text: "Check email verification", nextId: "email_verify" },
      { text: "Contact support", nextId: "contact" },
      { text: "Back to account help", nextId: "account_help" }
    ]
  },
  password_reset: {
    id: 'password_reset',
    message: "I'll help you reset your password. Please check your email for reset instructions.",
    options: [
      { text: "I didn't receive the email", nextId: "no_email" },
      { text: "Email went to spam", nextId: "spam_check" },
      { text: "Try again", nextId: "password_reset" },
      { text: "Contact support", nextId: "contact" }
    ]
  },
  contact: {
    id: 'contact',
    message: "I'll connect you with our support team. They'll be able to provide personalized assistance.",
    options: [
      { text: "Start over", nextId: "start" },
      { text: "Back to previous question", nextId: "start" }
    ]
  }
};

// Helper function to get script by ID
export const getScriptById = (id) => {
  return chatbotScript[id] || chatbotScript.start;
};
