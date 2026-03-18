export const DEFAULT_CV = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\geometry{margin=1in}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.5em}

\\titleformat{\\section}{\\large\\bfseries}{\\thesection}{1em}{}
\\titlespacing*{\\section}{0pt}{1.5em}{0.5em}

\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=blue
}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Your Name}} \\\\[0.3em]
  \\texttt{email@example.com} \\quad $|$ \\quad \\url{https://linkedin.com/in/you} \\quad $|$ \\quad \\url{https://github.com/you}
\\end{center}
\\vspace{1em}

\\section*{Experience}
\\begin{itemize}[leftmargin=*]
  \\item \\textbf{Role} at \\textbf{Company} \\hfill 2022--Present
  \\begin{itemize}[nosep]
    \\item Achievement or responsibility.
    \\item Another key contribution.
  \\end{itemize}
  \\item \\textbf{Previous Role} at \\textbf{Previous Company} \\hfill 2020--2022
  \\begin{itemize}[nosep]
    \\item What you accomplished.
  \\end{itemize}
\\end{itemize}

\\section*{Education}
\\begin{itemize}[leftmargin=*]
  \\item \\textbf{Degree} in \\textbf{Major}, University Name \\hfill Year
\\end{itemize}

\\section*{Skills}
\\textbf{Technical:} LaTeX, TypeScript, React, Node.js \\\\
\\textbf{Tools:} Git, Docker, VS Code

\\end{document}
`
