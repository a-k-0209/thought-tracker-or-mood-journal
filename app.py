from flask import Flask, render_template, request, redirect, jsonify, session
import json
import os
import re
from datetime import datetime, timedelta
from collections import Counter
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'

DATA_FILE = "data.json"

# Enhanced keyword-to-tag mapping with more categories and context
KEYWORDS_TO_TAGS = {
    # Work & Professional
    "project": "Work",
    "deadline": "Urgent",
    "meeting": "Work",
    "presentation": "Work",
    "report": "Work",
    "client": "Work",
    "boss": "Work",
    "colleague": "Work",
    "interview": "Work",
    "resume": "Work",
    "promotion": "Work",
    "salary": "Work",
    
    # Urgent & Time-sensitive
    "urgent": "Urgent",
    "asap": "Urgent",
    "emergency": "Urgent",
    "deadline": "Urgent",
    "due": "Urgent",
    "today": "Urgent",
    "tomorrow": "Urgent",
    "immediate": "Urgent",
    
    # Personal Growth & Learning
    "learn": "Personal Growth",
    "study": "Personal Growth",
    "course": "Personal Growth",
    "book": "Personal Growth",
    "skill": "Personal Growth",
    "improve": "Personal Growth",
    "practice": "Personal Growth",
    "tutorial": "Personal Growth",
    "workshop": "Personal Growth",
    "certification": "Personal Growth",
    
    # Ideas & Creativity
    "idea": "Idea",
    "creative": "Idea",
    "inspiration": "Idea",
    "brainstorm": "Idea",
    "concept": "Idea",
    "innovation": "Idea",
    "design": "Idea",
    "art": "Idea",
    "write": "Idea",
    "story": "Idea",
    
    # Tasks & To-Dos
    "task": "To-Do",
    "todo": "To-Do",
    "checklist": "To-Do",
    "complete": "To-Do",
    "finish": "To-Do",
    "done": "To-Do",
    "pending": "To-Do",
    "action": "To-Do",
    
    # Personal & Life
    "family": "Personal",
    "friend": "Personal",
    "birthday": "Personal",
    "anniversary": "Personal",
    "party": "Personal",
    "celebration": "Personal",
    "vacation": "Personal",
    "travel": "Personal",
    "hobby": "Personal",
    "exercise": "Personal",
    "health": "Personal",
    "fitness": "Personal",
    "gym": "Personal",
    "workout": "Personal",
    
    # Shopping & Purchases
    "buy": "Shopping",
    "purchase": "Shopping",
    "order": "Shopping",
    "shopping": "Shopping",
    "gift": "Shopping",
    "amazon": "Shopping",
    "online": "Shopping",
    "store": "Shopping",
    "price": "Shopping",
    "sale": "Shopping",
    
    # Reminders & Calls
    "call": "Reminder",
    "phone": "Reminder",
    "text": "Reminder",
    "message": "Reminder",
    "appointment": "Reminder",
    "schedule": "Reminder",
    "reminder": "Reminder",
    "remember": "Reminder",
    "contact": "Reminder",
    
    # Health & Wellness
    "doctor": "Health",
    "medical": "Health",
    "appointment": "Health",
    "medicine": "Health",
    "symptom": "Health",
    "pain": "Health",
    "therapy": "Health",
    "diet": "Health",
    "nutrition": "Health",
    
    # Finance
    "money": "Finance",
    "bill": "Finance",
    "payment": "Finance",
    "budget": "Finance",
    "expense": "Finance",
    "investment": "Finance",
    "bank": "Finance",
    "credit": "Finance",
    "debit": "Finance",
    "savings": "Finance",
    
    # Technology
    "computer": "Tech",
    "software": "Tech",
    "app": "Tech",
    "website": "Tech",
    "code": "Tech",
    "programming": "Tech",
    "update": "Tech",
    "install": "Tech",
    "backup": "Tech",
    "password": "Tech",
    
    # Home & Maintenance
    "home": "Home",
    "house": "Home",
    "repair": "Home",
    "maintenance": "Home",
    "cleaning": "Home",
    "laundry": "Home",
    "garden": "Home",
    "furniture": "Home",
    "decor": "Home"
}

