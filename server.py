from flask import Flask, request, jsonify
import psycopg2
import os

app = Flask(__name__)

conn = psycopg2.connect(user="posgres",
                                password="posgres",
                                host="postgres",
                                port="5432",
                                database="app")

@app.route('/appointments', methods=['POST'])
def create_appointment():
    data = request.json
    name = data.get('name')
    telephone = data.get('telephone')
    date = data.get('date')
    time = data.get('time')

    with conn.cursor() as cur:
        cur.execute(
            'INSERT INTO appointments (name, telephone, date, time) VALUES (%s, %s, %s, %s) RETURNING id',
            (name, telephone, date, time)
        )
        appointment_id = cur.fetchone()[0]
        conn.commit()

    return jsonify({'id': appointment_id, 'name': name, 'date': date, 'time': time}), 201
def get_db_connection():
    conn = psycopg2.connect(
        host="postgres",
        database="app",
        user="posgres",
        password="posgres"
    )
    return conn

# GET-запрос для получения всех записей на прием
@app.route('/appointments', methods=['GET'])
def get_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, telephone, date, time FROM appointments;")
    appointments = cursor.fetchall()
    cursor.close()
    conn.close()

    # Преобразуем результат в JSON
    appointments_list = [
        {"name": app[0], "telephone": app[1], "date": app[2], "time": app[3]} 
        for app in appointments
    ]
    return jsonify(appointments_list)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
