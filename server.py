from flask import Flask, request, jsonify
import psycopg2
import os

app = Flask(__name__)

# Use environment variables for database connection
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'postgres'),
        database=os.getenv('DB_NAME', 'app'),
        user=os.getenv('DB_USER', 'posgres'),
        password=os.getenv('DB_PASSWORD', 'posgres'),
        port=os.getenv('DB_PORT', '5432')
    )
    return conn

# POST request to create a new appointment
@app.route('/appointments', methods=['POST'])
def create_appointment():
    data = request.json

    # Extract required fields
    name = data.get('name')
    telephone = data.get('telephone')
    date = data.get('date')
    time = data.get('time')

    # Input validation
    if not all([name, telephone, date, time]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Establish a new connection for the request
        conn = get_db_connection()
        cur = conn.cursor()

        # Insert into database
        cur.execute(
            'INSERT INTO appointments (name, telephone, date, time) VALUES (%s, %s, %s, %s) RETURNING id',
            (name, telephone, date, time)
        )
        appointment_id = cur.fetchone()[0]
        conn.commit()
        
        # Close connection and cursor
        cur.close()
        conn.close()

        # Return the created appointment's ID
        return jsonify({'id': appointment_id, 'name': name, 'date': date, 'time': time}), 201

    except Exception as e:
        # Handle database errors
        return jsonify({'error': str(e)}), 500

# GET request to retrieve all appointments
@app.route('/appointments', methods=['GET'])
def get_appointments():
    try:
        # Establish a new connection for the request
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch all appointments from the database
        cur.execute("SELECT name, telephone, date, time FROM appointments;")
        appointments = cur.fetchall()

        # Close connection and cursor
        cur.close()
        conn.close()

        # Prepare the result as a JSON list
        appointments_list = [
            {"name": app[0], "telephone": app[1], "date": app[2], "time": app[3]} 
            for app in appointments
        ]

        return jsonify(appointments_list)

    except Exception as e:
        # Handle database errors
        return jsonify({'error': str(e)}), 500

# DELETE request to remove an appointment by ID
@app.route('/appointments/<int:id>', methods=['DELETE'])
def delete_appointment(id):
    app.logger.info(f"Attempting to delete appointment with ID: {id}")
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('DELETE FROM appointments WHERE id = %s RETURNING id;', (id,))
                deleted_id = cur.fetchone()  # Returns None if no rows were deleted

                if not deleted_id:
                    return jsonify({'error': f'Appointment with ID {id} not found'}), 404

                conn.commit()

        return jsonify({'message': f'Appointment with ID {id} deleted successfully'}), 200

    except Exception as e:
        app.logger.error(f"Error deleting appointment: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure Flask runs on port 5000 and is accessible externally
    app.run(debug=True, host='0.0.0.0', port=5000)
