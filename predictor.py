from textblob import TextBlob

def analyze_sentiment(articles):
    results = []
    for article in articles:
        text = article["title"] + " " + str(article["description"])
        blob = TextBlob(text)
        score = blob.sentiment.polarity
        confidence = abs(round(score * 100, 1))

        if score > 0.1:
            sentiment = "Positive 📈"
            risk = "Low Risk 🟢"
        elif score < -0.1:
            sentiment = "Negative 📉"
            risk = "High Risk 🔴"
        else:
            sentiment = "Neutral ➡️"
            risk = "Medium Risk 🟡"

        results.append({
            "title": article["title"],
            "sentiment": sentiment,
            "score": round(score, 2),
            "confidence": f"{confidence}%",
            "risk": risk
        })
    return results

def get_overall_sentiment(results):
    scores = [r["score"] for r in results]
    avg = sum(scores) / len(scores)

    if avg > 0.1:
        overall = "🐂 BULLISH — Market looks Positive!"
    elif avg < -0.1:
        overall = "🐻 BEARISH — Market looks Negative!"
    else:
        overall = "😐 NEUTRAL — Market is Stable"

    return overall, round(avg, 2)

if __name__ == "__main__":
    from scraper import get_stock_news
    articles = get_stock_news("Apple")
    results = analyze_sentiment(articles)

    for r in results:
        print(r["title"])
        print(f"Sentiment: {r['sentiment']}")
        print(f"Confidence: {r['confidence']}")
        print(f"Risk: {r['risk']}")
        print("---")

    overall, avg_score = get_overall_sentiment(results)
    print(f"\n📊 OVERALL: {overall}")
    print(f"Average Score: {avg_score}")