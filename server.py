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

if __name__ == '__main__':
    app.run(debug=True)
