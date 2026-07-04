// Add or edit projects here.
// `featured: true` puts a project on the homepage. Every project (featured
// or not) shows up on the /projects page, so mark 2-3 as featured and leave
// the rest false — they're still visible, just via "View all projects".
// `link` can point to GitHub, a demo, or a write-up on this site (e.g. "/writing/my-post").
export const projects = [
  {
    title: "FPGA Digital Filter + STM32 SPI Interface",
    description:
      "An FPGA-based digital filter (simulated in Icarus Verilog / GTKWave) controlled over SPI by an STM32G0 running bare-metal firmware.",
    tags: ["FPGA", "Verilog", "STM32", "SPI"],
    link: "#",
    featured: true,
  },
  {
    title: "Bare-Metal Debug UART Library",
    description:
      "A self-contained UART debug library for STM32G0, written at the register level without HAL — clock tree setup, USART2, and NVIC configured by hand.",
    tags: ["STM32", "Embedded C", "Bare-metal"],
    link: "#",
    featured: true,
  },
  {
    title: "Project Three",
    description: "Short one-line description of what this project does and why you built it.",
    tags: ["Tag1", "Tag2"],
    link: "#",
    featured: false,
  },
];
