import tkinter as tk
from tkinter import filedialog, messagebox
from collections import Counter
import fitz  # PyMuPDF pour extraire le texte des fichiers PDF
import re
import matplotlib.pyplot as plt

def create_pdf_analysis_interface():
    """Créer l'interface pour l'analyse de fichier PDF"""
    pdf_window = tk.Tk()
    pdf_window.title("Analyse de PDF")
    pdf_window.geometry("600x400")
    pdf_window.configure(bg="#D6EAF8")

    tk.Label(pdf_window, text="Analyser un fichier PDF", bg="#D6EAF8", font=("Arial", 12)).pack(pady=10)

    def select_pdf():
        file_path = filedialog.askopenfilename(filetypes=[("Fichiers PDF", "*.pdf")])
        if not file_path:
            return

        try:
            with fitz.open(file_path) as doc:
                text = "".join(page.get_text() for page in doc)

            words = re.findall(r"\b\w{5,}\b", text)
            word_count = Counter(words)
            total_words = sum(word_count.values())

            most_common = word_count.most_common(10)
            result = "Mot\t\tFréquence (%)\n" + "="*30 + "\n"
            for word, count in most_common:
                frequency = (count / total_words) * 100
                result += f"{word}\t\t{frequency:.2f}%\n"

            result_text.config(state="normal")
            result_text.delete("1.0", "end")
            result_text.insert("1.0", result)
            result_text.config(state="disabled")

            plot_graphics(most_common)

        except Exception as e:
            messagebox.showerror("Erreur", f"Impossible d'analyser le fichier PDF : {e}")

    def plot_graphics(data):
        words, counts = zip(*data)
        total = sum(counts)
        percentages = [count / total * 100 for count in counts]

        # Diagramme en barres
        plt.figure(figsize=(10, 5))
        plt.bar(words, percentages, color="skyblue")
        plt.xlabel("Mots")
        plt.ylabel("Fréquence (%)")
        plt.title("Top 10 des mots les plus fréquents")
        plt.show()

        # Diagramme circulaire
        plt.figure(figsize=(8, 8))
        plt.pie(percentages, labels=words, autopct="%1.1f%%", colors=plt.cm.Paired.colors)
        plt.title("Répartition des fréquences des mots")
        plt.show()

    tk.Button(pdf_window, text="Choisir un fichier PDF", command=select_pdf, bg="#2E86C1", fg="white", font=("Arial", 12)).pack(pady=10)
    result_text = tk.Text(pdf_window, height=20, state="disabled", bg="#EBF5FB", font=("Arial", 10))
    result_text.pack(pady=5, padx=10, fill="both", expand=True)

    pdf_window.mainloop()

if __name__ == "__main__":
    create_pdf_analysis_interface()
