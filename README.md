Thanks for the correction! Here's your fully updated `README.md` with the correct GitHub profile:

---

# Thought Tracker – A Smart, Minimal Thought Journal

**Thought Tracker** is a clean, web-based journaling app that lets you quickly log thoughts and reflections, then intelligently tags and analyzes them. It's built for people who want to track their ideas, moods, and mental patterns — all in one place.

---

## 🚀 Features

* Add and edit personal thoughts
* Auto-tagging using keyword-based NLP
* Mood detection via sentiment keywords
* Organizes entries by category (Work, Health, Personal Growth, etc.)
* Real-time search and filtering
* Like system for marking favorite entries
* Analytics dashboard with mood and category insights
* Timestamps for every entry
* Persistent local storage (JSON)
* Modern, responsive UI with glassmorphism effects

---

## 🛠️ Tech Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| Frontend      | HTML, CSS, JavaScript                     |
| Backend       | Python, Flask                             |
| Storage       | JSON file                                 |
| Templating    | Jinja2                                    |
| NLP           | Rule-based keyword tagging & mood mapping |
| Visualization | Chart.js                                  |

---

## 🧠 How Auto-Tagging Works

Thought Tracker uses a basic NLP pipeline powered by Python dictionaries. Keywords in your entries are mapped to categories and moods. For example:

* "project", "meeting" → Work
* "deadline", "emergency" → Urgent
* "run", "health" → Health
* "learn", "goal" → Personal Growth

If no match is found, the entry is tagged as **General**.

---

## 📦 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/a-k-0209/thought-tracker.git
cd thought-tracker
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Run the application**

```bash
python app.py
```

4. **Open in your browser**
   Go to: [http://localhost:5000](http://localhost:5000)

---

## ✅ Future Enhancements

* Export thoughts to Markdown, Notion, or CSV
* Smarter NLP using spaCy or embeddings
* User login and authentication
* Cloud-based storage (PostgreSQL / MongoDB)
* Mobile-first PWA version

---

## 📸 Screenshot

```markdown
[![preview-png.png](https://i.postimg.cc/ydP5nsXy/preview-png.png)](https://postimg.cc/MMndpkLn)
```

---

## 📄 License

This project is open-source under the MIT License.

---

## 🙋‍♀️ Author

**Anika K** – [GitHub, click here](https://github.com/a-k-0209)
Feel free to fork the project or contribute!

---

Let me know if you want this in a file again or help creating your GitHub repo description and tags!
