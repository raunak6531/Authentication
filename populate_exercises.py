from app import get_db_connection
from mysql.connector import Error

def populate_exercises():
    exercises = [
        {
            'title': 'The Web Awakens – Creating Your First HTML Page',
            'question': 'Every adventure begins somewhere. This one begins with your first-ever HTML page. Create a complete HTML document with proper structure and add a main heading.',
            'explanation': '''Every adventure begins somewhere. This one begins with your first-ever HTML page. Let's put it together and start your journey on the web!

Key concepts:
- <!DOCTYPE html> declares the document type as HTML5
- <html> is the root element of the HTML document
- <head> contains metadata and title
- <body> contains the main content of the webpage
- Comments are written with <!-- --> and are ignored by the browser''',
            'starter_code': '''<!DOCTYPE html>
<html>
<head>
    <!-- Add your title here -->
</head>
<body>
    <!-- Add your main heading here -->
</body>
</html>''',
            'sample_solution': '''<!DOCTYPE html> <!-- Declares the document type as HTML5 -->
<html> <!-- Root element of the HTML document -->

<head> <!-- Contains metadata and title -->
  <title>My Web Adventure</title> <!-- Title of the webpage displayed on the browser tab -->
</head>

<body> <!-- The main content of the webpage -->

  <!-- This is how you write a comment in HTML -->
  <!-- Comments are ignored by the browser and used to explain code -->
 <h1>The Journey of HTML Begins</h1> <!-- Main heading for the page -->
</body> <!-- End of body -->
</html> <!-- End of HTML document -->''',
            'difficulty': 'beginner',
            'order_index': 1
        },
        {
            'title': 'Speak Loud and Clear – Meet the Headings!',
            'question': 'Headings are like signboards on the road. They help you organize your ideas and guide your readers. Create headings from big to small (h1 to h6).',
            'explanation': '''Headings are like signboards on the road. They help you organize your ideas and guide your readers. Time to try out headings from big to small.

Key concepts:
- <h1> is the largest heading (main title)
- <h2> is the second largest heading (subheading level 1)
- <h6> is the smallest heading (the smallest whisper)
- Headings help structure your content hierarchically''',
            'starter_code': '''<body>
  <h1>Main Title</h1>
  <!-- Add h2, h3, h4, h5 headings here -->
  <h6>The smallest whisper of a heading</h6>
</body>''',
            'sample_solution': '''<body> <!-- Starts the body where content is displayed -->
  <h1>Main Title</h1> <!-- Largest heading -->
  <h2>Subheading Level 1</h2> <!-- Second largest heading -->
  <h3>Subheading Level 2</h3> <!-- Third largest heading -->
  <h4>Subheading Level 3</h4> <!-- Fourth largest heading -->
  <h5>Subheading Level 4</h5> <!-- Fifth largest heading -->
  <h6>The smallest whisper of a heading</h6> <!-- Smallest heading -->
</body> <!-- Ends the body -->''',
            'difficulty': 'beginner',
            'order_index': 2
        },
        {
            'title': 'The Grocery Scroll – Unleashing Lists',
            'question': 'It\'s time to organize your pantry and cooking steps using lists! Create both unordered and ordered lists for a grocery list and sandwich-making steps.',
            'explanation': '''It's time to organize your pantry and cooking steps using lists! You'll use both unordered and ordered lists to do this.

Key concepts:
- <ul> creates an unordered list with bullet points
- <ol> creates an ordered list with numbers
- <li> creates individual list items
- Lists help organize information in a structured way''',
            'starter_code': '''<body>
  <h2>My Grocery List</h2>
  <ul>
    <li>Milk</li>
    <li>Eggs</li>
    <!-- Add your favorite snack here -->
    <li></li>
  </ul>

  <h2>Steps to Make a Sandwich</h2>
  <ol>
    <!-- Add sandwich-making steps here -->
  </ol>
</body>''',
            'sample_solution': '''<body>

  <h2>My Grocery List</h2> <!-- Heading for the grocery list -->
  <ul> <!-- Unordered list with bullet points -->
    <li>Milk</li>    <!-- First list item -->
    <li>Eggs</li>     <!-- Second list item -->
    <li>Cookies</li> <!-- User's favorite snack -->
  </ul>

  <h2>Steps to Make a Sandwich</h2> <!-- Heading for the step-by-step list -->
  <ol> <!-- Ordered list with numbers -->
    <li>Take two slices of bread</li>
    <li>Spread butter or sauce</li>
    <li>Place your favorite filling</li>
    <li>Put slices together and enjoy!</li>
  </ol>

</body>''',
            'difficulty': 'beginner',
            'order_index': 3
        },
        {
            'title': 'Picture Perfect – Adding an Image',
            'question': 'Images speak louder than text sometimes. Time to decorate your webpage with an image of your favorite thing!',
            'explanation': '''Images speak louder than text sometimes. Time to decorate your webpage with an image of your favorite thing!

Key concepts:
- <img> tag is used to embed images
- src attribute specifies the image source (URL or file path)
- alt attribute provides alternative text for accessibility
- width attribute controls the image size''',
            'starter_code': '''<body>
  <h2>This is My Favorite Animal</h2>

  <!-- Add your image here -->
  <img src="" alt="" width="300">

</body>''',
            'sample_solution': '''<body>

  <h2>This is My Favorite Animal</h2>  <!-- Heading for the image -->

  <img src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300"
       alt="A cute golden retriever dog" width="300">
  <!-- Image of a dog from Unsplash; replace the URL with your own image link or path -->

  <!-- Tip: Replace the src with a local file path or another image URL from the web -->

</body>''',
            'difficulty': 'beginner',
            'order_index': 4
        },
        {
            'title': 'The Great Divide – Sections, Classes & Divs',
            'question': 'Think of your webpage like rooms in a house. Sections and divs help organize each room. Create sections with classes for better organization.',
            'explanation': '''Think of your webpage like rooms in a house. Sections and divs help organize each room.

Key concepts:
- <section> is a semantic element for grouping related content
- <div> is a generic container for styling and layout
- class attribute helps identify and style specific elements
- Semantic HTML improves accessibility and SEO''',
            'starter_code': '''<body>
  <section class="about-me">
    <h2>About Me</h2>
    <!-- Add description here -->
  </section>

  <div class="fun-facts">
    <h3>Fun Facts</h3>
    <ul>
      <!-- Add fun facts here -->
    </ul>
  </div>
</body>''',
            'sample_solution': '''<body>
  <section class="about-me"> <!-- A semantic section for personal info -->
    <h2>About Me</h2> <!-- Section title -->
    <p>I am learning frontend development and loving it!</p> <!-- Description inside the section -->
  </section>

  <div class="fun-facts"> <!-- A generic container for extra content -->
    <h3>Fun Facts</h3> <!-- Heading for fun facts -->
    <ul> <!-- List of fun facts -->
      <li>I can solve a Rubik's Cube</li>
      <li>I love coffee</li>
      <li>I enjoy coding challenges</li> <!-- User's own fact -->
    </ul>
  </div>

</body>''',
            'difficulty': 'beginner',
            'order_index': 5
        },
        {
            'title': 'What is CSS?',
            'question': 'Imagine your website is a plain cake — CSS is the frosting and decorations that make it irresistible! Add global styles to make your webpage visually appealing.',
            'explanation': '''Imagine your website is a plain cake — CSS is the frosting and decorations that make it irresistible! CSS (Cascading Style Sheets) controls how your HTML looks, from colors and fonts to layouts and animations.

Key concepts:
- CSS controls the visual presentation of HTML
- <style> tag in <head> contains CSS rules
- body selector styles the entire webpage
- font-family, background-color, color, and margin are common properties''',
            'starter_code': '''<!DOCTYPE html>
<html>
<head>
  <title>CSS Basics</title>
  <style>
    /* Add your CSS styles here */

  </style>
</head>
<body>
  <h1>Welcome to CSS!</h1>
  <h2>Making websites beautiful, one style at a time</h2>
  <p>Notice how the background and text colors change the whole mood of the page.</p>
</body>
</html>''',
            'sample_solution': '''<!DOCTYPE html>
<html>
<head>
  <title>CSS Basics</title>

  <style>
    /* This styles the entire body of the webpage */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Sets a clean font for all text */
      background-color: #f0f8ff; /* Adds a light blue background */
      color: #333; /* Sets default text color to dark grey */
      margin: 20px; /* Adds space around the content */
    }

    /* Style for all headings */
    h1, h2 {
      color: #1e90ff; /* Dodger blue color for headings */
    }
  </style>
</head>
<body>

  <h1>Welcome to CSS!</h1>
  <h2>Making websites beautiful, one style at a time</h2>

  <p>Notice how the background and text colors change the whole mood of the page.</p>

</body>
</html>''',
            'difficulty': 'beginner',
            'order_index': 6
        },
        {
            'title': 'Styling Lists Like a Pro',
            'question': 'Lists organize your content like a neat shelf. But plain bullet points are boring! Let\'s spice them up with custom colors, spacing, and styles.',
            'explanation': '''Lists organize your content like a neat shelf. But plain bullet points are boring! Let's spice them up with custom colors, spacing, and styles.

Key concepts:
- list-style-type changes bullet point styles
- padding-left adds space on the left
- margin-bottom adds space between list items
- color and font-weight style the text''',
            'starter_code': '''<!DOCTYPE html>
<html>
<head>
  <title>Styled Lists</title>
  <style>
    /* Add your list styles here */

  </style>
</head>
<body>
  <ul>
    <li>Learn HTML basics</li>
    <li>Master CSS styling</li>
    <li>Build interactive pages</li>
    <!-- Add your favorite item below -->
  </ul>
</body>
</html>''',
            'sample_solution': '''<!DOCTYPE html>
<html>
<head>
  <title>Styled Lists</title>

  <style>
    /* Style all unordered lists */
    ul {
      list-style-type: square; /* Changes bullets from default circles to squares */
      padding-left: 20px; /* Adds space on the left */
      color: green; /* Changes bullet text color */
      font-weight: bold; /* Makes list items bold */
    }

    /* Style all list items */
    li {
      margin-bottom: 10px; /* Adds space between list items */
    }
  </style>
</head>
<body>

  <ul>
    <li>Learn HTML basics</li>
    <li>Master CSS styling</li>
    <li>Build interactive pages</li>
    <li>Create amazing websites</li>
  </ul>

</body>
</html>''',
            'difficulty': 'beginner',
            'order_index': 7
        },
        {
            'title': 'Perfect Your Navbar',
            'question': 'Your navbar is your website\'s compass. Let\'s style it so users can easily navigate while making it visually sleek.',
            'explanation': '''Your navbar is your website's compass. Let's style it so users can easily navigate while making it visually sleek.

Key concepts:
- nav element creates semantic navigation
- background-color and overflow style the navbar container
- float: left aligns links horizontally
- :hover pseudo-class creates interactive effects''',
            'starter_code': '''<!DOCTYPE html>
<html>
<head>
  <title>Navbar Styling</title>
  <style>
    /* Add your navbar styles here */

  </style>
</head>
<body>
  <nav>
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</body>
</html>''',
            'sample_solution': '''<!DOCTYPE html>
<html>
<head>
  <title>Navbar Styling</title>

  <style>
    /* Style the navigation bar */
    nav {
      background-color: #333; /* Dark background */
      overflow: hidden; /* Clear floats */
      padding: 10px 0;
    }

    /* Style the links inside the navbar */
    nav a {
      color: white; /* White text color */
      text-decoration: none; /* Remove underline */
      padding: 14px 20px; /* Spacing around links */
      float: left; /* Align links horizontally */
      font-weight: bold;
      font-family: Arial, sans-serif;
    }

    /* Change link color on hover */
    nav a:hover {
      background-color: #575757; /* Dark grey background on hover */
    }
  </style>
</head>
<body>

  <nav>
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>

</body>
</html>''',
            'difficulty': 'intermediate',
            'order_index': 8
        },
        {
            'title': 'Beautiful Sections with Classes and Divs',
            'question': 'Websites are like stories broken into chapters. Sections and divisions help organize content — now let\'s style them!',
            'explanation': '''Websites are like stories broken into chapters. Sections and divisions (<section>, <div>) help organize content — now let's style them!

Key concepts:
- section selector styles all section elements
- background-color, padding, margin create visual separation
- border-radius creates rounded corners
- box-shadow adds depth and visual interest''',
            'starter_code': '''<!DOCTYPE html>
<html>
<head>
  <title>Styled Sections</title>
  <style>
    /* Add your section styles here */

  </style>
</head>
<body>
  <section>
    <h2>About Our Journey</h2>
    <p>This section tells a story about learning web development.</p>
  </section>

  <section>
    <h2>Next Steps</h2>
    <p>What you will learn in the upcoming exercises.</p>
  </section>
</body>
</html>''',
            'sample_solution': '''<!DOCTYPE html>
<html>
<head>
  <title>Styled Sections</title>

  <style>
    /* Style all sections */
    section {
      background-color: #e0f7fa; /* Light cyan background */
      padding: 20px; /* Space inside section */
      margin-bottom: 15px; /* Space below each section */
      border-radius: 8px; /* Rounded corners */
      box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Subtle shadow */
    }

    /* Style section headings */
    section h2 {
      color: #00796b; /* Teal color */
      font-family: 'Verdana', sans-serif;
    }
  </style>
</head>
<body>

  <section>
    <h2>About Our Journey</h2>
    <p>This section tells a story about learning web development.</p>
  </section>

  <section>
    <h2>Next Steps</h2>
    <p>What you will learn in the upcoming exercises.</p>
  </section>

</body>
</html>''',
            'difficulty': 'intermediate',
            'order_index': 9
        },
        {
            'title': 'Footer Fun',
            'question': 'The footer is like the sign-off in a letter. Let\'s make it look friendly and clear with simple styling.',
            'explanation': '''The footer is like the sign-off in a letter. Let's make it look friendly and clear with simple styling.

Key concepts:
- footer element creates semantic footer content
- position: fixed keeps footer at bottom of viewport
- text-align: center centers the content
- width: 100% makes footer span full width''',
            'starter_code': '''<!DOCTYPE html>
<html>
<head>
  <title>Footer Styling</title>
  <style>
    /* Add your footer styles here */

  </style>
</head>
<body>
  <footer>
    &copy; 2025 TechLearn Internship Challenge
  </footer>
</body>
</html>''',
            'sample_solution': '''<!DOCTYPE html>
<html>
<head>
  <title>Footer Styling</title>

  <style>
    /* Style the footer element */
    footer {
      background-color: #1e90ff; /* Dodger blue */
      color: white; /* White text */
      text-align: center; /* Center content */
      padding: 15px 0; /* Vertical padding */
      position: fixed; /* Fix footer at bottom */
      width: 100%; /* Full width */
      bottom: 0; /* Stick to bottom */
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }
  </style>
</head>
<body>

  <footer>
    &copy; 2025 TechLearn Internship Challenge
  </footer>

</body>
</html>''',
            'difficulty': 'beginner',
            'order_index': 10
        }
    ]

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()

            # Clear existing exercises first
            cursor.execute("DELETE FROM exercises")
            print("Cleared existing exercises...")

            # Insert new exercises
            for exercise in exercises:
                cursor.execute('''
                    INSERT INTO exercises (title, question, explanation, starter_code, sample_solution, difficulty, order_index)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', (
                    exercise['title'],
                    exercise['question'],
                    exercise['explanation'],
                    exercise['starter_code'],
                    exercise['sample_solution'],
                    exercise['difficulty'],
                    exercise['order_index']
                ))
            conn.commit()
            print("Exercises populated successfully!")
        except Error as e:
            print(f"Error populating exercises: {e}")
        finally:
            cursor.close()
            conn.close()

if __name__ == '__main__':
    populate_exercises()