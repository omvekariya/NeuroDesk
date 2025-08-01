from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "Hello, Flask + LLM!"

@app.route("/llm", methods=["POST"])
def llm_task():
    data = request.get_json()
    prompt = data.get("prompt", "")
    # Replace this with an actual LLM call
    result = fake_llm_response(prompt)
    return jsonify({"response": result})

def fake_llm_response(prompt):
    return f"You said: {prompt}"

if __name__ == "__main__":
    app.run(debug=True)
