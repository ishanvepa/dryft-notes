#intialize flask app and rest endpoints
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"])

@app.route('/')
def home():
    return jsonify({"message": "Hello, world!"})

@app.route('/new-note', methods=['POST'])
def r_new_note():    
    return jsonify({"message": "New note created"})

@app.route('/delete-note', methods=['GET'])
def r_delete_note():
    return jsonify({"message": "Note deleted"})





if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)