const portfolio = {
  // ============================================
  // BASIC INFORMATION
  // ============================================

  // Your name
  name: "Ayush Singh Ghatal",

  // Your job title or role
  title: "ECE Undergrad",

  // A short bio about yourself (2-3 sentences)
  bio: "I am currently pursuing B.Tech in Electronics and Communication Engineering from GBPIET Pauri India.",

  // Photo: Put your image URL here, or leave as "placeholder" to show initials
  photo: "profile.png",

  // ============================================
  // CONTACT & SOCIAL LINKS
  // ============================================
  // Fill in what you use, leave blank ("") for ones you don't

  email: "ayushghatal@gmail.com",
  website: "ayushghatal8@gmail.com",
  linkedin: "linkedin.com/in/ayushsinghghatal",
  github: "github.com/ayushghatal",
  twitter: "x.com/ayushghatal8",

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
          name: "2D Ray Casting",
          description:
            "Implimentation of ray casting in 2D with a light source and a object. Made with SDL in C.",
          link: "https://github.com/ayushghatal/2D-Ray-Casting", // optional
        },
        /*{
          name: "Tetris on 8x8 LED Matrix",
          description:
            "Tetris on MAX7219 8x8 LED Matrix using Arduino UNO.",
          link: "https://github.com/ayushghatal/Tetris-on-8x8-LED-Matrix",
        },*/
        // Add more projects by copying the block above
      ],
    },

    // -------------------- SKILLS --------------------
    {
      title: "Skills",
      type: "skills",
      items: [
        "Git",
        "Git Hub",
        "Matplotlob",
        "Numpy",
        "Python",
        "C Programming",
        "Canva",
        // Add more skills - just add a line with "Skill name",
      ],
    },

    // -------------------- EXPERIENCE --------------------
    {
      title: "Certifications",
      type: "experience",
      items: [
        {
          role: "Artificial Intelligence Fundamentals",
          organization: "IBM",
          period: "August - 2025",
          description:
            "", // optional
        },
        {
          role: "Python",
          organization: "Kaggle",
          period: "August - 2025",
          description:
            "",
        },
        // Add more experience by copying the block above
      ],
    },

    {
      title: "Education",
      type: "experience",
      items: [
        {
          role: "B.Tech in Electronics and Communication Engineering",
          organization: "GBPIET Pauri",
          period: "Aug 2025 - Present",
          description:
            "", // optional
        },
        {
          role: "High School",
          organization: "GNFCS Mussoorie",
          period: "Apr - 2023",
          description:
            "",
        },
        // Add more experience by copying the block above
      ],
    },

    

    // -------------------- PUBLICATIONS --------------------
    /*{
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
    },*/

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
