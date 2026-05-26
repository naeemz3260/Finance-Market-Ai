import requests
from datetime import datetime, timezone

def get_stock_news(company_name):
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": company_name,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": 10,
        "apiKey": "1c3273daf724459cb32ab75288361b32"
    }
    response = requests.get(url, params=params)
    data = response.json()

    articles = []
    for article in data["articles"][:10]:
        articles.append({
            "title": article["title"],
            "description": article["description"],
            "url": article["url"],
            "publishedAt": article["publishedAt"],
            "source": article["source"]["name"]
        })
    return articles

def get_multiple_companies(companies):
    all_data = {}
    for company in companies:
        print(f"Fetching news for: {company}")
        all_data[company] = get_stock_news(company)
    return all_data

if __name__ == "__main__":
    companies = ["Apple", "Tesla", "Microsoft"]
    data = get_multiple_companies(companies)
    for company, articles in data.items():
        print(f"\n=== {company} ===")
        for a in articles[:3]:
            print(a["title"])
            print(a["source"])
            print("---")