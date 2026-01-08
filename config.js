const portfolio = {
  // ============================================
  // BASIC INFORMATION
  // ============================================

  // Your name
  name: "Jane Doe",

  // Your job title or role
  title: "Product Designer",

  // A short bio about yourself (2-3 sentences)
  bio: "I design digital products that people love to use. Focused on creating simple, intuitive experiences.",

  // Photo: Put your image URL here, or leave as "placeholder" to show initials
  photo: "placeholder",

  // ============================================
  // CONTACT & SOCIAL LINKS
  // ============================================
  // Fill in what you use, leave blank ("") for ones you don't

  email: "jane@example.com",
  website: "janedoe.com",
  linkedin: "linkedin.com/in/janedoe",
  github: "github.com/janedoe",
  twitter: "twitter.com/janedoe",

  // ============================================
  // SECTIONS
  // ============================================
  // Add, remove, or reorder these sections however you want!
  // Just copy-paste a section block to add more

  sections: [
    // -------------------- PROJECTS --------------------
    {
      title: "Projects", // Change this to whatever you want
      type: "projects",
      items: [
        {
          name: "E-commerce App",
          description:
            "A mobile shopping experience with focus on speed and simplicity.",
          link: "https://example.com/project1", // optional
        },
        {
          name: "Dashboard Design",
          description:
            "Analytics dashboard for tracking business metrics in real-time.",
          link: "https://example.com/project2",
        },
        {
          name: "Brand Identity",
          description:
            "Complete visual identity system for a sustainable fashion brand.",
          link: "https://example.com/project3",
        },
        // Add more projects by copying the block above
      ],
    },

    // -------------------- EXPERIENCE --------------------
    {
      title: "Experience",
      type: "experience",
      items: [
        {
          role: "Senior Product Designer",
          organization: "Tech Company Inc",
          period: "2022 - Present",
          description:
            "Leading design for core product features and design system.", // optional
        },
        {
          role: "Product Designer",
          organization: "Startup Labs",
          period: "2020 - 2022",
          description:
            "Designed mobile and web experiences from concept to launch.",
        },
        // Add more experience by copying the block above
      ],
    },

    // -------------------- SKILLS --------------------
    {
      title: "Skills",
      type: "skills",
      items: [
        "Product Design",
        "User Research",
        "Prototyping",
        "Design Systems",
        "Figma, Sketch",
        "HTML/CSS",
        // Add more skills - just add a line with "Skill name",
      ],
    },

    // -------------------- PUBLICATIONS --------------------
    {
      title: "Publications",
      type: "publications",
      items: [
        {
          title: "The Future of Design Systems",
          publisher: "Design Magazine",
          year: "2023",
          link: "https://example.com/article1", // optional
        },
        {
          title: "Accessible UI Patterns",
          publisher: "UX Collective",
          year: "2022",
          link: "https://example.com/article2",
        },
        // Add more publications by copying the block above
      ],
    },

    // ==========================================
    // Want to add another section? Just copy one of the blocks above!
    // Want to remove a section? Delete the entire block!
    // Want to reorder? Cut and paste the blocks in the order you want!
    // ==========================================
  ],
};

// ============================================
// QUICK TIPS:
// ============================================
// 1. Don't have publications? Just delete that entire section block
// 2. Want projects first? Move that block to the top
// 3. Want multiple project sections? Copy the projects block and change the title
// 4. Make sure to keep all the commas between items!
// 5. Text in "quotes" - keep the quotes
// ============================================
