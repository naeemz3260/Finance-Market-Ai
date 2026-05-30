from flask import Flask, render_template, jsonify
import json
import os

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

# -------------------------
# Home Route
# -------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -------------------------
# API Route
# -------------------------
@app.route("/data")
def data():
    try:
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, "../data/prices.json")

        with open(file_path, "r") as file:
            prices = json.load(file)

        return jsonify(prices)

    except FileNotFoundError:
        return jsonify({"error": "prices.json not found"}), 404

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 500


# -------------------------
# Health Check Route
# -------------------------
@app.route("/status")
def status():
    return jsonify({
        "status": "running",
        "app": "Finance Market AI"
    })


# -------------------------
# Vercel Entry Point
# -------------------------
app = app


# -------------------------
# Run Locally
# -------------------------
if __name__ == "__main__":
    print("🚀 Starting Finance Market AI...")
    app.run(host="0.0.0.0", port=5000, debug=True)