# Mood indicators for sentiment analysis
MOOD_INDICATORS = {
    "happy": "😊",
    "excited": "🎉",
    "sad": "😢",
    "angry": "😠",
    "stressed": "😰",
    "tired": "😴",
    "confused": "😕",
    "surprised": "😲",
    "love": "❤️",
    "laugh": "😂",
    "cool": "😎",
    "wow": "🤩"
}

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_data(data):
    with open(DATA_FILE, "w", encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def enhanced_auto_tag(text):
    """Enhanced tagging with multiple categories and sentiment analysis"""
    tags = set()
    mood = None
    
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Check for mood indicators
    for mood_word, emoji in MOOD_INDICATORS.items():
        if mood_word in text_lower:
            mood = emoji
            break
    
    # Enhanced keyword matching with context
    for keyword, tag in KEYWORDS_TO_TAGS.items():
        # Use word boundaries for more accurate matching
        pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
        if re.search(pattern, text_lower):
            tags.add(tag)
    
    # Add priority tags based on urgency words
    urgency_words = ['urgent', 'asap', 'emergency', 'critical', 'immediate']
    if any(word in text_lower for word in urgency_words):
        tags.add("High Priority")
    
    # Add time-based tags
    time_words = ['today', 'tomorrow', 'this week', 'next week']
    if any(word in text_lower for word in time_words):
        tags.add("Time-sensitive")
    
    # Default tag if no specific tags found
    if not tags:
        tags.add("General")
    
    return list(tags), mood

def get_statistics(data):
    """Generate statistics from the data"""
    if not data:
        return {}
    
    stats = {
        'total_entries': len(data),
        'tags_count': Counter(),
        'recent_entries': 0,
        'mood_distribution': Counter(),
        'daily_activity': Counter()
    }
    
    # Calculate statistics
    for entry in data:
        # Count tags
        for tag in entry.get('tags', []):
            stats['tags_count'][tag] += 1
        
        # Count recent entries (last 7 days)
        entry_date = datetime.strptime(entry['timestamp'], "%Y-%m-%d %H:%M")
        if entry_date > datetime.now() - timedelta(days=7):
            stats['recent_entries'] += 1
        
        # Count moods
        if 'mood' in entry and entry['mood']:
            stats['mood_distribution'][entry['mood']] += 1
        
        # Daily activity
        date_str = entry_date.strftime("%Y-%m-%d")
        stats['daily_activity'][date_str] += 1
    
    return stats

@app.route("/", methods=["GET", "POST"])
def index():
    data = load_data()
    
    if request.method == "POST":
        text = request.form.get("thought")
        if text.strip():
            tags, mood = enhanced_auto_tag(text)
            entry = {
                "id": len(data) + 1,
                "text": text,
                "tags": tags,
                "mood": mood,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "likes": 0
            }
            data.append(entry)
            save_data(data)
        return redirect("/")
    
    # Get filter parameters
    search_query = request.args.get('search', '').lower()
    tag_filter = request.args.get('tag', '')
    mood_filter = request.args.get('mood', '')
    
    # Filter data
    filtered_data = data
    if search_query:
        filtered_data = [entry for entry in data if search_query in entry['text'].lower()]
    if tag_filter:
        filtered_data = [entry for entry in filtered_data if tag_filter in entry.get('tags', [])]
    if mood_filter:
        filtered_data = [entry for entry in filtered_data if entry.get('mood') == mood_filter]
    
    # Group entries by tag
    grouped = {}
    for entry in reversed(filtered_data):  # Show latest first
        for tag in entry.get("tags", []):
            if tag not in grouped:
                grouped[tag] = []
            grouped[tag].append(entry)
    
    # Get statistics
    stats = get_statistics(data)
    
    # Get all unique tags and moods for filters
    all_tags = set()
    all_moods = set()
    for entry in data:
        all_tags.update(entry.get('tags', []))
        if entry.get('mood'):
            all_moods.add(entry['mood'])
    
    return render_template("index.html", 
                         grouped=grouped, 
                         stats=stats,
                         all_tags=sorted(all_tags),
                         all_moods=sorted(all_moods),
                         search_query=search_query,
                         tag_filter=tag_filter,
                         mood_filter=mood_filter)

@app.route("/like/<int:entry_id>", methods=["POST"])
def like_entry(entry_id):
    data = load_data()
    for entry in data:
        if entry.get('id') == entry_id:
            entry['likes'] = entry.get('likes', 0) + 1
            break
    save_data(data)
    return jsonify({"likes": entry.get('likes', 0)})

@app.route("/delete/<int:entry_id>", methods=["POST"])
def delete_entry(entry_id):
    data = load_data()
    data = [entry for entry in data if entry.get('id') != entry_id]
    save_data(data)
    return redirect("/")

@app.route("/edit/<int:entry_id>", methods=["POST"])
def edit_entry(entry_id):
    data = load_data()
    new_text = request.form.get('text', '').strip()
    
    for entry in data:
        if entry.get('id') == entry_id:
            if new_text:
                entry['text'] = new_text
                tags, mood = enhanced_auto_tag(new_text)
                entry['tags'] = tags
                entry['mood'] = mood
                entry['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M")
            break
    
    save_data(data)
    return redirect("/")

@app.route("/stats")
def stats():
    data = load_data()
    stats = get_statistics(data)
    return render_template("stats.html", stats=stats)

@app.route("/api/random-quote")
def random_quote():
    quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Life is what happens when you're busy making other plans. - John Lennon",
        "Success is not final, failure is not fatal. - Winston Churchill",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "The best way to predict the future is to create it. - Peter Drucker",
        "Believe you can and you're halfway there. - Theodore Roosevelt",
        "It always seems impossible until it's done. - Nelson Mandela"
    ]
    return jsonify({"quote": random.choice(quotes)})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000) 