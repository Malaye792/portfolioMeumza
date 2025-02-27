import tkinter as tk
from tkinter import messagebox

def create_imc_interface():
    """Créer l'interface pour le calcul de l'IMC"""
    imc_window = tk.Tk()
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

    imc_window.mainloop()

if __name__ == "__main__":
    create_imc_interface()
