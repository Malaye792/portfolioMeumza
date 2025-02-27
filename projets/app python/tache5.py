import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import matplotlib.pyplot as plt
from collections import Counter
import fitz  # PyMuPDF for PDF processing
import re

# ==== Tâche 1 : Calcul et interprétation de l'IMC ====
def create_imc_interface(root):
    """Créer l'interface pour le calcul de l'IMC"""
    imc_window = tk.Toplevel(root)
    imc_window.title("Calcul de l'IMC")
    imc_window.geometry("400x300")
    imc_window.configure(bg="#FFDDC1")

    tk.Label(imc_window, text="Entrez votre poids (kg) :", bg="#FFDDC1", font=("Arial", 12)).pack(pady=5)
    weight_entry = tk.Entry(imc_window)
    weight_entry.pack(pady=5)

    tk.Label(imc_window, text="Entrez votre taille (m) :", bg="#FFDDC1", font=("Arial", 12)).pack(pady=5)
    height_entry = tk.Entry(imc_window)
    height_entry.pack(pady=5)

    def calculate_imc():
        try:
            weight = float(weight_entry.get())
            height = float(height_entry.get())
            imc = weight / (height ** 2)
            category = interpret_imc(imc)
            result_label.config(text=f"Votre IMC est {imc:.2f}. Catégorie : {category}")
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides pour le poids et la taille.")

    def interpret_imc(imc):
        if imc < 18.5:
            return "Insuffisance pondérale"
        elif imc < 25:
            return "Poids normal"
        elif imc < 30:
            return "Surpoids"
        else:
            return "Obésité"

    tk.Button(imc_window, text="Calculer l'IMC", command=calculate_imc, bg="#FF5733", fg="white", font=("Arial", 12)).pack(pady=10)
    result_label = tk.Label(imc_window, text="", bg="#FFDDC1", font=("Arial", 12))
    result_label.pack(pady=10)

# ==== Tâche 2 : Analyse de texte collé ====
def create_text_analysis_interface(root):
    """Créer l'interface pour l'analyse de texte"""
    text_window = tk.Toplevel(root)
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

# ==== Tâche 3 : Analyse de fichier PDF ====
def create_pdf_analysis_interface(root):
    """Créer l'interface pour l'analyse de fichier PDF"""
    pdf_window = tk.Toplevel(root)
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

# ==== Menu principal pour accéder aux tâches ====
def main():
    root = tk.Tk()
    root.title("Application Intégrée - UNIPRO 2025")
    root.geometry("400x300")

    tk.Label(root, text="Choisissez une tâche à exécuter :", font=("Arial", 14)).pack(pady=20)
    tk.Button(root, text="Calcul de l'IMC", command=lambda: create_imc_interface(root), bg="#FF5733", fg="white", font=("Arial", 12)).pack(pady=10)
    tk.Button(root, text="Analyse de Texte", command=lambda: create_text_analysis_interface(root), bg="#117864", fg="white", font=("Arial", 12)).pack(pady=10)
    tk.Button(root, text="Analyse de PDF", command=lambda: create_pdf_analysis_interface(root), bg="#2E86C1", fg="white", font=("Arial", 12)).pack(pady=10)

    root.mainloop()

if __name__ == "__main__":
    main()
