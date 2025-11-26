import requests

token = "sk-Jw0mXI7PMgeFYVCW8e8PKw"
BASE_URL = "https://llm.t1v.scibox.tech/v1/chat/completions"
MODEL = "qwen3-32b-awq"

messages = [
    {"role": "user", "content": "Привет! Проверка подключения к SciBox."}
]

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

data = {
    "model": MODEL,
    "messages": messages,
    "temperature": 0.5,
    "max_tokens": 200
}

# === 5. ОТПРАВКА ЗАПРОСА ===
response = requests.post(BASE_URL, headers=headers, json=data)

# === 6. ВЫВОД ОТВЕТА ===
if response.status_code == 200:
    result = response.json()
    print("\nОтвет от модели:")
    print(result["choices"][0]["message"]["content"])
else:
    print("\nОшибка!")
    print("Статус:", response.status_code)
    print("Текст:", response.text)
