import os

file_path = 'public/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Navigation Link
content = content.replace('<a href="bookings.html" class="active">BOOK A GHOST HUNT</a>', 
                          '<a href="booking-events.html" class="active">BOOKING EVENTS</a>')

# 2. Add Hero Button
# Find the hero-actions div and insert the button.
if '<div class="hero-actions">' in content:
    button_html = '                    <a href="booking-events.html" class="button button-primary">BOOK A GHOST HUNT <span>&rarr;</span></a>\n'
    content = content.replace('<div class="hero-actions">', '<div class="hero-actions">\n' + button_html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
