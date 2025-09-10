from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route('/api/payment', methods=['POST'])
def process_data():
    """
    Simula el estado de pagos para una lista de estudiantes.
    
    Recibe un JSON que contiene un array de objetos, donde cada objeto representa
    un estudiante con su ID, monto adeudado, monto pagado e indicador de pago tardío.
    
    Devuelve un JSON que contiene un array de objetos con la información de pago
    actualizada para cada estudiante.
    """
    students_data = request.json
    processed_payments = []

    # Procesa cada estudiante en la lista
    for student in students_data:
        student_id = student.get("student_id")
        amount_due = student.get("amount_due")
        amount_paid = student.get("amount_paid")
        late_payment = student.get("late_payment")
        
        # Simulación de pago tardío
        if not late_payment:
            # 20% de probabilidad de que el pago se considere tardío de forma aleatoria.
            if random.random() < 0.20:
                late_payment = True

        # Simulación de monto pagado
        if amount_paid < amount_due:
            amount_to_pay = amount_due - amount_paid
            simulated_payment = random.uniform(0, amount_to_pay)
            new_amount_paid = amount_paid + simulated_payment
        else:
            new_amount_paid = amount_paid

        # Simulación de multa por pago tardío
        if late_payment:
            multa = amount_due * 0.05
            amount_due += multa

        # Agrega el resultado a la lista de pagos procesados
        processed_payments.append({
            "student_id": student_id,
            "new_amount_due": int(round(amount_due, 2)),
            "new_amount_paid": int(round(new_amount_paid, 2)),
            "new_late_payment": late_payment
        })
    
    return jsonify(processed_payments)
        
if __name__=='__main__':
    app.run(port=5001, debug=True)