from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route('/api/payment', methods=['POST'])
def process_data():
    """
    Simula el estado de un pago basándose en la información del estudiante.
    
    Recibe un JSON con:
    - id (str): ID del estudiante.
    - amount_due (float): Monto total que debe el estudiante.
    - amount_paid (float): Monto que ya pagó el estudiante.
    - late_payment (bool): Indica si el pago es tardío.
    
    Devuelve un JSON con el ID, el monto total adeudado, 
    el nuevo monto pagado simulado y un booleano que indica
    si el pago fue tardío, con una pequeña probabilidad de
    cambiar de False a True.
    """
    data = request.json
    student_id = data.get("id")
    amount_due = data.get("amount_due")
    amount_paid = data.get("amount_paid")
    late_payment = data.get("late_payment")
    
    # Simulación de "late_payment" (pago tardío)
    # Si el valor inicial es False, hay una pequeña probabilidad de que cambie a True.
    if not late_payment:
        # 20% de probabilidad de que el pago se considere tardío de forma aleatoria.
        if random.random() < 0.20:
            late_payment = True

    # Simulación de "amount_paid" (monto pagado)
    # Si el pago no está completo, simula que se paga una porción aleatoria
    if amount_paid < amount_due:
        amount_to_pay = amount_due - amount_paid
        simulated_payment = random.uniform(0, amount_to_pay)
        new_amount_paid = amount_paid + simulated_payment
    else:
        # Si ya se pagó la cantidad total o más, no cambia el monto.
        new_amount_paid = amount_paid

    # Simulación de multa por pago tardío
    if late_payment:
        # Simula una multa del 5% si el pago es tardío.
        multa = amount_due * 0.05
        amount_due = amount_due + multa

    return jsonify({
        "id": student_id,
        "amount_due": round(amount_due, 2),
        "new_amount_paid": round(new_amount_paid, 2),
        "late_payment": late_payment
    })
        
if __name__=='__main__':
    app.run(port=5001, debug=True)
