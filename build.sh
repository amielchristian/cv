#!/usr/bin/env bash
set -euo pipefail

pdflatex -interaction=nonstopmode "Mala-ay - CV.tex"

TS=$(date +"%Y-%m-%d_%H-%M-%S")
PDF_PATH="backups/Mala-ay - CV_$TS.pdf"
mv "Mala-ay - CV.pdf" "$PDF_PATH"

rm "Mala-ay - CV.aux" "Mala-ay - CV.out" "Mala-ay - CV.log"