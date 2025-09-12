export const STARTING_PROMPTS = [
  {
    title: "Creative Writing",
    description: "Spark your imagination",
    prompt: "Write a short story about a time traveler who accidentally changes history."
  },
  {
    title: "Problem Solving",
    description: "Tackle a challenge",
    prompt: "How would you design a system to reduce traffic congestion in a busy city?"
  },
  {
    title: "Learning",
    description: "Expand your knowledge",
    prompt: "Explain the concept of quantum entanglement in simple terms."
  },
  {
    title: "Brainstorming",
    description: "Generate new ideas",
    prompt: "List 5 innovative features for a smart home device of the future."
  }
];

export const COMMUNITY_BOTS = {
  "Data Analyst Pro": {
    initial: "I am Data Analyst Pro, your expert in data analysis. I can help you analyze datasets, create visualizations, and extract meaningful insights. Would you like to start by importing some data or discussing your analysis needs?",
    responses: {
      default: "For data analysis tasks, you can use these commands:\n- /chart - Create visualizations of your data\n- /table - Display and format your data in tables\n- /file - Import or export data files",
      data: "I can help you analyze that data. Would you like to create a visualization, run statistical analysis, or identify patterns?",
      visualization: "I can create various types of visualizations including scatter plots, bar charts, line graphs, and heatmaps. What type would be most helpful for your data?",
      statistics: "I can help with descriptive statistics, hypothesis testing, regression analysis, and more. What specific analysis do you need?"
    }
  },
  "Story Weaver": {
    initial: "Welcome to Story Weaver! I'm here to help you craft engaging narratives and develop rich characters. Shall we begin by brainstorming a story idea or developing a character profile?",
    responses: {
      default: "Let's develop your story! We can:\n- Create character profiles\n- Develop plot outlines\n- Work on world-building\n- Write dialogue\nWhat would you like to focus on?",
      character: "Let's develop this character. Consider their background, motivations, conflicts, and growth arc. What aspect should we explore first?",
      plot: "For plot development, we should consider the inciting incident, rising action, climax, and resolution. Where would you like to start?",
      setting: "Let's build this world. We can explore its history, culture, geography, or social structures. What interests you most?"
    }
  },
  "Health Coach": {
    initial: "Hello! I'm your Health Coach, ready to support your wellness journey. Would you like to start by discussing your health goals, creating a meal plan, or designing a workout routine?",
    responses: {
      default: "I can help you with:\n- Personalized workout plans\n- Nutrition advice\n- Wellness goals\n- Progress tracking\nWhat area would you like to focus on?",
      nutrition: "Let's talk about your nutrition goals. Would you like to focus on meal planning, dietary restrictions, or general nutrition advice?",
      workout: "For your workout plan, we should consider your fitness level, goals, and available equipment. Shall we start with a fitness assessment?",
      goals: "Setting realistic health goals is important. Let's break down your objectives into manageable milestones. What's your primary health goal?"
    }
  },
  "Business Strategist": {
    initial: "Welcome! As your Business Strategist, I'm here to help you develop effective business strategies. Should we begin by analyzing your market position or discussing your business objectives?",
    responses: {
      default: "I can assist with:\n- Market analysis\n- Business planning\n- Competitive strategy\n- Growth opportunities\nWhich area would you like to explore?",
      market: "Let's analyze your market position. We should look at competition, market trends, and customer segments. Where would you like to start?",
      planning: "For business planning, we'll need to consider your objectives, resources, and timeline. What's your primary business goal?",
      strategy: "Strategic planning involves analyzing your strengths, weaknesses, opportunities, and threats. Shall we start with a SWOT analysis?"
    }
  }
};

export const COMMAND_SUGGESTIONS = `Please type / followed by the following commands:
- /code - Write or review code in any programming language
- /image - Generate images based on your descriptions
- /highlight - Highlight and format code snippets
- /chart - Create various types of charts and graphs
- /file - Generate different types of files
- /table - Display and format tabular data`;