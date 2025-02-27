import tkinter as tk
from tkinter import messagebox
from collections import Counter
import re

def create_text_analysis_interface():
    """Créer l'interface pour l'analyse de texte"""
    text_window = tk.Tk()
    text_window.title("Analyse de Texte")
    text_window.geometry("600x400")
    text_window.configure(bg="#D5F5E3")

    tk.Label(text_window, text="Collez votre texte ci-dessous :", bg="#D5F5E3", font=("Arial", 12)).pack(pady=5)
    text_area = tk.Text(text_window, height=15, wrap="word", bg="#E8F8F5", font=("Arial", 10))
    text_area.pack(pady=5, padx=10, fill="both", expand=True)

    def analyze_text():
        text = text_area.get("1.0", "end").strip()
        if not text:
            messagebox.showwarning("Attention", "Veuillez entrer un texte.")
            return

        words = re.findall(r"\b\w{5,}\b", text)
        word_count = Counter(words)
        total_words = sum(word_count.values())

        result = "Mot\t\tFréquence (%)\n" + "="*30 + "\n"
        for word, count in word_count.items():
            frequency = (count / total_words) * 100
            result += f"{word}\t\t{frequency:.2f}%\n"

        result_text.config(state="normal")
        result_text.delete("1.0", "end")
        result_text.insert("1.0", result)
        result_text.config(state="disabled")

    tk.Button(text_window, text="Analyser le texte", command=analyze_text, bg="#117864", fg="white", font=("Arial", 12)).pack(pady=10)
    result_text = tk.Text(text_window, height=10, state="disabled", bg="#E8F8F5", font=("Arial", 10))
    result_text.pack(pady=5, padx=10, fill="both", expand=True)

    text_window.mainloop()

if __name__ == "__main__":
    create_text_analysis_interface()
