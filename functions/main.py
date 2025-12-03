"""
Firebase Cloud Functions for Budget Management System
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Firebase 초기화
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

db = firestore.client()
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    """예산 데이터 조회"""
    try:
        budgets_ref = db.collection('budgets')
        budgets = budgets_ref.stream()
        budgets_list = [doc.to_dict() for doc in budgets]
        return jsonify(budgets_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['POST'])
def create_budget():
    """예산 데이터 생성"""
    try:
        data = request.json
        budgets_ref = db.collection('budgets')
        doc_ref = budgets_ref.add(data)
        return jsonify({'id': doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

