const config = {
  // ============================================
  // BASIC INFORMATION
  // ============================================

  name: "Ayush Singh Ghatal",
  title: "ECE Undergrad",
  bio: "I am currently pursuing B.Tech in Electronics and Communication Engineering from GBPIET Pauri India.",
  photo: "avatar.png",

  // ============================================
  // CONTACT & SOCIAL LINKS
  // ============================================

  email: "ayushghatal@gmail.com",
  website: "ayushghatal8@gmail.com",
  linkedin: "linkedin.com/in/ayushsinghghatal",
  github: "github.com/ayushghatal",
  twitter: "x.com/ayushghatal8",

  // ============================================
  // SECTIONS (home page)
  // ============================================
  // Projects here are just the home page cards (name, description, link).
  // For the full project detail pages, edit projects-data.js instead.
  // For journal posts, edit journal-data.js.

  sections: [
    // -------------------- PROJECTS --------------------
    {
      title: "Projects",
      type: "projects",
      items: [
        {
          name: "2D Ray Casting",
          description:
            "Implementation of ray casting in 2D with a light source and an object. Made with SDL in C.",
          link: "https://github.com/ayushghatal/2D-Ray-Casting",
        },
        // Add more projects here (keep projects-data.js in sync!)
      ],
    },

    // -------------------- SKILLS --------------------
    /*{
      title: "Skills",
      type: "skills",
      items: [
        "Git",
        "GitHub",
        "Matplotlib",
        "Numpy",
        "Python",
        "C Programming",
        "Canva",
      ],
    },*/

    // -------------------- CERTIFICATIONS --------------------
    {
      title: "Certifications",
      type: "experience",
      items: [
        {
          role: "Artificial Intelligence Fundamentals",
          organization: "IBM",
          period: "August - 2025",
          description: "",
        },
        {
          role: "Python",
          organization: "Kaggle",
          period: "August - 2025",
          description: "",
        },
      ],
    },

    // -------------------- EDUCATION --------------------
    /*{
      title: "Education",
      type: "experience",
      items: [
        {
          role: "B.Tech in Electronics and Communication Engineering",
          organization: "GBPIET Pauri",
          period: "Aug 2025 - Present",
          description: "",
        },
        {
          role: "High School",
          organization: "GNFCS Mussoorie",
          period: "Apr - 2023",
          description: "",
        },
      ],
    },*/
  ],
};
